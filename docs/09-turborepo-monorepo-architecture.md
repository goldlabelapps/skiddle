# 09 — Turborepo Monorepo Architecture & Multi-Package Toolchain

> **Document Version:** 1.0.0  
> **Topic:** Monorepo architecture transition to Turborepo, Next.js 15 application integration, and publishable package structuring.

---

## 🎯 Executive Overview

To scale the Skiddle ecosystem beyond standalone SDK libraries, the repository was transitioned into a high-performance **Turborepo** monorepo backed by **pnpm workspaces**.

The architecture establishes:
1. **`apps/` directory**: Hosting deployable web applications (Next.js 15) and frontend consumers.
2. **`packages/` directory**: Housing reusable, scoped (`@skiddle/*`) packages designed for internal workspace sharing and future npm distribution.
3. **`php/` directory**: Retaining the standalone, first-class Skiddle PHP SDK without cross-language interference.
4. **Intelligent Caching Pipeline**: Orchestrated by Turborepo with deterministic input/output hashing across builds, tests, and typechecks.

---

## 🏛 Directory Layout

```
skiddle/
├── apps/
│   └── web/                      # Next.js 15 App Router application
│       ├── src/app/              # Server components consuming @skiddle/sdk
│       ├── next.config.mjs       # Workspace transpilation configuration
│       └── package.json          # Application manifest ("web")
├── packages/
│   ├── sdk/                      # Core JavaScript & TypeScript SDK (@skiddle/sdk)
│   │   ├── src/                  # Native web APIs, zero runtime deps
│   │   ├── dist/                 # Dual ESM (.js), CJS (.cjs) + .d.ts
│   │   ├── package.json          # Publishable npm package: "@skiddle/sdk"
│   │   └── tsup.config.ts        # Bundler configuration
│   └── cli/                      # NX° Developer Experience CLI (@skiddle/cli)
│       ├── bin/nx.js             # Executable CLI entrypoint
│       ├── src/                  # Diagnostic, scenario & benchmark commands
│       └── package.json          # Publishable npm package: "@skiddle/cli"
├── php/                          # Official Skiddle PHP SDK (Composer, PSR-4)
├── turbo.json                    # Turborepo task pipeline configuration
├── pnpm-workspace.yaml           # Workspace boundary configuration
├── package.json                  # Root monorepo orchestration
└── .gitignore                    # Build artifact ignore rules (.turbo, .next, dist)
```

---

## ⚙️ Monorepo Configuration

### 1. Workspace Boundaries (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'

allowBuilds:
  esbuild: true
```

### 2. Turborepo Pipeline (`turbo.json`)

Turborepo 2.x manages task dependencies, cache outputs, and persistent runners:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 3. Root Orchestration (`package.json`)

All root tasks delegate directly to Turborepo:

```json
{
  "name": "skiddle",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@12.10.1",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:coverage": "turbo run test:coverage",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "cli": "node ./packages/cli/bin/nx.js"
  },
  "devDependencies": {
    "turbo": "^2.4.4"
  }
}
```

---

## 📦 Package Structuring & Naming Conventions

All shared libraries utilize the `@skiddle/*` npm scope:

| Package | Workspace Path | Target Role | npm Distributable |
| :--- | :--- | :--- | :--- |
| `@skiddle/sdk` | `packages/sdk` | Zero-dependency TypeScript SDK for Skiddle API v1 & v3 | Yes (`npm publish`) |
| `@skiddle/cli` | `packages/cli` | Developer CLI tool (`npx @skiddle/cli`, `skiddle-nx`) | Yes (`npm publish`) |
| `web` | `apps/web` | Internal Next.js 15 web application | No (`"private": true`) |

### Why `@skiddle/cli` was placed in `packages/` rather than `apps/`:
- **npm Registry Availability:** As an npm package with declared `bin` executables (`nx`, `skiddle-nx`), external developers and CI systems can invoke it via `npx @skiddle/cli` or global installation.
- **Unified Release Flow:** Shares versioning, changelog generation, and publishing pipelines alongside `@skiddle/sdk`.

---

## 📱 Baseline Next.js 15 Application (`apps/web`)

An initial Next.js application was bootstrapped in `apps/web`:
- **App Router & React 19:** Utilizes standard Server Components.
- **Direct Workspace Linking:** Declares `"@skiddle/sdk": "workspace:*"` in `apps/web/package.json`.
- **Transpilation:** Configured `transpilePackages: ['@skiddle/sdk']` in `next.config.mjs` for seamless dual-package ESM import resolution without separate build steps during development.
- **SDK Integration Demonstration:** `apps/web/src/app/page.tsx` renders monorepo status and live SDK integration examples.

---

## ⚡ Verification & Caching Metrics

### Pipeline Execution
```bash
pnpm turbo run build test typecheck
```
- **Task Coverage:** 6 tasks across 3 workspace packages (`@skiddle/sdk`, `@skiddle/cli`, `web`).
- **Initial Run (Cold Cache):** All builds, unit tests, and typechecks passed in ~16.3s.
- **Subsequent Run (Warm Cache):** Cached outputs replayed with 4 cached tasks in ~1.5s, delivering instantaneous feedback.

### Targeted Commands
- `pnpm --filter @skiddle/sdk test`: 14/14 Vitest tests passing.
- `pnpm --filter @skiddle/cli test`: 14/14 CLI tests passing.
- `pnpm cli doctor`: Fully functional from root via `packages/cli/bin/nx.js`.
- `cd php && php -l autoloader.php`: PHP syntax check completely clean.
