import { execSync } from 'node:child_process';
import { checkEnv } from '../env.js';
import { log, colors, banner, playSound, promptConfirm, promptSelect, openAntigravity } from '../terminal.js';
import { runGit } from './git.js';

export async function runTest(subcommand, options = {}) {
  const env = checkEnv();
  const pm = env.packageManagers.preferred || 'pnpm';

  let mode = subcommand ? String(subcommand).toLowerCase() : null;

  // Interactive Test Menu prompt if mode is not specified
  if (!mode && options.interactive && !options.quiet) {
    const testMenuOptions = [
      { label: 'Full CI Quality Gate', value: 'ci', desc: 'sequential type-checking, Vitest tests, and build' },
      { label: 'Watch Unit Tests', value: 'watch', desc: 'run Vitest in interactive watch mode' },
      { label: 'Type Check Only', value: 'typecheck', desc: 'run TypeScript type verification' },
      { label: 'Build SDK Bundles', value: 'build', desc: 'run dual ESM/CJS build via tsup' },
    ];

    mode = await promptSelect('Test Quality Gate', testMenuOptions, { showBanner: !options.quiet });

    if (mode === 'exit') {
      return { success: true, escaped: true };
    }
  }

  if (!mode) {
    mode = 'ci';
  }

  // Watch mode workflow
  if (mode === 'watch') {
    const cmd = `${pm} --filter @skiddle/sdk test:watch`;
    log.info(`Running Vitest unit test suite in watch mode...`);
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      return true;
    } catch {
      log.divider();
      log.warn('Test watch session stopped.');
      return false;
    }
  }

  // Typecheck mode
  if (mode === 'typecheck') {
    const cmd = `${pm} --filter @skiddle/sdk typecheck`;
    log.info('Running TypeScript typecheck...');
    log.divider();

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('TypeScript typecheck passed with zero errors.');
      playSound('pass');
      return true;
    } catch {
      log.error('TypeScript typecheck failed.');
      playSound('fail');
      return false;
    }
  }

  // Build mode
  if (mode === 'build') {
    const cmd = `${pm} --filter @skiddle/sdk build`;
    log.info('Building Skiddle SDK (Dual ESM + CJS + .d.ts)...');
    log.divider();

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('Build completed successfully.');
      playSound('pass');
      return true;
    } catch {
      log.error('Build failed.');
      playSound('fail');
      return false;
    }
  }

  // CI Pipeline workflow (mode === "ci" || mode === "pipeline" || default)
  const description = 'Pre-Merge CI Quality Gate Pipeline (Typecheck -> Unit Tests -> Build)';
  log.info(`${colors.bold}${description}${colors.reset}`);
  log.divider();

  const pipeline = [
    { title: 'TypeScript Typecheck', cmd: `${pm} --filter @skiddle/sdk typecheck` },
    { title: 'Vitest Unit Tests', cmd: `${pm} --filter @skiddle/sdk test` },
    { title: 'Dual ESM/CJS Build', cmd: `${pm} --filter @skiddle/sdk build` },
  ];

  if (options.dryRun) {
    pipeline.forEach((p) => log.info(`[DRY-RUN] Would execute: ${colors.cyan}${p.cmd}${colors.reset}`));
    return true;
  }

  const tStart = Date.now();
  for (let i = 0; i < pipeline.length; i++) {
    const step = pipeline[i];
    log.step(i + 1, pipeline.length, `${colors.bold}${step.title}${colors.reset}`);

    try {
      execSync(step.cmd, { stdio: 'inherit', shell: true });
      console.log(`     ${colors.brightGreen}✔${colors.reset} Passed: ${step.title}\n`);
    } catch {
      log.divider();
      log.error(`CI Quality Gate failed during step: ${step.title}`);
      playSound('fail', { count: 2, loud: true });

      if (options.interactive) {
        const debugChoice = await promptConfirm('Would you like to debug in Antigravity?', true);
        if (debugChoice) {
          log.info('Opening Antigravity app...');
          openAntigravity('skiddle', `Fix Pre-Merge CI Quality Gate Pipeline: Failure in ${step.title}`);
        }
      }
      return false;
    }
  }

  const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
  log.divider();
  log.success(`Pre-Merge CI Quality Gate completed all stages cleanly (${elapsed}s).`);
  playSound('pass');

  if (options.interactive) {
    const gitChoice = await promptConfirm('CI clean! Would you like to check Git status or commit?', false);
    if (gitChoice) {
      await runGit({ ...options, interactive: true });
    }
  }
  return true;
}
