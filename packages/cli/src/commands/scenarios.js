import { SkiddleSession, Events, SkiddleException } from '@skiddle/sdk';
import { log, colors, banner, promptSelect, playSound } from '../terminal.js';

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
  {
    id: 8,
    title: 'Festivals in the UK',
    setup: (events) => {
      events.addCond('eventcode', 'FEST');
      events.addCond('limit', '5');
    },
  },
  {
    id: 9,
    title: 'Comedy events in London',
    setup: (events) => {
      events.addCond('eventcode', 'COMEDY');
      events.addCond('latitude', '51.5074');
      events.addCond('longitude', '-0.1278');
      events.addCond('radius', '15');
      events.addCond('limit', '5');
    },
  },
  {
    id: 10,
    title: 'Live Music in Glasgow',
    setup: (events) => {
      events.addCond('eventcode', 'LIVE');
      events.addCond('latitude', '55.8642');
      events.addCond('longitude', '-4.2518');
      events.addCond('radius', '15');
      events.addCond('limit', '5');
    },
  },
];

export async function runScenariosCommand(idArg, options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    log.error('Skiddle API key is required. Set SKIDDLE_API_KEY or use --key <apiKey>');
    return false;
  }

  let selectedId = idArg ? parseInt(idArg, 10) : null;

  // Interactive Scenario Selection
  if (!selectedId && options.interactive) {
    const menuOptions = [
      { label: 'Run All 10 Reference Scenarios', value: 'all', desc: 'full cross-SDK PHP loadTest parity replay' },
      ...SCENARIO_DEFS.map((s) => ({
        label: `Scenario ${s.id}: ${s.title}`,
        value: String(s.id),
      })),
    ];

    const choice = await promptSelect('Scenarios Replay Menu', menuOptions);
    if (choice === 'exit') return { escaped: true };
    if (choice !== 'all') {
      selectedId = parseInt(choice, 10);
    }
  }

  const session = new SkiddleSession({ apiKey });
  const targets = selectedId
    ? SCENARIO_DEFS.filter((s) => s.id === selectedId)
    : SCENARIO_DEFS;

  if (targets.length === 0) {
    log.error(`Scenario ID ${selectedId} not found (must be 1-${SCENARIO_DEFS.length})`);
    return false;
  }

  log.info(`Executing ${targets.length} test scenario(s) (PHP LoadTest Parity)...`);
  log.divider();

  const results = [];
  const tTotalStart = Date.now();

  for (let i = 0; i < targets.length; i++) {
    const def = targets[i];
    log.step(i + 1, targets.length, `${colors.bold}${def.title}${colors.reset}`);

    const events = new Events();
    events.setSession(session);
    def.setup(events);

    const t0 = Date.now();
    try {
      const res = await events.getListings();
      const elapsed = Date.now() - t0;
      const count = Array.isArray(res.results)
        ? res.results.length
        : (Array.isArray(res.data) ? res.data.length : 0);
      results.push({ id: def.id, title: def.title, ok: true, count, elapsed });
      console.log(`     ${colors.brightGreen}✔${colors.reset} Passed (${elapsed}ms) — Returned ${count} event(s)`);
    } catch (err) {
      const elapsed = Date.now() - t0;
      const msg = err instanceof SkiddleException ? err.message : (err.message || String(err));
      results.push({ id: def.id, title: def.title, ok: false, error: msg, elapsed });
      console.log(`     ${colors.brightRed}✖${colors.reset} Failed (${elapsed}ms) — ${msg}`);
    }
  }

  const totalElapsed = Date.now() - tTotalStart;
  const passedCount = results.filter((r) => r.ok).length;
  const failedCount = results.length - passedCount;

  log.divider();
  if (failedCount === 0) {
    log.success(`All ${passedCount} scenarios passed successfully in ${totalElapsed}ms.`);
    playSound('pass');
    return true;
  } else {
    log.warn(`${passedCount}/${results.length} scenarios passed, ${failedCount} failed in ${totalElapsed}ms.`);
    playSound('fail');
    return false;
  }
}
