import { execSync } from 'node:child_process';
import { log, colors, banner, promptSelect, promptInput, promptConfirm, openBrowser, playSound } from '../terminal.js';

export function getUncommittedFiles() {
  try {
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (!statusOutput) return [];
    return statusOutput.split('\n').map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function displayUncommittedFiles(fileList) {
  if (fileList.length > 0) {
    log.info(`Detected ${fileList.length} uncommitted file${fileList.length > 1 ? 's' : ''}:`);
    fileList.forEach((file) => {
      console.log(`     ${colors.dim}•${colors.reset} ${colors.brightCyan}${file}${colors.reset}`);
    });
  } else {
    log.info('No uncommitted changes detected. Working tree is clean.');
  }
}

export async function runGit(options = {}) {
  const targetAction = options.action || options.subcommand;

  // Non-interactive git status
  if (!options.interactive && !targetAction) {
    displayUncommittedFiles(getUncommittedFiles());
    return true;
  }

  // Commit action
  if (targetAction === 'commit') {
    const uncommitted = getUncommittedFiles();
    if (uncommitted.length === 0) {
      log.info('Nothing to commit. Working tree is clean.');
      return true;
    }
    displayUncommittedFiles(uncommitted);

    let message = options.message || options.title;
    if (!message && options.interactive) {
      message = await promptInput('commit message', 'chore: update skiddle sdk');
      if (message === 'exit') return { escaped: true };
    }
    if (!message) {
      message = 'chore: update skiddle sdk';
    }

    try {
      execSync('git add -A', { stdio: 'inherit' });
      execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: 'inherit' });
      log.success('Changes committed successfully.');

      const pushChoice = options.interactive ? await promptConfirm('Push commit to remote origin?', true) : true;
      if (pushChoice) {
        execSync('git push', { stdio: 'inherit' });
        log.success('Pushed to remote origin.');
      }
      playSound('pass');
      return true;
    } catch (err) {
      log.error(`Git commit failed: ${err.message}`);
      playSound('fail');
      return false;
    }
  }

  // PR action
  if (targetAction === 'pr') {
    log.info('Preparing pull request...');
    try {
      const remote = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
      let repoUrl = remote;
      if (remote.startsWith('git@github.com:')) {
        repoUrl = 'https://github.com/' + remote.slice('git@github.com:'.length).replace(/\.git$/, '');
      } else if (remote.endsWith('.git')) {
        repoUrl = remote.slice(0, -4);
      }
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      const prUrl = `${repoUrl}/compare/${branch}?expand=1`;

      log.highlight('Pull Request URL', prUrl);
      if (options.interactive) {
        const openChoice = await promptConfirm('Open PR compare page in browser?', true);
        if (openChoice) {
          openBrowser(prUrl);
        }
      }
      return true;
    } catch (err) {
      log.error(`Failed to construct PR URL: ${err.message}`);
      return false;
    }
  }

  // Interactive Git Menu Loop
  while (true) {
    const uncommitted = getUncommittedFiles();
    const gitMenuOptions = [
      { label: `Status (${uncommitted.length} uncommitted file${uncommitted.length === 1 ? '' : 's'})`, value: 'status', desc: 'inspect current working tree diffs' },
      { label: 'Commit & Push Changes', value: 'commit', desc: 'stage all changes, commit, and push' },
      { label: 'Open Pull Request', value: 'pr', desc: 'compare branch and create PR on GitHub' },
    ];

    const choice = await promptSelect('Git Workflow Manager', gitMenuOptions);
    if (choice === 'exit') return { escaped: true };

    log.divider();
    if (choice === 'status') {
      displayUncommittedFiles(uncommitted);
    } else if (choice === 'commit') {
      await runGit({ ...options, action: 'commit' });
    } else if (choice === 'pr') {
      await runGit({ ...options, action: 'pr' });
    }
    log.divider();
    break;
  }
  return true;
}
