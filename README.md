# Skiddle TypeScript SDK & NX° Developer Experience CLI

> **Interview Experiment & Porting Project for Skiddle Ltd**  
> *Role: Front End React Developer*  
> *Interview Panel: Adam Chandler (Front-End) & Chris Seaton (Back-End Team Leader)*

---

## 📖 Overview

This repository contains a modern **TypeScript / Node.js** port of the official Skiddle PHP SDK, accompanied by **NX° Developer Experience**—a specialized developer CLI for testing, querying, and benchmarking the Skiddle API.

The entire step-by-step engineering process is logged chronologically in the [`/docs`](./docs) directory as a transcript for the Skiddle engineering team.

### What’s Inside:
1. **TypeScript SDK (`/src`)**: Zero-bloat, strongly typed SDK with dual ESM and CommonJS support, native `fetch`, fluent condition builders, and Skiddle API v1 & v3 compatibility.
2. **NX° Developer Experience CLI (`/cli`)**: Terminal utility to inspect live events, test credentials, run legacy test scenarios, and benchmark endpoint latency.
3. **Legacy PHP SDK (`/php`)**: The original PHP SDK and tests preserved cleanly in an isolated directory.
4. **Documentation Transcript (`/docs`)**: Step-by-step logs and architectural rationale.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Package
```bash
npm run build
```
Generates dual ESM (`dist/index.js`), CJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`).

### 3. Run Automated Tests
```bash
npm test
```
Executes the Vitest test suite (14 passing tests in < 400ms).

---

## 🛠 Using the SDK

```typescript
import { createClient } from 'skiddle-sdk';

// Automatically picks up SKIDDLE_API_KEY from environment or config
const client = createClient({ apiKey: 'YOUR_API_KEY' });

// Fluent filtering for events
client.events
  .addCond('keyword', 'Creamfields')
  .addCond('limit', 5);

const response = await client.events.getListings();
console.log(response.results);
```

---

## ⚡ NX° Developer Experience CLI

Launch the interactive CLI or run commands directly:

```bash
# Launch interactive terminal UI
npm run cli -- interactive

# Run health diagnostics & verify API key
npm run cli -- doctor

# Search live events
npm run cli -- events "Warehouse Project" --limit 5

# Inspect a single event
npm run cli -- event 4040

# Run the 10 classic test scenarios from the legacy PHP load test
npm run cli -- scenarios 1

# Run performance & latency benchmark
npm run cli -- benchmark --concurrency 5 --requests 20
```

---

## 📚 Migration Transcript & Architecture Docs

Detailed documentation for the interview discussion is located in [`/docs`](./docs):
- [`docs/TRANSCRIPT.md`](./docs/TRANSCRIPT.md) - Chronological log of steps and decisions
- [`docs/01-project-restructure.md`](./docs/01-project-restructure.md) - Isolating legacy PHP code
- [`docs/02-package-and-toolchain.md`](./docs/02-package-and-toolchain.md) - Dual ESM/CJS build pipeline & tooling
- [`docs/03-sdk-port-architecture.md`](./docs/03-sdk-port-architecture.md) - TypeScript architecture, error normalization, and API v3 parity
- [`docs/04-testing-and-verification.md`](./docs/04-testing-and-verification.md) - Vitest test suite breakdown
- [`docs/05-nx-developer-experience-cli.md`](./docs/05-nx-developer-experience-cli.md) - CLI features and command reference
- [`docs/06-interview-discussion-guide.md`](./docs/06-interview-discussion-guide.md) - Talking points for Adam Chandler & Chris Seaton

---

## 📄 License

MIT. Original PHP codebase copyright Skiddle Ltd. Modern TypeScript port & NX° CLI created for technical demonstration.
