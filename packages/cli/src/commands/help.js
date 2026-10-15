import { banner, colors, log, VERSION } from '../terminal.js';

export function showHelp() {
  console.log(banner);
  console.log(`${colors.bold}${colors.brightWhite}NAME${colors.reset}`);
  console.log(`    ${colors.cyan}nx / skiddle-nx${colors.reset} — NX° Skiddle Developer Experience Toolkit\n`);

  console.log(`${colors.bold}${colors.brightWhite}SYNOPSIS${colors.reset}`);
  console.log(`    ${colors.bold}pnpm cli${colors.reset} [COMMAND] [OPTIONS]`);
  console.log(`    ${colors.bold}node ./cli/bin/nx.js${colors.reset} [COMMAND] [OPTIONS]\n`);

  console.log(`${colors.bold}${colors.brightWhite}MAIN MENU OPTIONS & EXPECTATIONS${colors.reset}`);
  console.log(`  Interactive mode (${colors.bold}pnpm cli${colors.reset}) provides access to the following main menu options:\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}events${colors.reset}          Search and inspect live Skiddle events`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Queries the Skiddle events API by keyword or trending,`);
  console.log(`                    displays rich event cards, and enables deep inspection or ticket browsing.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}doctor${colors.reset}          Environment and API connectivity diagnostics`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Inspects Node environment, validates API key presence,`);
  console.log(`                    and pings live Skiddle v1 & v3 endpoints with timing telemetry.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}scenarios${colors.reset}       Classic Skiddle test scenarios (PHP parity)`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Replays the 10 reference PHP test scenarios to guarantee`);
  console.log(`                    cross-SDK query and response parity with live timings.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}benchmark${colors.reset}       Latency and throughput performance benchmark`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Spawns concurrent workers against Skiddle API and reports`);
  console.log(`                    RPS throughput, average latency, and p50 / p95 / p99 percentiles.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}test${colors.reset}            Pre-merge CI quality gate pipeline`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Runs sequential checks including TypeScript type-checking,`);
  console.log(`                    Vitest unit tests, and production build bundle verification.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}git${colors.reset}             Git workflow manager`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Inspects uncommitted changes, stages and commits with conventional`);
  console.log(`                    messages, and opens a GitHub Pull Request in the browser.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}env${colors.reset}             Toolchain and runtime environment diagnostics`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Displays Node runtime version, package manager status,`);
  console.log(`                    and active Git repository state.\n`);

  console.log(`    ${colors.bold}${colors.brightGreen}help${colors.reset}            Display full command line reference`);
  console.log(`                    ${colors.dim}Expectation:${colors.reset} Prints this manual synopsis, command options, and examples.\n`);

  console.log(`${colors.bold}${colors.brightWhite}COMMAND SYNOPSIS LIST${colors.reset}`);
  console.log(`    ${colors.bold}${colors.brightGreen}events${colors.reset} [keyword]   Search live Skiddle events by keyword or filter`);
  console.log(`    ${colors.bold}${colors.brightGreen}event${colors.reset} <id>         Fetch and display single event listing by ID`);
  console.log(`    ${colors.bold}${colors.brightGreen}doctor${colors.reset}             Validate API key, environment sanity, and endpoint health`);
  console.log(`    ${colors.bold}${colors.brightGreen}scenarios${colors.reset} [id]     Replay 10 classic Skiddle test scenarios (or pick 1-10)`);
  console.log(`    ${colors.bold}${colors.brightGreen}benchmark${colors.reset}          Run concurrent latency and throughput benchmark`);
  console.log(`    ${colors.bold}${colors.brightGreen}test${colors.reset}               Run full CI quality pipeline (typecheck, tests, build)`);
  console.log(`    ${colors.bold}${colors.brightGreen}git${colors.reset} [action]        Git manager (${colors.dim}status, commit, pr${colors.reset})`);
  console.log(`    ${colors.bold}${colors.brightGreen}env${colors.reset}                Display toolchain and runtime diagnostics`);
  console.log(`    ${colors.bold}${colors.brightWhite}help${colors.reset}               Display this Unix manual synopsis\n`);

  console.log(`${colors.bold}${colors.brightWhite}OPTIONS & FLAGS${colors.reset}`);
  console.log(`    ${colors.cyan}-h, --help${colors.reset}              Show manual synopsis and command usage`);
  console.log(`    ${colors.cyan}-v, --version${colors.reset}           Output version number (v${VERSION})`);
  console.log(`    ${colors.cyan}-i, --interactive${colors.reset}       Launch interactive terminal menu loop`);
  console.log(`    ${colors.cyan}-q, --quiet${colors.reset}             Suppress decorative banners and verbose outputs`);
  console.log(`    ${colors.cyan}-k, --key <apiKey>${colors.reset}      Skiddle API key override`);
  console.log(`    ${colors.cyan}-l, --limit <num>${colors.reset}       Number of listings to return (default: 5)`);
  console.log(`    ${colors.cyan}-c, --eventcode <code>${colors.reset}   Event code filter (e.g. LIVE, CLUB, FEST, COMEDY)`);
  console.log(`    ${colors.cyan}-r, --radius <miles>${colors.reset}    Search radius in miles`);
  console.log(`    ${colors.cyan}--latitude <lat>${colors.reset}        Latitude for geo search`);
  console.log(`    ${colors.cyan}--longitude <lon>${colors.reset}       Longitude for geo search`);
  console.log(`    ${colors.cyan}--dev${colors.reset}                  Enable SDK debug mode and query inspect`);
  console.log(`    ${colors.cyan}--dry-run${colors.reset}               Print planned execution without network calls\n`);

  console.log(`${colors.bold}${colors.brightWhite}EXAMPLES${colors.reset}`);
  console.log(`    ${colors.dim}# 1. Launch interactive menu loop:${colors.reset}`);
  console.log(`    $ pnpm cli\n`);
  console.log(`    ${colors.dim}# 2. Search for events in Manchester:${colors.reset}`);
  console.log(`    $ pnpm cli events "Manchester" -l 5\n`);
  console.log(`    ${colors.dim}# 3. Validate API credentials and connectivity:${colors.reset}`);
  console.log(`    $ pnpm cli doctor\n`);
  console.log(`    ${colors.dim}# 4. Run performance benchmark with 10 concurrent workers:${colors.reset}`);
  console.log(`    $ pnpm cli benchmark -c 10 -r 50\n`);
  console.log(`    ${colors.dim}# 5. Run full CI quality verification:${colors.reset}`);
  console.log(`    $ pnpm cli test\n`);

  log.divider();
}
