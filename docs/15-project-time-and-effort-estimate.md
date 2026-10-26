# Project Time Investment & Engineering Effort Audit

> **Target Audience:** Engineering Leadership & Technical Interview Panel (Adam Chandler, Chris Seaton, Neil Meredith) at Skiddle.  
> **Objective:** Provide a transparent, data-driven estimate of the engineering hours invested in modernizing the Skiddle SDK, building the NX° CLI, developing the Next.js 15 web application, and authoring the automated test and documentation suite.  
> **Living Document Rule:** *Whenever repository documentation is updated, this document must be re-evaluated and synchronized with the latest git history, commit metrics, and test results.*

---

## 📊 1. Executive Summary & Metric Scorecard

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Active Engineering Time** | **~18.5 Hours** | Direct coding, refactoring, benchmark profiling, and test authoring |
| **Total Project Investment** | **~22.0 Hours** | Includes architectural design, telemetry research, and comprehensive docs |
| **Equivalent Developer Days** | **~2.75 Days** | Standard 8-hour senior engineering days |
| **Modernization Commits** | **30 Commits** | Authored by DriveByAbuser across 4 active dates |
| **Total Monorepo Tests** | **129 Tests (100% Pass)** | 120 Vitest (SDK, CLI, Web) + 9 PHPUnit |
| **Architectural Documents** | **16 Guides + Transcript** | Comprehensive technical documentation in `/docs` |
| **Code Additions** | **+24,000 Lines** | Polyglot monorepo across TS, React, Node, and PHP |
| **Current Monorepo Version** | **v1.2.0** | Bumped from v1.1.0 on October 25, 2026 |

---

## 🔬 2. Estimation Methodology

To calculate the time spent accurately and avoid speculative guesswork, the estimation combines four empirical cues from the codebase:

1. **Git Commit Clustering (Session Detection):**
   - Consecutive commits separated by less than **2.5 hours** are grouped into a continuous active working session.
   - A pre-commit buffer of **30–45 minutes** is added to the start of each session to account for planning, researching API structures, and coding prior to the first commit of that session.
2. **Commit Volume & Line Diff Metrics:**
   - Analysis of `git diff --stat a058060..HEAD` indicates 140 files created or modified with 21,800+ net insertions.
3. **Automated Test Pyramid Depth:**
   - 111 automated tests authored across 4 distinct test runners/configurations (`@skiddle/sdk`, `@skiddle/cli`, `apps/web`, and `php/tests`).
4. **Architectural Documentation Footprint:**
   - 15 standalone technical architecture decision records totaling over 2,500 lines of markdown plus a 230+ line chronological migration transcript.

---

## 📅 3. Session-by-Session Git History Breakdown

```
2026-10-15  [==========]  Session 1-3: Legacy Isolation, TypeScript SDK, CLI (4.0h)
2026-10-16  [=========]   Session 4: Turborepo, Next.js 15, Single Event Schema (3.6h)
2026-10-25  [==============] Session 5-8: Event Search, Flash Creative Studio, Docs (7.6h)
2026-10-26  [===]         Session 9: GpxRoute 3D Venue Showcase, PromoFlash & Styling (1.1h)
```

### Day 1 — Thursday, October 15, 2026 (~4.0 Hours)
- **Session 1 (11:13 – 11:38 BST):**
  - Legacy PHP SDK isolation into `/php` (`git mv`).
  - TypeScript SDK toolchain setup (`tsup`, TypeScript 5.7, dual ESM/CJS build).
  - Implementation of `SkiddleSession`, `SkiddleRequest`, and `SkiddleBase`.
  - Initial Vitest test suite.
  - *Span:* 0.42h | *Estimated Effort:* **1.2h**
- **Session 2 (14:55 – 16:01 BST):**
  - NX° Developer Experience CLI (`/packages/cli`) built with zero runtime dependencies.
  - Interactive terminal UI, `doctor` diagnostic suite, live `events` search, and benchmark runner.
  - API v3 parameter normalization (`limit` $\rightarrow$ `page[size]`, `offset` $\rightarrow$ `page[number]`).
  - *Span:* 1.10h | *Estimated Effort:* **1.8h**
- **Session 3 (19:39 – 19:48 BST):**
  - Migration to `pnpm` workspaces.
  - Antigravity AI pair-programming configuration: workspace skills and prompt templates.
  - *Span:* 0.15h | *Estimated Effort:* **1.0h**

### Day 2 — Friday, October 16, 2026 (~3.6 Hours)
- **Session 4 (19:40 – 22:32 BST):**
  - Turborepo monorepo configuration (`turbo.json`) orchestration.
  - Next.js 15 App Router web application setup (`apps/web`).
  - Next.js Server Actions (`actions.ts`) for zero-CORS secure server proxying.
  - Interactive `ApiTester` component with live cards, raw JSON, and sanitized debug traces.
  - Single event detail schema (`SkiddleEventDetail`) and normalized `toEFlyerPromotionData()` helper.
  - GitHub Actions CI pipeline hardening (`.github/workflows/ci.yml`).
  - *Span:* 2.87h | *Estimated Effort:* **3.6h**

### Day 3 — Sunday, October 25, 2026 (~7.6 Hours)
- **Session 5 (10:01 – 10:01 BST):**
  - Architectural interview strategy crystallization: *"A person is a good fit if their code is a good fit."*
  - Counter-narrative to undisciplined "vibe coding": establishing human-architected guardrails.
  - Web showcase landing hero and navigation improvements.
  - *Span:* 0.00h | *Estimated Effort:* **1.0h**
- **Session 6 (12:39 – 15:33 BST):**
  - Real-time `EventSearch` component with 350ms debouncing and `AbortController` cancellation.
  - Multi-facet composition (categories, calendar date picker, text query).
  - Regex-safe text highlighting (`HighlightText.tsx`).
  - Server REST route handlers (`/api/events` and `/api/events/[id]`).
  - Expansion of Vitest test suite to 90 tests.
  - *Span:* 2.90h | *Estimated Effort:* **3.7h**
- **Session 7 (19:13 – 19:54 BST):**
  - Event Promotion Studio (`/events/[id]/promote`) with `@goldlabelapps/flash`.
  - Procedural Web Audio API synthesizer (sawtooth sweeps, clicks, fanfares with 0 KB assets).
  - GSAP timeline animation with 4 narrative beats, timeline scrubber, and fullscreen playback.
  - React Developer Job Spec (Sep 26) integration in footer and public assets.
  - Test suite expansion to 111 tests.
  - *Span:* 0.67h | *Estimated Effort:* **1.4h**
- **Session 8 (20:00 – 21:00 BST):**
  - Version bump to v1.2.0 across root and workspace packages.
  - Authoring Guide 14 (Flash Creative Studio) and Guide 15 (Time Investment Audit).
  - Synchronizing `AGENTS.md` and repository transcripts.
  - *Estimated Effort:* **1.5h**

### Day 4 — Monday, October 26, 2026 (~2.5 Hours)
- **Session 9 (10:40 – 12:10 BST):**
  - GpxRoute 3D Skiddle venue showcase port into Next.js 15 web app (`/gpxroute/skiddle-venue`).
  - Web Component custom elements, iframe postMessage bridge, and responsive `IPhoneFrame` chassis.
  - Promo page route refactoring to canonical `/promo/[id]` with backward compatibility.
  - Test suite expansion to 117 tests.
  - *Estimated Effort:* **1.0h**
- **Session 10 (12:14 – 13:15 BST):**
  - Empirical runtime performance audit comparing Skiddle production (`www.skiddle.com/whats-on/`) vs modern demo explorer (`skiddle.goldlabel.pro/`).
  - Network telemetry, DOM depth profiling (5,557 nodes vs 187 nodes), asset payload benchmarks (1.5 MB JS vs 505 KB).
  - Authored Guide 16 (`docs/16-performance-audit-and-comparison.md`) detailing interview war stories (input debouncing, `useTransition`, `AbortController` cancellation, Redis lock drift, CLS fixes) and actionable recommendations.
  - Synchronized repository transcript and living time estimate.
  - *Estimated Effort:* **1.5h**

---

## 🏛 4. Effort Distribution by Technical Pillar

```
Next.js 15 Web Application & Flash Studio : 7.6h (36%) ██████████████
Architecture, ADRs & Transcripts (16 docs): 4.6h (22%) █████████
Automated Testing & CI (124 tests)        : 3.8h (18%) ███████
Core TypeScript SDK (@skiddle/sdk)        : 2.5h (12%) █████
NX° Developer CLI (@skiddle/cli)          : 2.5h (12%) █████
```

| Pillar | Components / Files | Est. Hours | % of Total |
| :--- | :--- | :--- | :--- |
| **Next.js 15 Web App** | `EventSearch`, `EventDetailClient`, `PromoteFlashMovie`, `SdkAccordion`, `SkiddleVenue`, `IPhoneFrame`, routes | **7.6h** | 36% |
| **Architecture & Docs** | 16 architectural ADRs, interview guide, migration transcript, performance audit | **4.6h** | 22% |
| **Automated Testing & CI** | 115 Vitest tests, 9 PHPUnit tests, Turborepo pipeline, GitHub Actions | **3.8h** | 18% |
| **Core TypeScript SDK** | Zero-dependency client, API v1/v3 routing, fluent builder, eFlyer ViewModel | **2.5h** | 12% |
| **NX° Developer CLI** | Native terminal UI, `doctor`, `events`, `benchmark`, `scenarios` | **2.5h** | 12% |
| **Total** | | **21.0h** | **100%** |

---

## 🔄 5. Maintenance Protocol

As mandated by repository engineering rules:
> **"Whenever we update the docs, make sure & update this time estimate too."**

When authoring new architectural documents or completing major milestones:
1. Run `git log` and extract commit timestamps since the last recorded session.
2. Cluster any new commits into active sessions.
3. Update the **Executive Summary Metric Scorecard** with current test counts (`pnpm test`), commit counts, and version numbers.
4. Add the new session entry under **Section 3**.
5. Recalculate total estimated engineering hours and update the percentage distribution table.
