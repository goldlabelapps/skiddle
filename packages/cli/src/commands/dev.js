import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { checkEnv } from '../env.js';
import { log, colors } from '../terminal.js';

/**
 * Resolve the monorepo root directory
 * @returns {string}
 */
export function getMonorepoRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(dir, 'turbo.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

/**
 * Run pnpm dev across the monorepo
 * @param {object} [options]
 * @param {boolean} [options.dryRun]
 * @param {boolean} [options.quiet]
 * @param {boolean} [options.interactive]
 * @returns {Promise<{ success: boolean, dryRun?: boolean, error?: unknown }>}
 */
export async function devCommand(options = {}) {
  const env = checkEnv();
  const pm = env.packageManagers.preferred || 'pnpm';
  const rootDir = getMonorepoRoot();
  const cmd = `${pm} dev`;

  if (!options.quiet) {
    log.info(`Starting development server (${colors.cyan}${cmd}${colors.reset})...`);
    log.divider();
  }

  if (options.dryRun) {
    log.info(`[DRY-RUN] Would execute: ${colors.cyan}${cmd}${colors.reset} in ${colors.dim}${rootDir}${colors.reset}`);
    return { success: true, dryRun: true };
  }

  const sigintHandler = () => {};
  process.on('SIGINT', sigintHandler);

  try {
    const result = spawnSync(pm, ['dev'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    });

    if (result.error) {
      throw result.error;
    }

    return { success: result.status === 0 };
  } catch (err) {
    log.divider();
    log.warn('Development server stopped.');
    return { success: false, error: err };
  } finally {
    process.off('SIGINT', sigintHandler);
  }
}
