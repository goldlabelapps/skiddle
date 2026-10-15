#!/usr/bin/env node

import 'dotenv/config';
import { runCli } from '../src/index.js';

runCli().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', `NX° CLI Error: ${err.message}`);
  process.exit(1);
});
