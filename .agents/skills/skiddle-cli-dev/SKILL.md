---
name: skiddle-cli-dev
description: >-
  Develop, extend, or debug the NX° Developer Experience CLI (cli/), add subcommands,
  interactive terminal prompts, or benchmark tasks.
---

# NX° Developer Experience CLI Workflow

Use this skill when developing or debugging the terminal CLI tools in `cli/`.

## Architecture Overview

```
cli/
├── bin/nx.js                 # Executable entrypoint with #!/usr/bin/env node
└── src/
    ├── banner.js             # ASCII art & branding
    ├── index.js              # Commander program definition & command routing
    └── commands/
        ├── doctor.js         # Environment & API connectivity checks
        ├── events.js         # Interactive & flag-driven event search
        ├── benchmark.js      # Latency & throughput benchmarking
        └── scenarios.js      # Legacy PHP test scenario replays
```

---

## Step-by-Step: Adding a New CLI Command

### 1. Create Command Module in `cli/src/commands/<name>.js`
```javascript
import pc from 'picocolors';
import { createClient } from '../../../dist/index.js';

export async function myCommand(options = {}) {
  const apiKey = options.key || process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    console.error(pc.red('Error: Skiddle API key required. Pass --key or set SKIDDLE_API_KEY.'));
    process.exit(1);
  }

  const client = createClient({ apiKey });
  // Perform actions...
  console.log(pc.green('✔ Done'));
}
```

### 2. Register Command in `cli/src/index.js`
Import and register with `commander`:
```javascript
import { myCommand } from './commands/mycommand.js';

program
  .command('mycommand')
  .description('Description of what the command does')
  .option('-k, --key <apiKey>', 'Skiddle API key')
  .action((opts) => myCommand(opts));
```

### 3. Ensure Build is Fresh
Since the CLI consumes `dist/index.js`, always build the SDK before testing CLI changes:
```bash
pnpm build
```

---

## ⚡ Verification Checklist

Test the CLI directly using Node:
1. `node ./cli/bin/nx.js --help` — Verify command is registered.
2. `node ./cli/bin/nx.js <command> --help` — Verify options and description.
3. `node ./cli/bin/nx.js <command>` — Run command execution.
