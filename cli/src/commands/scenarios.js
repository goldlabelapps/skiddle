import pc from 'picocolors';
import { SkiddleSession, Events, SkiddleException } from 'skiddle-sdk';

export const SCENARIO_DEFS = [
  {
    id: 1,
    title: 'Events within 10 miles of Manchester',
    setup: (events) => {
      events.addCond('latitude', '53.4809500');
      events.addCond('longitude', '-2.2374300');
      events.addCond('radius', '10');
      events.addCond('limit', '5');
    },
  },
  {
    id: 2,
    title: 'Latest Club nights (random order)',
    setup: (events) => {
      events.addCond('eventcode', 'CLUB');
      events.addCond('order', 'random');
      events.addCond('limit', '5');
    },
  },
  {
    id: 3,
    title: 'Popular events trending now (goingto count)',
    setup: (events) => {
      events.addCond('order', 'goingto');
      events.addCond('limit', '5');
    },
  },
  {
    id: 4,
    title: 'Tribute Acts',
    setup: (events) => {
      events.addCond('keyword', 'Tribute');
      events.addCond('limit', '5');
    },
  },
  {
    id: 5,
    title: 'Events with tickets on sale',
    setup: (events) => {
      events.addCond('tickets', '1');
      events.addCond('limit', '5');
    },
  },
  {
    id: 6,
    title: 'Brand Showcase: Weird Science',
    setup: (events) => {
      events.addCond('keyword', 'Weird Science');
      events.addCond('limit', '5');
    },
  },
  {
    id: 7,
    title: 'Venue Showcase: Thekla, Bristol',
    setup: (events) => {
      events.addCond('keyword', 'Thekla');
      events.addCond('limit', '5');
    },
  },
];

export async function runScenariosCommand(scenarioId, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.error(pc.red('Error: Skiddle API key is required. Set SKIDDLE_API_KEY or use --key <apiKey>'));
    return;
  }

  const session = new SkiddleSession({ apiKey });
  const targets = scenarioId
    ? SCENARIO_DEFS.filter((s) => s.id === Number(scenarioId))
    : SCENARIO_DEFS;

  if (targets.length === 0) {
    console.error(pc.red(`Scenario #${scenarioId} not found. Available: 1 to ${SCENARIO_DEFS.length}`));
    return;
  }

  console.log(pc.bold(`\nExecuting ${targets.length} Skiddle Test Scenario(s) via TypeScript SDK:\n`));

  for (const s of targets) {
    const events = new Events();
    events.setSession(session);
    s.setup(events);

    const conditions = events.getConditions();
    const condStr = Object.entries(conditions)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');

    process.stdout.write(`  [Scenario #${s.id}] ${pc.bold(s.title)}\n`);
    process.stdout.write(`    Filters: ${pc.gray(condStr)}\n`);

    try {
      const t0 = Date.now();
      const res = await events.getListings();
      const elapsed = Date.now() - t0;
      const count = Array.isArray(res.results) ? res.results.length : 0;
      console.log(`    Result: ${pc.green('✔ SUCCESS')} (${count} items, ${elapsed}ms)\n`);
    } catch (err) {
      const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
      console.log(`    Result: ${pc.red('✖ FAILED')} (${msg})\n`);
    }
  }
}
