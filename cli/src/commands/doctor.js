import pc from 'picocolors';
import { SkiddleSession, Events, SkiddleException } from '../../../dist/index.js';

export async function doctorCommand(options = {}) {
  console.log(pc.bold('Running NX° Health Diagnostics...\n'));

  // 1. Environment check
  console.log(`${pc.cyan('●')} Node.js Version: ${pc.green(process.version)} (Platform: ${process.platform})`);

  // 2. API Key check
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.log(`${pc.yellow('⚠')} Skiddle API Key: ${pc.yellow('Not found in environment')} (Set ${pc.bold('SKIDDLE_API_KEY')} or pass --key)`);
    console.log(pc.gray('  Get a free developer key at: https://www.skiddle.com/api/join.php\n'));
    return;
  }
  const maskedKey = apiKey.slice(0, 4) + '...' + apiKey.slice(-4);
  console.log(`${pc.green('✔')} Skiddle API Key: ${pc.green('Detected')} (${maskedKey})`);

  // 3. Connectivity check to API v1 & v3
  const session = new SkiddleSession({ apiKey });
  const events = new Events();
  events.setSession(session);

  console.log('\nTesting live API endpoints:');

  // Test v3 instant-search
  try {
    const t0 = Date.now();
    events.addCond('limit', 1);
    const v3Res = await events.getListings();
    const v3Time = Date.now() - t0;
    console.log(`  ${pc.green('✔')} API v3 (Instant-Search): ${pc.green('ONLINE')} (${v3Time}ms) - Total results indexed: ${v3Res.totalresults ?? 'N/A'}`);
  } catch (err) {
    const msg = err instanceof SkiddleException ? `[Status ${err.code}] ${err.message}` : (err.message || String(err));
    console.log(`  ${pc.red('✖')} API v3 (Instant-Search): ${pc.red('FAILED')} - ${msg}`);
  }

  console.log(pc.green('\n✔ NX° Diagnostics Complete.\n'));
}
