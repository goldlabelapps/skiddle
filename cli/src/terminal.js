import readline from 'node:readline/promises';
import { emitKeypressEvents } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

// ANSI color escape sequences
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  gold: '\x1b[38;5;220m',
};

export function getMonorepoVersion() {
  try {
    let dir = process.cwd();
    while (dir !== path.dirname(dir)) {
      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.version) return pkg.version;
      }
      dir = path.dirname(dir);
    }
  } catch {}
  return '1.0.0';
}

export const VERSION = getMonorepoVersion();

export const banner = `
${colors.gold}  ╭───────────────────────────────────────────────────────────────────╮${colors.reset}
${colors.gold}  │${colors.reset}  ${colors.bold}${colors.brightWhite}NX° Skiddle${colors.reset} ${colors.dim}${colors.cyan}v${VERSION}${colors.reset} ${colors.gold}•${colors.reset} ${colors.cyan}Developer Experience Toolkit${colors.reset}             ${colors.gold}│${colors.reset}
${colors.gold}  ╰───────────────────────────────────────────────────────────────────╯${colors.reset}
`;

let hasWarningsOrErrors = false;

export function markWarningOrError() {
  hasWarningsOrErrors = true;
}

export function resetWarningOrErrorState() {
  hasWarningsOrErrors = false;
}

export function hasLoggedWarningsOrErrors() {
  return hasWarningsOrErrors;
}

if (typeof console !== 'undefined') {
  const origWarn = console.warn;
  const origError = console.error;
  if (origWarn && !origWarn.__nx_wrapped) {
    console.warn = function (...args) {
      markWarningOrError();
      return origWarn.apply(this, args);
    };
    console.warn.__nx_wrapped = true;
  }
  if (origError && !origError.__nx_wrapped) {
    console.error = function (...args) {
      markWarningOrError();
      return origError.apply(this, args);
    };
    console.error.__nx_wrapped = true;
  }
}

export function clearScreen(force = false) {
  if (process.stdout.isTTY && process.env.NODE_ENV !== 'test') {
    if (!force && hasWarningsOrErrors) {
      hasWarningsOrErrors = false;
      return;
    }
    hasWarningsOrErrors = false;
    process.stdout.write('\x1Bc');
  } else {
    hasWarningsOrErrors = false;
  }
}

/**
 * Cross-platform helper to launch the default web browser at the specified URL
 * @param {string} url
 */
export function openBrowser(url) {
  if (process.env.NODE_ENV === 'test') return;
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  try {
    if (isMac) {
      import('node:child_process').then(({ spawn }) => {
        spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
      });
    } else if (isWindows) {
      import('node:child_process').then(({ spawn }) => {
        spawn('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref();
      });
    } else {
      import('node:child_process').then(({ spawn }) => {
        spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
      });
    }
  } catch {}
}

/**
 * Cross-platform helper to bounce dock icon or flash taskbar in host terminal
 * @param {number} [count=1]
 */
export function bounceDock(count = 1) {
  if (process.env.NODE_ENV === 'test' || process.env.CI) return;
  try {
    const belSequence = '\x07'.repeat(Math.max(1, count));
    process.stdout.write(belSequence);
  } catch {}
}

/**
 * Cross-platform helper to play sound notifications on completion and bounce taskbar/dock icon
 * @param {"pass" | "fail"} [type="pass"]
 * @param {object} [options]
 * @param {number} [options.count=1]
 * @param {boolean} [options.loud=false]
 */
export function playSound(type = 'pass', options = {}) {
  if (process.env.NODE_ENV === 'test' || process.env.CI) return;

  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';

  const count = typeof options === 'object' && options ? (options.count ?? options.repeat ?? (options.twice ? 2 : 1)) : 1;
  const loud = typeof options === 'object' && options ? (options.loud || options.volume === 'loud' || options.volume > 1) : false;

  bounceDock(type === 'pass' ? 1 : count * 2);

  try {
    for (let i = 0; i < count; i++) {
      if (isMac) {
        const soundFile = type === 'pass'
          ? '/System/Library/Sounds/Glass.aiff'
          : '/System/Library/Sounds/Basso.aiff';
        const args = loud ? ['-v', '3', soundFile] : [soundFile];
        import('node:child_process').then(({ spawn }) => {
          spawn('afplay', args, { stdio: 'ignore', detached: true }).unref();
        });
      } else if (isWindows) {
        const sound = type === 'pass' ? 'Asterisk' : 'Hand';
        import('node:child_process').then(({ spawn }) => {
          spawn('powershell.exe', ['-c', `[System.Media.SystemSounds]::${sound}.Play()`], { stdio: 'ignore', detached: true }).unref();
        });
      }
    }
  } catch {}
}

/**
 * Cross-platform helper to open Antigravity application with a project and prompt
 * @param {string} [project="skiddle"]
 * @param {string} [prompt="Please find and fix any errors or warnings in the Skiddle codebase"]
 * @returns {boolean}
 */
export function openAntigravity(project = 'skiddle', prompt = 'Please find and fix any errors or warnings in the Skiddle codebase') {
  if (process.env.NODE_ENV === 'test') return true;

  const encodedPrompt = encodeURIComponent(prompt);
  const encodedProject = encodeURIComponent(project);
  const url = `antigravity://open?project=${encodedProject}&prompt=${encodedPrompt}`;

  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';

  try {
    if (isMac) {
      import('node:child_process').then(({ spawn }) => {
        spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
      });
    } else if (isWindows) {
      import('node:child_process').then(({ spawn }) => {
        spawn('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref();
      });
    } else {
      import('node:child_process').then(({ spawn }) => {
        spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
      });
    }
    return true;
  } catch {
    return false;
  }
}

const radioAcknowledgements = ['Roger', 'WILCO'];
const errorExpletives = ['Oh bollocks', 'Shit', 'Bollocks', 'Oh shit', 'Bugger'];

export const log = {
  info: (msg) => {
    const ack = radioAcknowledgements[Math.floor(Math.random() * radioAcknowledgements.length)];
    console.log(`  ${colors.bold}${ack}:${colors.reset} ${msg}`);
  },
  success: (msg) => console.log(`  ${colors.bold}Tally-ho:${colors.reset} ${colors.bold}${msg}${colors.reset}`),
  warn: (msg) => {
    markWarningOrError();
    console.log(`  ${colors.yellow}Stand by:${colors.reset} ${colors.yellow}${msg}${colors.reset}`);
  },
  error: (msg) => {
    markWarningOrError();
    const expletive = errorExpletives[Math.floor(Math.random() * errorExpletives.length)];
    console.log(`  ${colors.red}${colors.bold}${expletive}:${colors.reset} ${colors.red}${colors.bold}${msg}${colors.reset}`);
  },
  step: (step, total, msg) => console.log(`${colors.dim}[${step}/${total}]${colors.reset}  ${colors.bold}Bandit:${colors.reset} ${msg}`),
  highlight: (label, value) => console.log(`   ${colors.dim}•${colors.reset} ${colors.bold}${label}:${colors.reset} ${colors.cyan}${value}${colors.reset}`),
  raw: (msg) => console.log(msg),
  divider: () => console.log(`${colors.gray}─────────────────────────────────────────────────────────────────${colors.reset}`),
};

export function createPrompt() {
  const rl = readline.createInterface({ input, output });
  return rl;
}

export function exitMenu() {
  console.log(`\n${colors.gold}${colors.bold}Bailed out safely, sir${colors.reset}\n`);
  if (input.isTTY && typeof input.setRawMode === 'function') {
    input.setRawMode(false);
  }
  process.exit(0);
}

/**
 * Interactive single selection menu
 * @param {string} title
 * @param {Array<{ label: string, value: string, desc?: string }>} options
 * @param {object} [config]
 * @param {boolean} [config.showBanner]
 * @param {boolean} [config.isMainMenu]
 * @returns {Promise<string>}
 */
export async function promptSelect(title, options, config = {}) {
  const rl = createPrompt();
  const supportsRawInput = input.isTTY && typeof input.setRawMode === 'function';
  let isEscaped = false;

  const handleKeypress = (_character, key) => {
    if (key?.name === 'escape') {
      if (config.isMainMenu) {
        exitMenu();
      } else {
        isEscaped = true;
        rl.close();
      }
    }
  };

  try {
    if (supportsRawInput) {
      emitKeypressEvents(input);
      input.setRawMode(true);
      input.on('keypress', handleKeypress);
    }

    const printMenu = () => {
      if (config.showBanner) {
        console.log(banner);
      }
      if (title) {
        console.log(`\n${colors.bold}${colors.brightWhite}${title}${colors.reset} ${colors.dim}(radio channel)${colors.reset}`);
      }
      options.forEach((opt, idx) => {
        const num = `${colors.brightCyan}${idx + 1}${colors.reset}`;
        const desc = opt.desc ? ` ${colors.dim}— ${opt.desc}${colors.reset}` : '';
        console.log(`  [${num}] ${colors.bold}${opt.label}${colors.reset}${desc}`);
      });
      console.log(`  [${colors.gray}0${colors.reset}] ${colors.gray}${config.isMainMenu ? 'Exit' : 'Back'}${colors.reset}`);
    };

    printMenu();

    while (true) {
      let answer;
      try {
        answer = await rl.question(`\n${colors.bold}Your orders, Wing Commander?${colors.reset} Select option (1-${options.length}, or 0 to exit): `);
      } catch (err) {
        if (isEscaped) return 'exit';
        if (err?.name === 'AbortError' || err?.code === 'ABORT_ERR' || err?.message?.includes('Aborted')) {
          if (config.isMainMenu) {
            exitMenu();
          } else {
            return 'exit';
          }
        }
        throw err;
      }

      if (isEscaped) return 'exit';

      const trimmed = answer.trim();
      if (trimmed === '0' || trimmed.toLowerCase() === 'q' || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'b' || trimmed.toLowerCase() === 'back') {
        if (config.isMainMenu) {
          exitMenu();
        } else {
          return 'exit';
        }
      }

      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        return options[num - 1].value;
      }

      clearScreen();
      printMenu();
      log.warn(`waiting for your decision, sir '${trimmed}'. Please enter a number between 1 and ${options.length}.`);
    }
  } finally {
    if (supportsRawInput) {
      input.off('keypress', handleKeypress);
      input.setRawMode(false);
    }
    rl.close();
  }
}

/**
 * Text input prompt with fallback default
 * @param {string} question
 * @param {string} defaultValue
 * @returns {Promise<string>}
 */
export async function promptInput(question, defaultValue = '') {
  const rl = createPrompt();
  const supportsRawInput = input.isTTY && typeof input.setRawMode === 'function';
  let isEscaped = false;

  const handleKeypress = (_character, key) => {
    if (key?.name === 'escape') {
      isEscaped = true;
      rl.close();
    }
  };

  try {
    if (supportsRawInput) {
      emitKeypressEvents(input);
      input.setRawMode(true);
      input.on('keypress', handleKeypress);
    }

    const hint = defaultValue ? ` ${colors.dim}(default: ${defaultValue})${colors.reset}` : '';
    const answer = await rl.question(`${colors.brightCyan}?${colors.reset} ${colors.bold}Wing Commander, ${question}${colors.reset}${hint}: `);
    if (isEscaped) return 'exit';
    const trimmed = answer.trim();
    return trimmed ? trimmed : defaultValue;
  } catch (err) {
    if (isEscaped) return 'exit';
    if (err?.name === 'AbortError' || err?.code === 'ABORT_ERR' || err?.message?.includes('Aborted')) {
      exitMenu();
    }
    throw err;
  } finally {
    if (supportsRawInput) {
      input.off('keypress', handleKeypress);
      input.setRawMode(false);
    }
    rl.close();
  }
}

/**
 * Yes / No Confirmation prompt
 * @param {string} question
 * @param {boolean} defaultYes
 * @returns {Promise<boolean>}
 */
export async function promptConfirm(question, defaultYes = true) {
  const rl = createPrompt();
  try {
    const opts = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await rl.question(`${colors.brightYellow}?${colors.reset} ${colors.bold}${question}${colors.reset} ${colors.dim}${opts}${colors.reset}: `);
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return defaultYes;
    return trimmed === 'y' || trimmed === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * Post-action prompt displaying muted actions: hit Enter to continue or Esc to exit
 * @returns {Promise<"continue" | "exit">}
 */
export async function promptPostAction() {
  if (process.env.NODE_ENV === 'test' || !process.stdin.isTTY) {
    return 'continue';
  }

  return new Promise((resolve) => {
    process.stdout.write(`\n  ${colors.dim}[Enter] to continue  ·  [Esc] to exit${colors.reset}\n`);

    const wasRaw = process.stdin.isRaw;
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    const onData = (chunk) => {
      const str = chunk.toString();
      if (str === '\r' || str === '\n' || str === ' ') {
        cleanup();
        resolve('continue');
      } else if (str === '\u001b' || str.toLowerCase() === 'q') {
        cleanup();
        exitMenu();
      } else if (str === '\u0003') {
        cleanup();
        process.exit(0);
      }
    };

    const cleanup = () => {
      process.stdin.removeListener('data', onData);
      if (process.stdin.setRawMode && process.stdin.isTTY) {
        process.stdin.setRawMode(wasRaw || false);
      }
    };

    process.stdin.on('data', onData);
  });
}
