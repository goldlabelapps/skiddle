#!/usr/bin/env node

import 'dotenv/config';
import { runCli } from '../src/index.js';

runCli().catch((err) => {
  if (err?.name === 'AbortError' || err?.code === 'ABORT_ERR' || err?.message?.includes('Aborted')) {
    console.log('\n\x1b[38;5;220m\x1b[1mBailed out safely, sir\x1b[0m\n');
    process.exit(0);
  }
  console.error('\x1b[31mUnexpected CLI error:\x1b[0m', err);
  process.exit(1);
});
