#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

import { runCli } from '../src/index.js';

runCli().catch((err) => {
  if (err?.name === 'AbortError' || err?.code === 'ABORT_ERR' || err?.message?.includes('Aborted')) {
    console.log('\n\x1b[38;5;220m\x1b[1mBailed out safely, sir\x1b[0m\n');
    process.exit(0);
  }
  console.error('\x1b[31mUnexpected CLI error:\x1b[0m', err);
  process.exit(1);
});
