import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const publicDir = path.join(rootDir, 'public');

function collectTsFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsFiles(full, acc);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      acc.push(full);
    }
  }
  return acc;
}

let errors = 0;
const files = collectTsFiles(srcDir);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file);

  if (/\bdebugger\b/.test(content)) {
    console.error(`[Web Lint] Forbidden debugger statement in ${rel}`);
    errors++;
  }
}

// Verify critical public assets referenced by layout & manifest exist
const requiredAssets = [
  'favicon.ico',
  'favicon.svg',
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'skiddle-logo-white.svg',
];

for (const asset of requiredAssets) {
  if (!fs.existsSync(path.join(publicDir, asset))) {
    console.error(`[Web Lint] Missing required public asset: public/${asset}`);
    errors++;
  }
}

if (errors > 0) {
  process.exit(1);
}

console.log(`✔ web lint passed (${files.length} TS/TSX files and ${requiredAssets.length} public assets verified).`);
