import { SkiddleSession, Events } from '@skiddle/sdk';
import { log, colors, banner, promptInput, playSound } from '../terminal.js';

export async function benchmarkCommand(options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    log.error('Skiddle API key is required. Set SKIDDLE_API_KEY or use --key <apiKey>');
    return false;
  }

  let totalRequests = Number(options.requests) || 20;
  let concurrency = Number(options.concurrency) || 5;

  if (options.interactive) {
    const reqInput = await promptInput('total number of requests to benchmark', String(totalRequests));
    if (reqInput === 'exit') return { escaped: true };
    totalRequests = Number(reqInput) || 20;

    const concInput = await promptInput('concurrent worker count', String(concurrency));
    if (concInput === 'exit') return { escaped: true };
    concurrency = Number(concInput) || 5;
  }

  log.info(`Starting NX° SDK Performance Benchmark:`);
  log.highlight('Total Requests', totalRequests);
  log.highlight('Concurrency Workers', concurrency);
  log.divider();

  const session = new SkiddleSession({ apiKey });
  const latencies = [];
  let successful = 0;
  let failed = 0;

  process.stdout.write('  Progress: ');

  const runSingle = async () => {
    const events = new Events();
    events.setSession(session);
    events.addCond('limit', 5);

    const t0 = Date.now();
    try {
      await events.getListings();
      const elapsed = Date.now() - t0;
      latencies.push(elapsed);
      successful++;
      process.stdout.write(`${colors.brightGreen}.${colors.reset}`);
    } catch {
      failed++;
      process.stdout.write(`${colors.brightRed}x${colors.reset}`);
    }
  };

  const queue = Array.from({ length: totalRequests });
  const overallStart = Date.now();

  let idx = 0;
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (idx < queue.length) {
      idx++;
      await runSingle();
    }
  });

  await Promise.all(workers);
  const totalDurationSec = (Date.now() - overallStart) / 1000;
  console.log('\n');

  latencies.sort((a, b) => a - b);
  const avg = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (successful / (totalDurationSec || 1)).toFixed(1);

  log.divider();
  console.log(`${colors.bold}${colors.brightWhite}Benchmark Telemetry Summary${colors.reset}`);
  log.highlight('Execution Duration', `${totalDurationSec.toFixed(2)}s`);
  log.highlight('Throughput', `${rps} requests/sec`);
  log.highlight('Success Rate', `${successful}/${totalRequests} (${((successful / totalRequests) * 100).toFixed(0)}%)`);
  log.highlight('Latency Average', `${avg}ms`);
  log.highlight('Latency p50 (Median)', `${p50}ms`);
  log.highlight('Latency p95', `${p95}ms`);
  log.highlight('Latency p99', `${p99}ms`);
  log.divider();

  if (failed === 0) {
    log.success('Benchmark concluded with 100% request success.');
    playSound('pass');
    return true;
  } else {
    log.warn(`Benchmark finished with ${failed} failed request(s).`);
    playSound('fail');
    return false;
  }
}
