import { Command } from 'commander';
import pc from 'picocolors';
import prompts from 'prompts';
import { showBanner } from './banner.js';
import { doctorCommand } from './commands/doctor.js';
import { searchEventsCommand, getEventCommand } from './commands/events.js';
import { runScenariosCommand } from './commands/scenarios.js';
import { benchmarkCommand } from './commands/benchmark.js';

export async function runCli() {
  showBanner();

  const program = new Command();

  program
    .name('nx')
    .description('NX° Developer Experience — Modern Skiddle API & Front-End Developer Toolkit')
    .version('1.0.0');

  program
    .command('doctor')
    .description('Validate API key, environment sanity, and test API v1/v3 endpoint health')
    .option('-k, --key <key>', 'Skiddle API key override')
    .action(doctorCommand);

  program
    .command('events [keyword]')
    .description('Search and inspect live Skiddle events')
    .option('-k, --key <key>', 'Skiddle API key override')
    .option('-l, --limit <number>', 'Number of listings to return', '5')
    .option('-c, --eventcode <code]', 'Event code filter (e.g. LIVE, CLUB, FEST, COMEDY)')
    .option('-r, --radius <miles>', 'Search radius in miles')
    .option('--latitude <lat>', 'Latitude for geo search')
    .option('--longitude <lon>', 'Longitude for geo search')
    .option('--dev', 'Enable debug logging')
    .action((keyword, opts) => searchEventsCommand(keyword, opts));

  program
    .command('event <id>')
    .description('Fetch and display single event listing by ID')
    .option('-k, --key <key>', 'Skiddle API key override')
    .option('--dev', 'Enable debug logging')
    .action((id, opts) => getEventCommand(id, opts));

  program
    .command('scenarios [id]')
    .description('Run the 10 classic Skiddle test scenarios (mirrors PHP loadTest)')
    .option('-k, --key <key>', 'Skiddle API key override')
    .action((id, opts) => runScenariosCommand(id, opts));

  program
    .command('benchmark')
    .description('Run concurrent latency and throughput benchmark against Skiddle endpoints')
    .option('-k, --key <key>', 'Skiddle API key override')
    .option('-c, --concurrency <number>', 'Concurrent workers', '5')
    .option('-r, --requests <number>', 'Total requests', '20')
    .action(benchmarkCommand);

  program
    .command('interactive')
    .description('Launch interactive terminal menu')
    .action(async () => {
      const response = await prompts({
        type: 'select',
        name: 'action',
        message: 'Select an NX° Developer Experience action:',
        choices: [
          { title: '🔍 Search Events', value: 'events' },
          { title: '🩺 Run Diagnostics (Doctor)', value: 'doctor' },
          { title: '🧪 Run Legacy Test Scenarios', value: 'scenarios' },
          { title: '⚡ Run Performance Benchmark', value: 'benchmark' },
        ],
      });

      if (response.action === 'doctor') {
        await doctorCommand({});
      } else if (response.action === 'events') {
        const query = await prompts({
          type: 'text',
          name: 'keyword',
          message: 'Enter keyword to search (or press Enter for trending):',
        });
        await searchEventsCommand(query.keyword, { limit: 5 });
      } else if (response.action === 'scenarios') {
        await runScenariosCommand(null, {});
      } else if (response.action === 'benchmark') {
        await benchmarkCommand({ requests: 10, concurrency: 3 });
      }
    });

  // If no arguments provided, show help
  if (process.argv.length <= 2) {
    program.outputHelp();
    console.log(pc.cyan('\n💡 Tip: Run `npm run cli -- interactive` or `node cli/bin/nx.js doctor` to get started!\n'));
    return;
  }

  await program.parseAsync(process.argv);
}
