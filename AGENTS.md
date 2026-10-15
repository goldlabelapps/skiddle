# Skiddle SDKs & NX° CLI — Antigravity Agent Guidelines

Welcome to the **Skiddle Polyglot SDKs (PHP & JavaScript) & NX° Developer Experience CLI** workspace.
This document provides instructions, constraints, and architecture guidelines for AI agents (Antigravity) operating in this repository.

---

## 🏛 Project Architecture & Structure

```
skiddle/
├── php/                # Official Skiddle PHP SDK (First-Class)
│   ├── src/            # PHP Classes (PSR-4: SkiddleSDK\)
│   ├── tests/          # PHPUnit test cases
│   ├── demo/           # Example scripts & load test
│   ├── autoloader.php  # Standalone autoloader
│   ├── composer.json   # Composer configuration
│   └── README.md       # PHP SDK documentation
├── javascript/         # Modern JavaScript & TypeScript SDK (First-Class)
│   ├── src/            # Zero external dependency TS source
│   ├── tests/          # Vitest test suite
│   ├── dist/           # Built ESM (.js) and CJS (.cjs) bundles + .d.ts
│   ├── package.json    # SDK npm package configuration
│   ├── tsconfig.json   # TypeScript configuration
│   ├── tsup.config.ts  # tsup dual build config
│   └── README.md       # JavaScript SDK documentation
├── cli/                # NX° Developer Experience CLI (Shared Developer Tool)
│   ├── bin/nx.js       # CLI entrypoint executable
│   ├── package.json    # CLI dependencies (commander, picocolors, prompts, dotenv)
│   └── src/            # Commander CLI commands (doctor, events, benchmark, scenarios)
├── docs/               # Architecture decision records & interview transcripts
└── .agents/            # Skills and prompt templates for Antigravity
```

---

## ⚠️ Core Architectural Constraints

1. **Equal First-Class Status for Both PHP and JavaScript SDKs**:
   - Both SDKs are actively maintained and first-class citizens.
   - Parity in features and query ergonomics (fluent condition builder: `addCond`, `delCond`, `getConditions`, `clearConditions`).

2. **Zero External Dependencies for JavaScript SDK Core**:
   - `javascript/src/` MUST NOT import external npm packages. It relies exclusively on native modern Node/Web APIs (`fetch`, `URL`, `URLSearchParams`, `AbortController`).
   - CLI dependencies (`commander`, `picocolors`, `prompts`, `dotenv`) belong strictly in `cli/`.

3. **Dual CommonJS & ESM Distribution for JavaScript**:
   - Built via `tsup` into `javascript/dist/index.js` (ESM), `javascript/dist/index.cjs` (CJS), and `javascript/dist/index.d.ts`.
   - All internal relative imports in `javascript/src/` must include explicit `.js` extensions for ES Module resolution.

4. **Fluent Condition Builder Pattern**:
   - All queryable resources extend `SkiddleBase`.
   - Use `addCond(key, value)` (arrays automatically convert to comma-separated strings).
   - Use `delCond(key)` (throws `SkiddleException` if key is not found, preserving cross-SDK parity).
   - Use `getConditions()` and `clearConditions()`.

5. **Error Handling**:
   - Throw `SkiddleException` for missing keys, validation errors, HTTP errors, or API-level error responses.

---

## ⚡ Targeted Verification Commands

Follow the narrowest possible command to verify changes:

| Task | Preferred Command |
| :--- | :--- |
| **Run JS Affected Tests** | `pnpm --filter skiddle-sdk test tests/sdk.test.ts` |
| **Run JS Full Test Suite**| `pnpm test` |
| **JS Type Check** | `pnpm typecheck` |
| **JS SDK Build** | `pnpm build` |
| **PHP Syntax Check** | `cd php && php -l autoloader.php` |
| **Test NX° CLI** | `pnpm cli doctor` or `pnpm cli events "Warehouse"` |

---

## 🛠 Available Skills & Prompt Helpers

- `.agents/skills/skiddle-sdk-dev/SKILL.md`: Step-by-step procedure for adding new endpoints, resources, or JS SDK internals.
- `.agents/skills/skiddle-cli-dev/SKILL.md`: Step-by-step procedure for adding or modifying NX° CLI commands.
- `.agents/skills/skiddle-mock-tester/SKILL.md`: Step-by-step procedure for testing JS SDK features with Vitest mocks without live network calls.
- `.agents/prompts/`: Curated prompt templates to accelerate common development workflows.
