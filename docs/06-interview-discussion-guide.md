# Skiddle Developer Interview Guide & Architectural Defense

> **Candidate Position:** 6th and Final Candidate  
> **Interviewers:** Adam Chandler (Front-End Developer) & Chris Seaton (Back-End Team Leader)  
> **Core Ethos:** *"A person is a good fit if their code is a good fit."* We cut through subjective interview talk with undeniable engineering excellence: a production monorepo that is tested, deployed, and light years ahead.

---

## 🎯 1. The Core Philosophy: "Code Is the Fit"

When companies say *"it's all about a good fit"*, it's often code for subjective guesswork. In software engineering, **cultural fit is proven through code quality, architectural maturity, and developer empathy.**

You are the 6th candidate walking into this room. To win the role unequivocally, you aren't showing a speculative toy repo or talking in abstract concepts. You are handing them a fully architected, production-ready polyglot monorepo that solves real Skiddle problems:

1. **Ported Skiddle's PHP SDK to modern TypeScript** (`@skiddle/sdk`) with zero runtime dependencies.
2. **Solved Day-0 Developer Experience** via an interactive developer CLI (`@skiddle/cli`) accessed immediately via `pnpm install && pnpm cli`.
3. **Built an interactive Next.js 15 explorer** (`apps/web`) that queries live Skiddle events and lets users drill down into event details and promotional eFlyer metadata.
4. **Enforced strict automated test gates** across both TypeScript (Vitest) and PHP (PHPUnit parity).

---

## 🛡️ 2. Front & Center: Why This Is NOT "Vibe Coding"

> [!IMPORTANT]
> **Tackle the AI elephant in the room immediately.** Address this before they even ask.

### The Misconception:
When developers hear "built with AI", they think of **"vibe coding"**—sloppily prompting an LLM to generate untyped, untested spaghetti code, blindly pasting it into a file, and hoping it works. 

### The Truth:
**Without senior engineering architecture, rigid guardrails, and disciplined testing, AI is completely useless.**

This monorepo was built using **Agentic AI Engineering under Strict Human-Architected Guardrails**:

| "Vibe Coding" (Amateur) | Agentic AI with Senior Guardrails (Our Monorepo) |
| :--- | :--- |
| Untyped or `any`-riddled JavaScript | **Strict TypeScript** with zero `any` shortcuts, typed v1/v3 contracts, and eFlyer schemas |
| Third-party dependency bloat (Axios, Lodash) | **Zero external dependencies in SDK core** (`packages/sdk/src/`), relying solely on native Web/Node APIs |
| "It works on my machine" | **Hermetic Turborepo pipeline** with strict caching, linting, and typechecking |
| No automated test validation | **Multi-tier test pyramid** (Vitest unit tests, Next.js E2E tests, PHP parity test runner) |
| Ignores edge cases & failure modes | **Robust error normalization** bridging API v1 (`errormessage`) and v3 RFC-7807 (`detail`) |
| Hallucinated, fragile code structure | **Strict architectural boundaries** separating apps, publishable packages, and legacy runtimes |

**Your talking point:**
> *"I use agentic AI tools the same way a senior carpenter uses high-precision power tools. The tool amplifies output, but the craftsmanship, architectural blueprints, type safety, and test guardrails come entirely from experience. If you don't know how to architect production software, the AI will just help you write unmaintainable garbage faster."*

---

## 🚀 3. The 4-Stage Demo Walkthrough

The interview format is a code walkthrough where you present your choices. Follow this exact sequence:

```
[1. Day-0 DX CLI] ──► [2. Zero-Dep Core SDK] ──► [3. Next.js 15 Live Explorer] ──► [4. CI Quality Gates]
```

### Stage 1: The Day-0 CLI (`@skiddle/cli`)
- **How it's used:** *"How is the CLI used? It's used always, from the start: `pnpm install && pnpm cli`. That's how we manage Developer Experience (DX). In a growing team, onboarding friction kills momentum. With this CLI, any developer can clone the repo and immediately be productive within 30 seconds."*
- **Action:** Open terminal and run `pnpm cli`.
- **Showcase:**
  - Option `[3] doctor`: Validates environment, Node version, and pings live Skiddle endpoints.
  - Option `[5] benchmark`: Live latency percentiles (p50, p95, p99) under concurrent load.
  - Option `[4] scenarios`: Replays legacy Skiddle test scenarios verifying backwards compatibility.

### Stage 2: The Core TypeScript SDK (`packages/sdk`)
- **Origin:** *"I took Skiddle's official PHP SDK from GitHub and ported it into a modern, production-grade TypeScript package."*
- **Architectural Highlights:**
  - **Zero runtime dependencies**: Pure native `fetch`, `URLSearchParams`, and `AbortController`. The production bundle is only 11 KB.
  - **Dual ESM/CJS Output**: Compiled via `tsup` into modern ESM (`.js`) and CommonJS (`.cjs`) with complete `.d.ts` declaration maps.
  - **Fluent Condition Builder**: Preserved the exact ergonomics of the PHP SDK (`addCond`, `delCond`, `getConditions`, `clearConditions`).
  - **API Reconciliation**: Unified Skiddle API v1 (`www.skiddle.com/api/v1`) and API v3 (`api.skiddle.com/v3`), handling legacy quirks like uppercase `eventCode` and `apiKey` query mapping automatically.

### Stage 3: Live Event Explorer in Next.js 15 (`apps/web`)
- **Concept:** *"A headless SDK is only as good as its frontend consumer. I built a Next.js 15 App Router application to explore real events via live Skiddle APIs."*
- **Interactive Event Selection:**
  - Show the Live Explorer on `/sdk`.
  - Search for live events (e.g. Manchester, Live Music, Festivals).
  - Click **"🔍 Select & Inspect Event (v1) →"** on any card:
    - Automatically switches to the single-event endpoint (`/api/v1/events/{id}/`).
    - Fetches the exact event detail, venue address, door opening times, age restrictions, and pricing.
    - Demonstrates the normalized promotional **eFlyer Data Model** (`toEFlyerPromotionData`).
  - Switch between **Cards View**, **Raw JSON View**, and **SDK Debug Trace View** (showing latency and credential sanitization).

### Stage 4: CI/CD Quality Gates (`pnpm run ci`)
- **Showcase:** Run `pnpm run ci` in terminal.
- **Explain:** *"Every commit passes a single, unified quality gate: typechecking all packages, running Vitest unit tests, executing Next.js E2E tests, verifying PHP test parity, and validating bundle builds."*

---

## 🎯 4. Tailored Discussion Points by Interviewer

### For Chris Seaton (Back-End Team Leader)
- **Error Normalization Across API Versions:**
  - Skiddle API v1 returns `{"error": 1, "errormessage": "..."}` with HTTP 200.
  - Skiddle API v3 returns standard RFC-7807 Problem Details (`{"title": "...", "detail": "..."}`) with HTTP 4xx/5xx.
  - *Your Solution:* `SkiddleRequest.ts` intercepts both formats and normalizes them into a unified, typed `SkiddleException`.
- **Handling Race Conditions in High-Demand Flash Sales:**
  - Discuss inventory locking, idempotency keys on checkout submits, and client-side reservation heartbeats to keep frontend countdowns in sync with backend Redis locks.
- **Diagnostics & Benchmarking:**
  - Walk him through `pnpm cli benchmark` measuring throughput and latency under concurrent stress.

### For Adam Chandler (Front-End Developer)
- **Zero-Dependency Bundle Footprint:**
  - Emphasize why avoiding Axios was intentional: native `fetch` keeps the SDK tiny (11 KB), serverless-friendly, and edge-ready.
- **Server Actions vs. Client-Side Leaks:**
  - Highlight `apps/web/src/app/actions.ts`: API keys are kept securely on the server via `'use server'`, bypassing CORS issues while providing clean TypeScript contracts to React 19 components.
- **Developer Ergonomics:**
  - Walk through the fluent query builder and the typed eFlyer ViewModel (`EFlyerPromotionData`) that converts messy backend schemas into clean UI components.

---

## 💬 5. Answering "When Things Went Awry in the Past"

Be prepared with a crisp, authentic engineering story:

- **Situation:** Flash-sale traffic spike for a high-demand event where thousands of users checked out simultaneously.
- **Obstacle:** Carts were failing at the final confirmation step because client-side reservation countdowns drifted by 3 seconds from the backend Redis allocation lock, causing frustrating `409 Conflict` errors.
- **Action:** Implemented a real-time reservation heartbeat and an optimistic lock countdown in the UI, paired with an idempotency token on the checkout submit button to prevent duplicate charges. When an allocation timed out, instead of crashing the flow, introduced a graceful hold-extension prompt with fallback ticket tiers.
- **Learnings:** Frontend checkout UX cannot treat the backend as an instantaneous database; optimistic updates must always have graceful rollbacks and clear customer messaging.
