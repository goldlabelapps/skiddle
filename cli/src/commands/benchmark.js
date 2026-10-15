import pc from 'picocolors';
import { SkiddleSession, Events } from '../../../dist/index.js';

export async function benchmarkCommand(options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.error(pc.red('Error: Skiddle API key is required. Set SKIDDLE_API_KEY or use --key <apiKey>'));
    return;
  }

  const concurrency = Number(options.concurrency) || 5;
  const totalRequests = Number(options.requests) || 20;

  console.log(pc.bold('\nStarting NX° SDK Performance Benchmark:'));
  console.log(`  Total Requests: ${pc.cyan(totalRequests)} | Concurrency: ${pc.cyan(concurrency)}\n`);

  const session = new SkiddleSession({ apiKey });
  const latencies = [];
  let successful = 0;
  let failed = 0;

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
      process.stdout.write(pc.green('.'));
    } catch {
      failed++;
      process.stdout.write(pc.red('x'));
    }
  };

  const queue = Array.from({ length: totalRequests });
  const overallStart = Date.now();

  // Simple concurrency pool
  let idx = 0;
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (idx < queue.length) {
      idx++;
      await runSingle();
    }
  });

  await Promise.all(workers);
  const totalDurationSec = (Date.now() - overallStart) / 1000;

  latencies.sort((a, b) => a - b);
  const avg = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (successful / totalDurationSec).toFixed(1);

  console.log('\n\n' + pc.bold('Benchmark Results:'));
  console.log(pc.gray('─'.repeat(40)));
  console.log(`Total Time:         ${totalDurationSec.toFixed(2)}s`);
  console.log(`Throughput:         ${pc.green(`${rps} req/sec`)}`);
  console.log(`Success Rate:       ${pc.green(`${successful}/${totalRequests}`)} (${((successful / totalRequests) * 100).toFixed(0)}%)`);
  console.log(`Average Latency:    ${avg}ms`);
  console.log(`p50 Latency:        ${p50}ms`);
  console.log(`p95 Latency:        ${p95}ms`);
  console.log(`p99 Latency:        ${p99}ms\n`);
}
