# Step 12: TDD Testing Suite, E2E Contracts & GitHub Actions CI/CD

## Objective
Establish a comprehensive, deterministic **Test-Driven Development (TDD)** testing suite spanning **Unit Tests**, **Integration & Contract Tests**, **End-to-End (E2E) Workflows**, **Polyglot PHP SDK Parity Tests**, **Architectural Linting**, and an automated **GitHub Actions CI/CD Pipeline** that mirrors Vercel's production build and deployment checks on every push.

---

## 1. TDD Philosophy & Testing Pyramid

Every feature and bugfix in the Skiddle monorepo follows the **Red → Green → Refactor** TDD cycle:
1. **Red**: Write a deterministic failing unit or E2E test specifying the exact contract (e.g., query parameter transformation, error normalization, or eFlyer ViewModel mapping).
2. **Green**: Implement the minimal, zero-dependency code required to satisfy the test contract.
3. **Refactor**: Consolidate types, clean up internals, and verify all architectural constraints (`pnpm run ci`).

### Testing Pyramid Across the Monorepo

| Layer | Scope | Runner | Files |
| :--- | :--- | :--- | :--- |
| **SDK Unit Tests** | `SkiddleException`, `SkiddleSession`, `SkiddleRequest`, `SkiddleBase`, `Events`, `Artists`, `Venues`, `toEFlyerPromotionData` | Vitest | `packages/sdk/tests/sdk.test.ts` |
| **SDK E2E & Bundle Contracts** | Multi-step Event Search → Single Event Lookup → eFlyer transformation, retry recovery, Dual ESM/CJS bundle exports | Vitest | `packages/sdk/tests/e2e.test.ts` |
| **CLI Unit Tests** | Argument parser (`parseArgs`), environment diagnostics, ANSI UI, 10 classic scenarios, conventional commit generator | Vitest | `packages/cli/tests/cli.test.js` |
| **CLI E2E Execution** | Binary execution (`nx --version`, `nx --help`), dry-run CI pipeline, mocked E2E `doctor` & `events` commands | Vitest | `packages/cli/tests/e2e.test.js` |
| **Web App Unit Tests** | Next.js 15 Server Actions (`checkServerConfig`, `executeSkiddleQuery`), condition pruning, API key fallback, error codes | Vitest | `apps/web/tests/unit/actions.test.ts` |
| **Web App E2E & Integration** | PWA Web App Manifest, RootLayout viewport/metadata contracts, Server Action → `@skiddle/sdk` → eFlyer E2E pipeline | Vitest | `apps/web/tests/e2e/web-e2e.test.ts` |
| **PHP SDK Unit & Parity Tests** | `SkiddleSession`, `SkiddleRequest::transformRequestKeys`, `Events`, `Artists`, `Venues`, fluent condition builder parity | PHP CLI | `php/tests/run.php`, `php/tests/*Test.php` |

---

## 2. Architectural Linting & Static Analysis (`pnpm lint` & `pnpm typecheck`)

Each workspace package enforces strict static analysis and architectural invariants:

- **`@skiddle/sdk` (`packages/sdk/scripts/lint.mjs`)**:
  - Verifies **zero runtime dependencies** in `packages/sdk/package.json`.
  - Scans all TypeScript source files in `packages/sdk/src/` to ensure **no external package imports** are introduced.
  - Enforces **explicit `.js` extensions** on all relative ES Module imports/exports.
  - Verifies zero `debugger` statements and clean `tsc --noEmit` compilation.
- **`@skiddle/cli` (`packages/cli/scripts/lint.mjs`)**:
  - Runs `node --check` syntax verification across all CLI entrypoints, command modules, and test files.
- **`web` (`apps/web/scripts/lint.mjs`)**:
  - Verifies all `.ts` and `.tsx` source files and confirms that all required PWA & branding assets in `apps/web/public/` exist on disk alongside `tsc --noEmit`.

---

## 3. GitHub Actions CI & Vercel Deployment Parity (`.github/workflows/ci.yml`)

The GitHub Actions workflow runs automatically on every `push` and `pull_request` across all branches, executing the exact verification and build steps performed by Vercel during deployment:

1. **Dependency Installation**: `pnpm install --frozen-lockfile` with Node 22 and pnpm caching.
2. **Shared SDK Build**: `pnpm --filter @skiddle/sdk build` (generates ESM, CJS, and `.d.ts` bundles via `tsup`).
3. **Monorepo Typecheck**: `pnpm typecheck` (Turborepo pipeline across SDK, CLI, and Next.js 15 Web App).
4. **Monorepo Linter**: `pnpm lint` (Architectural guardrails, syntax checks, and asset verification).
5. **Unit Test Suite**: `pnpm test:unit` (All unit test suites across SDK, CLI, and Web).
6. **End-to-End (E2E) Test Suite**: `pnpm test:e2e` (All E2E & contract suites across SDK, CLI, and Web).
7. **PHP SDK Verification**: `php -l` syntax checks across `php/src/*.php` + `pnpm test:php` unit test runner.
8. **Full Production Build (Vercel Parity)**: `pnpm build` (Turborepo build compiling `@skiddle/sdk` and the production Next.js 15 application in `apps/web`).

---

## 4. Command Reference

```bash
# Run the complete CI quality gate locally (Typecheck + Lint + Unit/E2E Tests + PHP Tests + Production Build)
pnpm run ci

# Run all Vitest unit & E2E suites across the monorepo via Turborepo
pnpm test

# Run only Unit Tests across all packages
pnpm test:unit

# Run only End-to-End (E2E) & Contract Tests across all packages
pnpm test:e2e

# Run PHP SDK Unit Tests
pnpm test:php

# Run TypeScript typechecking across all packages
pnpm typecheck

# Run Linting & Architectural Guardrails across all packages
pnpm lint

# Run Full Production Build (SDK + Next.js 15 Web App)
pnpm build
```
