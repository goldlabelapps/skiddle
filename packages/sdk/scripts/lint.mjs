import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const pkgPath = path.join(rootDir, 'package.json');

let errors = 0;

// 1. Verify zero runtime dependencies constraint
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const runtimeDeps = Object.keys(pkg.dependencies || {});
if (runtimeDeps.length > 0) {
  console.error(`[SDK Lint] Architectural violation: @skiddle/sdk must have zero runtime dependencies, found: ${runtimeDeps.join(', ')}`);
  errors++;
}

// 2. Check all TypeScript source files for ESM .js extensions & zero external imports
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts'));
const importRegex = /^\s*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

for (const file of files) {
  const filePath = path.join(srcDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  // Strip block and line comments before matching import/export statements
  const codeOnly = rawContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

  let match;
  while ((match = importRegex.exec(codeOnly)) !== null) {
    const specifier = match[1];
    if (specifier.startsWith('.')) {
      if (!specifier.endsWith('.js')) {
        console.error(`[SDK Lint] Missing explicit .js extension in ${file}: "${specifier}"`);
        errors++;
      }
    } else {
      console.error(`[SDK Lint] Forbidden external import in ${file}: "${specifier}"`);
      errors++;
    }
  }

  if (/\bdebugger\b/.test(codeOnly)) {
    console.error(`[SDK Lint] Forbidden debugger statement in ${file}`);
    errors++;
  }
}

if (errors > 0) {
  process.exit(1);
}
console.log(`✔ @skiddle/sdk lint passed (${files.length} source files verified, 0 runtime deps, strict ESM imports).`);
