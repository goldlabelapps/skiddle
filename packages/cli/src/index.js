import process from 'node:process';
import { colors, log, promptSelect, clearScreen, promptPostAction, VERSION } from './terminal.js';
import { printEnvSummary } from './env.js';
import { showHelp } from './commands/help.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { searchEventsCommand, getEventCommand } from './commands/events.js';
import { runScenariosCommand } from './commands/scenarios.js';
import { benchmarkCommand } from './commands/benchmark.js';
import { runTest } from './commands/test.js';
import { runGit } from './commands/git.js';

export const MAIN_MENU_OPTIONS = [
  { label: 'dev', value: 'dev', desc: 'start development server and watchers (pnpm dev)' },
  { label: 'events', value: 'events', desc: 'search and inspect live Skiddle events & ticket details' },
  { label: 'doctor', value: 'doctor', desc: 'diagnose environment, API credentials, and endpoint latency' },
  { label: 'scenarios', value: 'scenarios', desc: 'replay 10 classic Skiddle test scenarios (PHP test parity)' },
  { label: 'benchmark', value: 'benchmark', desc: 'concurrent latency and throughput benchmark (RPS & percentiles)' },
  { label: 'test', value: 'test', desc: 'pre-merge CI quality gate (typecheck, unit tests, bundle build)' },
  { label: 'git', value: 'git', desc: 'manage git workflow (status diffs, commit & push, pull request)' },
  { label: 'env', value: 'env', desc: 'inspect toolchain, Node runtime, and package manager strategy' },
  { label: 'help', value: 'help', desc: 'display Unix manual synopsis and CLI reference' },
];

/**
 * Parse CLI flags and positional arguments
 */
export function parseArgs(rawArgs) {
  const flags = {
    help: false,
    version: false,
    interactive: false,
    quiet: false,
    dryRun: false,
    yes: false,
    dev: false,
    key: null,
    limit: null,
    eventcode: null,
    radius: null,
    latitude: null,
    longitude: null,
    requests: null,
    concurrency: null,
    message: null,
  };

  const positional = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '-h' || arg === '--help') {
      flags.help = true;
    } else if (arg === '-v' || arg === '-V' || arg === '--version') {
      flags.version = true;
    } else if (arg === '-i' || arg === '--interactive') {
      flags.interactive = true;
    } else if (arg === '-q' || arg === '--quiet') {
      flags.quiet = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '-y' || arg === '--yes') {
      flags.yes = true;
    } else if (arg === '--dev') {
      flags.dev = true;
    } else if (arg === '-k' || arg === '--key' || arg.startsWith('--key=')) {
      if (arg.startsWith('--key=')) {
        flags.key = arg.split('=')[1];
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
        flags.key = rawArgs[i + 1];
        i++;
      }
    } else if (arg === '-l' || arg === '--limit' || arg.startsWith('--limit=')) {
      if (arg.startsWith('--limit=')) {
        flags.limit = arg.split('=')[1];
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
        flags.limit = rawArgs[i + 1];
        i++;
      }
    } else if (arg === '-c' || arg === '--eventcode' || arg.startsWith('--eventcode=')) {
      if (arg.startsWith('--eventcode=')) {
        flags.eventcode = arg.split('=')[1];
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
        flags.eventcode = rawArgs[i + 1];
        i++;
      }
    } else if (arg === '-r' || arg === '--radius' || arg.startsWith('--radius=')) {
      if (arg.startsWith('--radius=')) {
        flags.radius = arg.split('=')[1];
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
        flags.radius = rawArgs[i + 1];
        i++;
      }
    } else if (arg.startsWith('--latitude=')) {
      flags.latitude = arg.split('=')[1];
    } else if (arg === '--latitude' && i + 1 < rawArgs.length) {
      flags.latitude = rawArgs[i + 1];
      i++;
    } else if (arg.startsWith('--longitude=')) {
      flags.longitude = arg.split('=')[1];
    } else if (arg === '--longitude' && i + 1 < rawArgs.length) {
      flags.longitude = rawArgs[i + 1];
      i++;
    } else if (arg.startsWith('--requests=')) {
      flags.requests = arg.split('=')[1];
    } else if (arg === '--requests' && i + 1 < rawArgs.length) {
      flags.requests = rawArgs[i + 1];
      i++;
    } else if (arg.startsWith('--concurrency=')) {
      flags.concurrency = arg.split('=')[1];
    } else if (arg === '--concurrency' && i + 1 < rawArgs.length) {
      flags.concurrency = rawArgs[i + 1];
      i++;
    } else if (arg === '-m' || arg === '--message' || arg.startsWith('--message=') || arg.startsWith('-m=')) {
      if (arg.includes('=')) {
        flags.message = arg.split('=').slice(1).join('=');
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
        flags.message = rawArgs[i + 1];
        i++;
      }
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  return {
    command: positional[0] || null,
    subcommand: positional[1] || null,
    extra: positional.slice(2),
    flags,
  };
}

/**
 * Interactive main menu loop
 */
async function runInteractiveMenu(flags) {
  while (true) {
    if (!flags.quiet) {
      clearScreen();
    }

    const choice = await promptSelect('', MAIN_MENU_OPTIONS, { showBanner: !flags.quiet, isMainMenu: true });

    if (choice === 'exit') {
      console.log(`\n${colors.gold}${colors.bold}Bailed out safely, sir${colors.reset}\n`);
      break;
    }

    log.divider();

    switch (choice) {
      case 'dev': {
        const res = await devCommand({ ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'events': {
        const res = await searchEventsCommand(undefined, { ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'doctor':
        await doctorCommand({ ...flags, interactive: true });
        break;
      case 'scenarios': {
        const res = await runScenariosCommand(null, { ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'benchmark': {
        const res = await benchmarkCommand({ ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'test': {
        const res = await runTest(null, { ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'git': {
        const res = await runGit({ ...flags, interactive: true });
        if (res && typeof res === 'object' && res.escaped) continue;
        break;
      }
      case 'env':
        printEnvSummary();
        break;
      case 'help':
        showHelp();
        break;
    }

    log.divider();

    const nextAction = await promptPostAction();
    if (nextAction === 'exit') {
      console.log(`\n${colors.gold}${colors.bold}Bailed out safely, sir${colors.reset}\n`);
      break;
    }
  }
}

/**
 * Main entry point for CLI execution
 */
export async function runCli(rawArgs = process.argv.slice(2)) {
  try {
    const { command, subcommand, extra, flags } = parseArgs(rawArgs);

    if (flags.version) {
      console.log(`nx / skiddle-nx v${VERSION}`);
      return;
    }

    if (flags.help && !command) {
      showHelp();
      return;
    }

    // If no command is provided, launch interactive menu
    if (!command || flags.interactive) {
      await runInteractiveMenu(flags);
      return;
    }

    if (!flags.quiet) {
      clearScreen();
    }

    const cmdLower = command.toLowerCase();

    // Direct command routing
    switch (cmdLower) {
      case 'dev':
        await devCommand(flags);
        break;

      case 'events':
        await searchEventsCommand(subcommand || extra[0], {
          ...flags,
          limit: flags.limit,
          eventcode: flags.eventcode,
          radius: flags.radius,
          latitude: flags.latitude,
          longitude: flags.longitude,
        });
        break;

      case 'event':
        await getEventCommand(subcommand, flags);
        break;

      case 'doctor':
      case 'diagnostics':
        await doctorCommand(flags);
        break;

      case 'scenarios':
      case 'scenario':
        await runScenariosCommand(subcommand, flags);
        break;

      case 'benchmark':
      case 'bench':
        await benchmarkCommand({
          ...flags,
          requests: flags.requests,
          concurrency: flags.concurrency,
        });
        break;

      case 'test':
      case 'ci':
        await runTest(subcommand, flags);
        break;

      case 'git':
        await runGit({ ...flags, subcommand });
        break;

      case 'commit':
        await runGit({ ...flags, action: 'commit' });
        break;

      case 'pr':
      case 'pull-request':
        await runGit({ ...flags, action: 'pr' });
        break;

      case 'env':
        printEnvSummary();
        break;

      case 'help':
        showHelp();
        break;

      default:
        log.error(`Unknown command '${command}'.`);
        console.log(`Run ${colors.bold}pnpm cli help${colors.reset} for a list of available commands.\n`);
        process.exitCode = 1;
    }
  } catch (err) {
    if (err?.name === 'AbortError' || err?.code === 'ABORT_ERR' || err?.message?.includes('Aborted')) {
      console.log(`\n${colors.gold}${colors.bold}Bailed out safely, sir${colors.reset}\n`);
      return;
    }
    throw err;
  }
}
