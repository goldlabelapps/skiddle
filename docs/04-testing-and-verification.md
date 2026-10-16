# Step 4: Testing & Verification

## Objective
Provide automated Test-Driven Development (TDD) regression, contract, and End-to-End (E2E) testing across the entire monorepo (`@skiddle/sdk`, `@skiddle/cli`, `apps/web`, and `php/`) without relying on live external networks during CI runs.

## Test Strategy & Architecture

We use **Vitest** across all JavaScript/TypeScript workspaces (`@skiddle/sdk`, `@skiddle/cli`, `web`) and a zero-dependency PHP test runner (`php/tests/run.php`) for the PHP SDK, orchestrated by **Turborepo** and verified on every push via **GitHub Actions** (`.github/workflows/ci.yml`).

### Test Coverage Areas

1. **JavaScript/TypeScript SDK (`packages/sdk/tests/`)**:
   - **Unit Tests (`sdk.test.ts`)**:
     - `SkiddleException`: Error codes, details payload, prototype chain preservation.
     - `SkiddleSession`: Explicit API key, `SKIDDLE_API_KEY` env fallback, missing key exception, `devMode` toggling.
     - `SkiddleRequest`: API v1/v3 URL routing, `transformRequestKeys()` parameter renaming and pagination translation (`limit`/`offset` → `page[size]`/`page[number]`), network transport errors, malformed JSON handling, API v1/v3 error decoding, and API key masking in debug traces.
     - `SkiddleBase`: Fluent condition builder (`addCond`, `delCond`, `clearConditions`, `getConditions` immutability), `eventCode` uppercase normalization, `formatForLog` key mapping.
     - Entities & Helpers: `Events`, `Artists`, `Venues`, `createClient()`, and `toEFlyerPromotionData()`.
   - **E2E & Contract Tests (`e2e.test.ts`)**:
     - Full discovery-to-promotion workflow (Search Events v3 → Single Event Detail v1 → eFlyer Promotion ViewModel).
     - Upstream error recovery and retry resilience.
     - Dual ESM (`dist/index.js`), CJS (`dist/index.cjs`), and TypeScript declaration (`dist/index.d.ts`) bundle contract verification.

2. **NX° Developer CLI (`packages/cli/tests/`)**:
   - **Unit Tests (`cli.test.js`)**: Argument parser (`parseArgs`), environment diagnostics (`checkEnv`), terminal formatting, 10 classic Skiddle scenarios, and conventional commit generator.
   - **E2E Tests (`e2e.test.js`)**: CLI binary execution (`nx --version`, `nx --help`), dry-run CI pipeline, and end-to-end command flows (`doctorCommand`, `getEventCommand`, `searchEventsCommand`) with mocked HTTP transport.

3. **Next.js 15 Web Application (`apps/web/tests/`)**:
   - **Unit Tests (`tests/unit/actions.test.ts`)**: Server Actions (`checkServerConfig`, `executeSkiddleQuery`), condition pruning, custom vs environment API key resolution, and structured `SkiddleException` error responses.
   - **E2E & Integration Tests (`tests/e2e/web-e2e.test.ts`)**: PWA Web App Manifest contract, RootLayout metadata/viewport validation, and end-to-end Server Action → `@skiddle/sdk` → `toEFlyerPromotionData` integration.

4. **PHP SDK (`php/tests/`)**:
   - **Unit & Parity Tests (`run.php`, `SkiddleSessionTest.php`, `SkiddleRequestTest.php`, `EventsTest.php`)**: Cross-SDK parity for session initialization, API v3 parameter/pagination translation, and fluent condition builders.

## Running the Test Suite

```bash
# Run all JS/TS unit & E2E tests via Turborepo
pnpm test

# Run targeted unit or E2E suites
pnpm test:unit
pnpm test:e2e

# Run PHP SDK unit tests
pnpm test:php

# Run the full Vercel-parity CI quality gate (typecheck + lint + test + test:php + build)
pnpm run ci
```

👉 See [`docs/12-tdd-testing-suite-and-ci-cd.md`](./12-tdd-testing-suite-and-ci-cd.md) for the complete TDD workflow and GitHub Actions CI documentation.
