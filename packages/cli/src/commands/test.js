import { execSync } from 'node:child_process';
import { checkEnv } from '../env.js';
import { log, colors, playSound, promptConfirm, promptSelect, openAntigravity } from '../terminal.js';
import { runGit } from './git.js';

export async function runTest(subcommand, options = {}) {
  const env = checkEnv();
  const pm = env.packageManagers.preferred || 'pnpm';

  let mode = subcommand ? String(subcommand).toLowerCase() : null;

  // Interactive Test Menu prompt if mode is not specified
  if (!mode && options.interactive && !options.quiet) {
    const testMenuOptions = [
      { label: 'Full CI Quality Gate (GitHub Actions / Vercel Parity)', value: 'ci', desc: 'typecheck, lint, unit tests, E2E tests, PHP tests & full build' },
      { label: 'Unit Tests Only', value: 'unit', desc: 'run unit test suites across SDK, CLI & Web' },
      { label: 'End-to-End (E2E) Tests Only', value: 'e2e', desc: 'run E2E & contract suites across SDK, CLI & Web' },
      { label: 'PHP SDK Unit Tests', value: 'php', desc: 'run PHP syntax checks and unit tests' },
      { label: 'Typecheck & Lint Only', value: 'typecheck', desc: 'run monorepo TypeScript verification and linters' },
      { label: 'Watch Mode Tests', value: 'watch', desc: 'run Vitest in interactive watch mode' },
      { label: 'Full Production Build', value: 'build', desc: 'build @skiddle/sdk and Next.js 15 web app' },
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
    const cmd = `${pm} test:watch`;
    log.info(`Running Vitest test suite in watch mode...`);
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

  // Unit tests only mode
  if (mode === 'unit') {
    const cmd = `${pm} test:unit`;
    log.info('Running Monorepo Unit Test Suites (SDK, CLI, Web)...');
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('All Unit Test Suites passed.');
      playSound('pass');
      return true;
    } catch {
      log.error('Unit Test Suite failed.');
      playSound('fail');
      return false;
    }
  }

  // E2E tests only mode
  if (mode === 'e2e') {
    const cmd = `${pm} test:e2e`;
    log.info('Running Monorepo End-to-End (E2E) & Contract Test Suites...');
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('All End-to-End (E2E) Test Suites passed.');
      playSound('pass');
      return true;
    } catch {
      log.error('End-to-End (E2E) Test Suite failed.');
      playSound('fail');
      return false;
    }
  }

  // PHP tests only mode
  if (mode === 'php') {
    const cmd = `php -l php/autoloader.php && ${pm} test:php`;
    log.info('Running PHP SDK Syntax & Unit Test Suite...');
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('PHP SDK Unit Tests passed.');
      playSound('pass');
      return true;
    } catch {
      log.error('PHP SDK Unit Tests failed.');
      playSound('fail');
      return false;
    }
  }

  // Typecheck & Lint mode
  if (mode === 'typecheck' || mode === 'lint') {
    const cmd = `${pm} typecheck && ${pm} lint`;
    log.info('Running Monorepo TypeScript Typecheck & Architectural Linter...');
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('TypeScript typecheck & linting passed with zero errors.');
      playSound('pass');
      return true;
    } catch {
      log.error('Typecheck or linting failed.');
      playSound('fail');
      return false;
    }
  }

  // Build mode
  if (mode === 'build') {
    const cmd = `${pm} build`;
    log.info('Running Full Monorepo Production Build (SDK + Next.js 15 Web App)...');
    log.divider();

    if (options.dryRun) {
      log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset}`);
      return true;
    }

    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      log.success('Production build completed successfully.');
      playSound('pass');
      return true;
    } catch {
      log.error('Production build failed.');
      playSound('fail');
      return false;
    }
  }

  // Full CI Pipeline workflow matching .github/workflows/ci.yml (mode === "ci" || mode === "pipeline" || default)
  const description = 'GitHub Actions & Vercel Deployment Quality Gate (Typecheck -> Lint -> Unit -> E2E -> PHP -> Build)';
  log.info(`${colors.bold}${description}${colors.reset}`);
  log.divider();

  const pipeline = [
    { title: 'Build Shared SDK (@skiddle/sdk)', cmd: `${pm} --filter @skiddle/sdk build` },
    { title: 'Monorepo Typecheck', cmd: `${pm} typecheck` },
    { title: 'Monorepo Linter', cmd: `${pm} lint` },
    { title: 'Unit Test Suite (SDK, CLI, Web)', cmd: `${pm} test:unit` },
    { title: 'End-to-End (E2E) & Contract Test Suite', cmd: `${pm} test:e2e` },
    { title: 'PHP SDK Syntax Check & Unit Tests', cmd: `php -l php/autoloader.php && ${pm} test:php` },
    { title: 'Full Production Build (Vercel Parity: SDK + Next.js 15 App)', cmd: `${pm} build` },
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
  log.success(`Pre-Merge CI Quality Gate completed all ${pipeline.length} stages cleanly (${elapsed}s).`);
  playSound('pass');

  if (options.interactive) {
    const gitChoice = await promptConfirm('CI clean! Would you like to check Git status or commit?', false);
    if (gitChoice) {
      await runGit({ ...options, interactive: true });
    }
  }
  return true;
}
