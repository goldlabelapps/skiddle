import { SkiddleSession, Events, SkiddleException } from '@skiddle/sdk';
import { log, colors, banner, playSound, promptConfirm, openAntigravity } from '../terminal.js';
import { printEnvSummary } from '../env.js';

export async function doctorCommand(options = {}) {
  if (!options.quiet) {
    console.log(banner);
  }

  printEnvSummary();

  console.log(`\n${colors.bold}${colors.brightWhite}Skiddle API Health & Connectivity Check${colors.reset}`);
  log.divider();

  // 1. API Key check
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    log.warn('Skiddle API Key: Not found in environment.');
    console.log(`  ${colors.dim}Set ${colors.bold}SKIDDLE_API_KEY${colors.reset}${colors.dim} in your environment or pass ${colors.cyan}--key <key>${colors.reset}`);
    console.log(`  ${colors.gray}Get a free developer key at: https://www.skiddle.com/api/join.php${colors.reset}\n`);
    playSound('fail');
    return false;
  }

  const maskedKey = apiKey.slice(0, 4) + '...' + apiKey.slice(-4);
  log.info(`API Key verified: ${colors.brightGreen}${maskedKey}${colors.reset}`);

  // 2. Connectivity check to API v3 & v1
  const session = new SkiddleSession({ apiKey, devMode: Boolean(options.dev) });
  const events = new Events();
  events.setSession(session);

  let allHealthy = true;

  // Test v3 instant-search
  try {
    const t0 = Date.now();
    events.addCond('limit', 1);
    const v3Res = await events.getListings();
    const v3Time = Date.now() - t0;
    log.success(`API v3 (Instant-Search): ${colors.brightGreen}ONLINE${colors.reset} (${v3Time}ms) — Total results indexed: ${v3Res.totalresults ?? 'N/A'}`);
  } catch (err) {
    allHealthy = false;
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    log.error(`API v3 (Instant-Search): FAILED — ${msg}`);
  }

  // Test single event listing query (v1 endpoint)
  try {
    const t1 = Date.now();
    // Test known popular event ID or recent
    events.clearConditions();
    events.addCond('limit', 1);
    const sampleRes = await events.getListings();
    const sampleId = sampleRes.results?.[0]?.id;
    if (sampleId) {
      const v1Res = await events.getListing(sampleId);
      const v1Time = Date.now() - t1;
      log.success(`API v1 (Event Details): ${colors.brightGreen}ONLINE${colors.reset} (${v1Time}ms) — Sample: "${v1Res.results?.eventname || sampleId}"`);
    } else {
      log.info(`API v1: Skipped (no seed event id found in index)`);
    }
  } catch (err) {
    allHealthy = false;
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    log.error(`API v1 (Event Details): FAILED — ${msg}`);
  }

  log.divider();

  if (allHealthy) {
    log.success('All Skiddle systems nominal and fully operational.');
    playSound('pass');
    return true;
  } else {
    log.warn('Some endpoints encountered connectivity issues.');
    playSound('fail', { count: 2 });

    if (options.interactive) {
      const debugChoice = await promptConfirm('Would you like to open Antigravity to inspect configuration?', false);
      if (debugChoice) {
        log.info('Opening Antigravity...');
        openAntigravity('skiddle', 'Investigate Skiddle API connectivity failure in doctorCommand');
      }
    }
    return false;
  }
}
