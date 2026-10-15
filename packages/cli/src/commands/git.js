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

/**
 * Parse a raw git status porcelain entry or plain file path
 * @param {string} line
 * @returns {{ status: string, path: string }}
 */
export function parseFileLine(line) {
  const trimmed = String(line || '').trim();
  const match = trimmed.match(/^([A-Z?]{1,2})\s+(.+)$/);
  if (match) {
    let filePath = match[2].trim();
    if (filePath.includes(' -> ')) {
      filePath = filePath.split(' -> ')[1].trim();
    }
    return { status: match[1], path: filePath };
  }
  return { status: 'M', path: trimmed };
}

/**
 * Categorize a file path into domain, module, test, and documentation metadata
 * @param {string} filePath
 * @returns {{ area: string, module: string, isTest: boolean, isDoc: boolean }}
 */
export function categorizeFile(filePath) {
  const norm = String(filePath || '').replace(/\\/g, '/').trim();
  const isTest = norm.includes('test') || norm.endsWith('.test.ts') || norm.endsWith('.test.js') || norm.endsWith('Test.php');
  const isDoc = norm.endsWith('.md') || norm.startsWith('docs/');

  let area = 'root';
  if (norm.startsWith('cli/') || norm.startsWith('apps/cli/') || norm.startsWith('packages/cli/')) area = 'cli';
  else if (norm.startsWith('apps/')) area = 'app';
  else if (norm.startsWith('javascript/') || norm.startsWith('packages/sdk/') || (norm.startsWith('packages/') && !norm.startsWith('packages/cli/'))) area = 'js';
  else if (norm.startsWith('php/')) area = 'php';
  else if (norm.startsWith('docs/')) area = 'docs';
  else if (norm.startsWith('.github/')) area = 'ci';

  const filename = norm.split('/').pop() || '';
  let rawName = filename.replace(/\.[^.]+$/, '');
  rawName = rawName.replace(/Test$/, '').replace(/\.test$/, '');
  if (rawName.startsWith('Skiddle')) {
    rawName = rawName.slice(7);
  }
  let module = rawName.toLowerCase();
  if (['index', 'package', 'readme', 'autoloader', 'tsup.config'].includes(module)) {
    module = '';
  }

  return { area, module, isTest, isDoc };
}

/**
 * Auto-generate a relevant conventional commit title and message body
 * @param {string[]} fileList
 * @returns {{ title: string, body: string, fullMessage: string, type: string, scope: string, subject: string }}
 */
export function generateCommitMessage(fileList = []) {
  if (!fileList || fileList.length === 0) {
    return {
      title: 'chore: update repository files',
      body: '',
      fullMessage: 'chore: update repository files',
      type: 'chore',
      scope: '',
      subject: 'update repository files',
    };
  }

  const parsed = fileList.map(parseFileLine).filter((f) => f.path);
  if (parsed.length === 0) {
    return {
      title: 'chore: update repository files',
      body: '',
      fullMessage: 'chore: update repository files',
      type: 'chore',
      scope: '',
      subject: 'update repository files',
    };
  }

  const areas = new Set();
  const modules = new Set();
  let allDocs = true;
  let allTests = true;
  let hasAdded = false;
  let hasDeleted = false;
  let hasModified = false;

  for (const file of parsed) {
    const cat = categorizeFile(file.path);
    if (!cat.isDoc) allDocs = false;
    if (!cat.isTest) allTests = false;

    if (cat.area) areas.add(cat.area);
    if (cat.module) modules.add(cat.module);

    if (file.status.includes('?') || file.status.includes('A')) hasAdded = true;
    if (file.status.includes('D')) hasDeleted = true;
    if (file.status.includes('M')) hasModified = true;
  }

  // 1. Infer commit type
  let type = 'chore';
  if (allDocs) {
    type = 'docs';
  } else if (allTests) {
    type = 'test';
  } else if (hasAdded && !hasModified && !hasDeleted) {
    type = 'feat';
  } else if (hasAdded && hasModified) {
    type = 'feat';
  } else if (hasDeleted && !hasAdded) {
    type = 'refactor';
  } else if (hasModified) {
    if (areas.has('cli') || areas.has('js') || areas.has('php')) {
      type = 'feat';
    } else {
      type = 'chore';
    }
  }

  // 2. Infer commit scope
  let scope = '';
  const filteredAreas = Array.from(areas).filter((a) => a !== 'root');
  if (allDocs) {
    scope = '';
  } else if (filteredAreas.length === 1) {
    scope = filteredAreas[0];
  } else if (filteredAreas.length === 2 && filteredAreas.includes('js') && filteredAreas.includes('php')) {
    scope = 'sdk';
  } else if (filteredAreas.length > 0 && filteredAreas.length <= 2) {
    scope = filteredAreas.join(',');
  } else if (filteredAreas.length > 2) {
    scope = 'core';
  }

  // 3. Infer subject
  const moduleList = Array.from(modules).filter(Boolean).slice(0, 3);
  let action = hasAdded && !hasModified ? 'add' : 'update';
  if (type === 'test') action = 'test';
  if (type === 'docs') action = 'update';
  if (type === 'refactor') action = 'refactor';

  let subject = '';
  if (type === 'docs') {
    subject = moduleList.length > 0 ? `${action} ${moduleList.join(' and ')} documentation` : 'update documentation';
  } else if (moduleList.length === 1) {
    subject = `${action} ${moduleList[0]} functionality`;
  } else if (moduleList.length === 2) {
    subject = `${action} ${moduleList[0]} and ${moduleList[1]}`;
  } else if (moduleList.length >= 3) {
    subject = `${action} ${moduleList[0]}, ${moduleList[1]} and related modules`;
  } else if (scope) {
    subject = `${action} ${scope} components`;
  } else {
    subject = `${action} repository files`;
  }

  const prefix = scope ? `${type}(${scope}):` : `${type}:`;
  const title = `${prefix} ${subject}`;

  // 4. Generate Body Summary
  const bodyLines = parsed.slice(0, 10).map((f) => `• ${f.status} ${f.path}`);
  if (parsed.length > 10) {
    bodyLines.push(`• ... and ${parsed.length - 10} more files`);
  }
  const body = bodyLines.join('\n');
  const fullMessage = `${title}\n\n${body}`;

  return { title, body, fullMessage, type, scope, subject };
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

    const generated = generateCommitMessage(uncommitted);

    let message = options.message || options.title;
    if (!message && options.interactive) {
      log.info(`Auto-generated suggestion: ${colors.gold}${generated.title}${colors.reset}`);
      message = await promptInput('commit message (press Enter to accept)', generated.title);
      if (message === 'exit') return { escaped: true };
    }
    if (!message) {
      message = generated.title;
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
