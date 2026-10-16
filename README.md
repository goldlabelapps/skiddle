# Skiddle SDKs & Developer Toolkit

> **Official & Modern SDKs for the Skiddle Events, Artists & Venues API**  
> *Providing first-class developer tooling in both PHP and JavaScript / TypeScript, backed by the NX° Developer Experience CLI.*

---

## 🏛 Repository Architecture

This polyglot monorepo is managed with **Turborepo** and **pnpm workspaces**:

```
skiddle/
├── apps/
│   └── web/              # Next.js 15 application consuming @skiddle/sdk
├── packages/
│   ├── sdk/              # Modern TypeScript & JavaScript SDK (@skiddle/sdk, zero runtime deps)
│   └── cli/              # NX° Developer Experience CLI (@skiddle/cli)
├── php/                  # Official Skiddle PHP SDK (Composer, PSR-4, cURL)
├── docs/                 # Architectural transcripts & technical documentation
└── .agents/              # AI pair-programming skills & prompt templates
```

| Package / App | Directory | Runtime | Status | Name |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js Web App** | [`/apps/web`](./apps/web) | Next.js 15 / React 19 | App | `web` |
| **JavaScript / TS SDK** | [`/packages/sdk`](./packages/sdk) | Node.js >= 18 / Browsers | First-Class | `@skiddle/sdk` |
| **NX° Developer CLI** | [`/packages/cli`](./packages/cli) | Node.js >= 18 | Package / CLI | `@skiddle/cli` |
| **PHP SDK** | [`/php`](./php) | PHP >= 7.4 / 8.x | First-Class | `skiddle/skiddle-php-sdk` |

---

## ⚡ Turborepo Workflow

```bash
# Build all apps & packages with caching
pnpm build

# Run unit tests across the monorepo
pnpm test

# Run typechecking across the monorepo
pnpm typecheck

# Start development mode
pnpm dev
```

---

## ⚡ JavaScript & TypeScript SDK (`@skiddle/sdk`)

A zero-external-dependency, modern TypeScript and JavaScript client supporting Skiddle API v1 & v3 with native `fetch` and dual ESM/CommonJS distribution.

### Installation
```bash
pnpm add @skiddle/sdk
# or in this monorepo workspace:
pnpm install && pnpm build
```

### Quickstart
```typescript
import { createClient } from '@skiddle/sdk';

const client = createClient({ apiKey: process.env.SKIDDLE_API_KEY });

// Fluent query builder
client.events
  .addCond('keyword', 'Creamfields')
  .addCond('limit', 5);

const response = await client.events.getListings();
console.log(response.results);
```

### Verification & Testing
```bash
pnpm test          # Run Vitest test suite
pnpm typecheck     # TypeScript compiler verification
pnpm build         # Generate ESM, CJS, and .d.ts declaration maps
```

👉 See full details in the [**JavaScript SDK Documentation**](./packages/sdk/README.md).

---

## 📱 Next.js Web App (`/apps/web`)

A modern Next.js 15 application utilizing React 19 and App Router, configured to consume `@skiddle/sdk` directly via workspace linking (`workspace:*`).

```bash
# Run web app in development
pnpm --filter web dev

# Production build
pnpm --filter web build
```

👉 See details in the [**Web App Documentation**](./apps/web/README.md).

---

## 🐘 PHP SDK (`/php`)

The battle-tested, PSR-4 compliant PHP SDK providing fluent API access, query condition builders, and cURL transport for server-side PHP environments.

### Installation
```bash
composer require skiddle/skiddle-php-sdk
# or from this repo:
cd php && composer install
```

### Quickstart
```php
require_once 'vendor/autoload.php'; // or autoloader.php

$session = new \SkiddleSDK\SkiddleSession([
    'apiKey' => getenv('SKIDDLE_API_KEY'),
    'devMode' => false
]);

$events = new \SkiddleSDK\Events();
$events->setSession($session);
$events->addCond('keyword', 'Creamfields');
$events->addCond('limit', 5);

$response = $events->getListings();
print_r($response);
```

### Running PHP Demos & Tests
```bash
cd php
php demo/loadTest.php
```

👉 See full details in the [**PHP SDK Documentation**](./php/README.md).

---

## 🛠 NX° Developer Experience CLI (`/packages/cli`)

An interactive developer utility for validating API keys, running latency benchmarks, testing live event endpoints, and executing legacy test scenarios.

```bash
# Setup all workspace dependencies
pnpm install

# Run diagnostics and verify API key
pnpm cli doctor

# Search live events
pnpm cli events "Warehouse Project" --limit 5

# Benchmark endpoint latency and throughput
pnpm cli benchmark --concurrency 5 --requests 20

# Run classic test scenarios
pnpm cli scenarios 1
```

👉 See full details in the [**NX° CLI Documentation**](./packages/cli/README.md) and [**CLI Guide**](./docs/05-nx-developer-experience-cli.md).

---

## 📚 Technical Documentation & Logs

Chronological engineering logs and architectural decision records:
- [`docs/TRANSCRIPT.md`](./docs/TRANSCRIPT.md) - Chronological log of steps and decisions
- [`docs/01-project-restructure.md`](./docs/01-project-restructure.md) - Isolating legacy PHP code & polyglot restructuring
- [`docs/02-package-and-toolchain.md`](./docs/02-package-and-toolchain.md) - Dual ESM/CJS build pipeline & tooling
- [`docs/03-sdk-port-architecture.md`](./docs/03-sdk-port-architecture.md) - TypeScript architecture, error normalization, and API v3 parity
- [`docs/04-testing-and-verification.md`](./docs/04-testing-and-verification.md) - Vitest test suite breakdown
- [`docs/05-nx-developer-experience-cli.md`](./docs/05-nx-developer-experience-cli.md) - CLI features and command reference
- [`docs/06-interview-discussion-guide.md`](./docs/06-interview-discussion-guide.md) - Technical talking points & design rationale
- [`docs/07-ai-prompting-helpers.md`](./docs/07-ai-prompting-helpers.md) - Antigravity skills, prompt templates & agent guidelines
- [`docs/08-api-v3-pagination-and-compatibility.md`](./docs/08-api-v3-pagination-and-compatibility.md) - API v3 pagination translation, parameter normalization, and PHP 8.2+ hardening
- [`docs/09-turborepo-monorepo-architecture.md`](./docs/09-turborepo-monorepo-architecture.md) - Turborepo monorepo architecture, Next.js integration, and publishable package structuring
- [`docs/10-interactive-api-testing-component.md`](./docs/10-interactive-api-testing-component.md) - Interactive API testing component, Next.js 15 Server Actions, condition builder UI & multi-view diagnostics

---

## 📄 License

MIT License. Skiddle PHP SDK & TypeScript SDK © Skiddle Ltd.
