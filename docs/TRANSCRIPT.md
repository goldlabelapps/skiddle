# Migration Transcript: Porting Skiddle SDK to Modern TypeScript & Node.js

> **Target Audience:** Adam Chandler (Front-End Developer), Chris Seaton (Back-End Team Leader), Neil Meredith (Head of Development) at Skiddle.  
> **Objective:** Document the complete, transparent transcript of steps taken to modernize Skiddle's legacy PHP SDK into a production-grade TypeScript/Node package and Developer Experience CLI.

---

## Chronological Progress Log

### Step 1: Repository Audit & Legacy Isolation
- **Action:** Audited existing codebase (`skiddle-php-sdk`). Identified core components: `SkiddleSession.php`, `SkiddleRequest.php`, `SkiddleBase.php`, `Events.php`, `Artists.php`, `Venues.php`, and PHPUnit tests.
- **Decision:** Moved all legacy PHP SDK files, tests, and demo scripts into an isolated `/php` directory using `git mv`.
- **Rationale:** Preserves historical git attribution, prevents clutter at the repository root, and maintains legacy reference without breaking past commit history.
- **Reference Doc:** [01-project-restructure.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/01-project-restructure.md)

---

### Step 2: Modern JavaScript / TypeScript Toolchain Setup
- **Action:** Established root-level `package.json` with ESM (`"type": "module"`), dual ESM/CJS exports, TypeScript 5.7 configuration, and Vitest test harness.
- **Decision:** Used `tsup` for zero-overhead bundler emitting ESM (`dist/index.js`), CommonJS (`dist/index.cjs`), and TypeScript declaration files (`dist/index.d.ts`).
- **Dependencies:** Selected zero-bloat runtime dependencies: native global `fetch` (Node 18+ and Node 24 support) without Axios or node-fetch bloat; `commander`, `picocolors`, and `prompts` for the developer CLI.
- **Reference Doc:** [02-package-and-toolchain.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/02-package-and-toolchain.md)

---

### Step 3: Architecture & Porting of the SDK to TypeScript
- **Action:** Implemented strongly typed, 1:1 functional parity with the original PHP SDK while applying modern async/await patterns:
  - `SkiddleSession`: API key resolution (explicit config or `SKIDDLE_API_KEY` environment variable), debug mode toggling.
  - `SkiddleRequest`: Clean URL construction, API v1 (`https://www.skiddle.com/api/v1`) vs API v3 (`https://api.skiddle.com/v3`) routing, query transformation (`api_key` → `apiKey`), sensitive credential masking in debug logs, unified error handling supporting both API v1 (`errormessage`) and API v3 (`detail`).
  - `SkiddleBase`: Fluent query condition builder (`addCond`, `delCond`, `clearCond`), automatic uppercasing of the `eventCode` API quirk, and backward-compatible `formatForLog`.
  - `Events`: Implements v3 instant-search (`getListings`) and v1 single-event retrieval (`getListing`).
  - `Artists` & `Venues`: Listing lookups with typed responses.
  - `createClient`: Ergonomic factory function for instant consumption.
- **Reference Doc:** [03-sdk-port-architecture.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/03-sdk-port-architecture.md)

---

### Step 4: Verification & Automated Test Suite
- **Action:** Authored comprehensive unit & integration tests in `tests/sdk.test.ts` covering:
  - Authentication resolution and failure states.
  - API v1 and v3 endpoint generation and key transformation.
  - Error decoding from failed API responses.
  - Fluent condition chaining and removal.
  - Debug credential sanitization.
- **Result:** 14/14 tests passing in Vitest under 400ms.
- **Reference Doc:** [04-testing-and-verification.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/04-testing-and-verification.md)

---

### Step 5: "NX° Developer Experience" CLI (`/cli`)
- **Action:** Built a specialized CLI toolkit in `/cli` executable as `nx` or `skiddle-nx` (`npm run cli`).
- **Features Included:**
  - `doctor`: Validates local environment, checks API key presence, pings API v1 and v3 endpoints, and reports latency.
  - `events [keyword]`: Searches events directly from terminal with formatted pricing, dates, and ticket status.
  - `event <id>`: Inspects detailed payload of a single event.
  - `scenarios [id]`: Executes the 10 classic test scenarios originally written in PHP `loadTest.php`.
  - `benchmark`: Concurrently measures throughput (req/s), average latency, and p50/p95/p99 percentiles.
  - `interactive`: Terminal UI menu for interactive developer exploration.
- **Reference Doc:** [05-nx-developer-experience-cli.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/05-nx-developer-experience-cli.md)

---

### Step 6: Interview Discussion Guide & Architectural Rationale
- **Action:** Created tailored talking points and interview answers addressing Agenda Item 3 (*"Discuss the code you supplied and the rationale behind the decisions you made"*) and Item 4 (*"Questions based on the role and how you handle certain situations"*).
- **Reference Doc:** [06-interview-discussion-guide.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/06-interview-discussion-guide.md)

---

### Step 7: Antigravity AI Prompting Helpers & Agent Automation
- **Action:** Implemented official Antigravity configuration system with automatic progressive discovery:
  - Repository-level rules in `AGENTS.md` and `GEMINI.md`.
  - Workspace skills in `.agents/skills/` (`skiddle-sdk-dev`, `skiddle-cli-dev`, `skiddle-mock-tester`).
  - Pre-engineered prompt helper templates in `.agents/prompts/` (`add-endpoint.md`, `port-php-feature.md`, `add-cli-command.md`, `fix-bug.md`).
- **Reference Doc:** [07-ai-prompting-helpers.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/07-ai-prompting-helpers.md)

---

### Step 8: Polyglot Dual-SDK Restructure (PHP & JavaScript / TypeScript)
- **Action:** Refactored the repository layout to treat both the PHP SDK and the JavaScript / TypeScript SDK as two first-class, equally important SDKs:
  - Moved JavaScript / TypeScript source, tests, and configuration into dedicated `/javascript` workspace.
  - Retained `/php` as a first-class official PHP SDK.
  - Kept `/cli` as a top-level developer companion toolkit.
  - Ensured `/javascript/package.json` has zero production dependencies (100% native web standards).
  - Isolated CLI dependencies (`commander`, `dotenv`, `picocolors`, `prompts`) cleanly inside `/cli/package.json`.
  - Updated root `README.md` and `AGENTS.md` to showcase both languages with equal prominence.

---

### Step 9: PNPM Workspace & Monorepo Toolchain Refactor
- **Action:** Migrated repository package management from plain npm to `pnpm` workspaces:
  - Created `pnpm-workspace.yaml` declaring `javascript` and `cli` packages.
  - Configured root `package.json` with workspace delegation scripts (`pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm cli`).
  - Linked `cli` to the JavaScript SDK via workspace dependency (`"skiddle-sdk": "workspace:*"`), removing fragile relative file imports in favor of clean package resolution.
  - Cleaned up obsolete `package-lock.json` files and generated reproducible `pnpm-lock.yaml`.
  - Configured `allowBuilds` for `esbuild` to support modern pnpm build script security.
  - Updated verification commands and documentation across `README.md`, `AGENTS.md`, docs, skills, and prompt helpers.

---

### Step 10: Skiddle API v3 Compatibility & Pagination Modernization
- **Context & Diagnosis:**
  - Executing scenarios and replay tests revealed repeated failures on the API v3 events endpoint (`/v3/events/instant-search/`):
    `Parameters 'limit' and 'offset' have been deprecated use page[number] and page[size] instead`.
  - Investigation revealed that when the PHP SDK previously switched `Events::getListings()` from API v1 to API v3, `transformRequestKeys` only translated `api_key` $\rightarrow$ `apiKey`, leaving legacy pagination (`limit`/`offset`) and parameter names (`eventcode`, `ticketsavailable`, `b`, `venueid`) untranslated.
  - PHP 8.2+ runtime deprecations were also present due to undeclared dynamic properties (`$debug`, `$api_key`, `$dev_mode`, `$request`, `$conditions`, `$session`).
- **Action & Dual-SDK Implementation:**
  - **Pagination Normalization:** Enhanced `transformRequestKeys()` in both `php/src/SkiddleRequest.php` and `javascript/src/request.ts` to transparently map `limit` $\rightarrow$ `page[size]`, compute `page[number]` from `offset` (`floor(offset / pageSize) + 1`), and omit deprecated `limit`/`offset` keys from v3 requests.
  - **Parameter Normalization:** Remapped legacy parameters for API v3 (`eventcode` $\rightarrow$ `eventCode` with uppercase enforcement, `tickets`/`ticketsavailable` $\rightarrow$ `ticketsAvailable`, `b` $\rightarrow$ `brandId`, `venueid`/`venueId` $\rightarrow$ `venueIds`, and filtered unsupported `order=random`).
  - **PHP 8.2+ Hardening:** Explicitly typed/declared class properties across `SkiddleSession`, `SkiddleRequest`, and `SkiddleBase`, resolving all dynamic property deprecations, and ensured safe API key masking in dev-mode logs.
  - **CLI Scenarios Update:** Updated `cli/src/commands/scenarios.js` to recognize both API v3 response format (`res.data`) and legacy v1 format (`res.results`).
  - **Unit & Live Verification:** Updated Vitest suite (`javascript/tests/sdk.test.ts`), verified clean TypeScript checks (`pnpm typecheck`), and re-executed all 10 CLI scenarios: **10/10 scenarios passed successfully**.
- **Reference Doc:** [08-api-v3-pagination-and-compatibility.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/08-api-v3-pagination-and-compatibility.md)

---

### Step 11: Turborepo Monorepo Architecture & Multi-Package Migration
- **Context & Decision:**
  - Transitioned the repository into a production-grade Turborepo monorepo to support multiple Next.js applications (`apps/`) and reusable, npm-publishable shared libraries (`packages/`).
- **Action & Implementation:**
  - **Directory Structuring:**
    - Created `apps/` and `packages/` boundaries.
    - Moved JavaScript/TypeScript SDK to `packages/sdk` and renamed the package to `@skiddle/sdk`.
    - Moved the developer CLI to `packages/cli` and renamed the package to `@skiddle/cli` to facilitate future npm registry publishing (`npx @skiddle/cli`).
    - Bootstrapped baseline Next.js 15 application in `apps/web` with TypeScript, React 19, and App Router, linked to `@skiddle/sdk` via workspace protocol (`workspace:*`).
  - **Turborepo Orchestration:**
    - Added root `turbo.json` defining dependency graphs and caching outputs for `build`, `test`, `typecheck`, `dev`, and `lint`.
    - Configured `pnpm-workspace.yaml` for `apps/*` and `packages/*`.
    - Replaced root `package.json` task runners with Turborepo commands (`pnpm build`, `pnpm test`, `pnpm typecheck`).
  - **Documentation & Tooling Synchronization:**
    - Updated `README.md`, `AGENTS.md`, and CLI commands to align with scoped packages and updated folder paths.
  - **Verification:**
    - `pnpm turbo run build test typecheck`: 6/6 tasks passed successfully across cold and warm cached runs.
    - `pnpm cli doctor`: 100% operational from root.
    - `php -l php/autoloader.php`: PHP SDK completely unaffected.
- **Reference Doc:** [09-turborepo-monorepo-architecture.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/09-turborepo-monorepo-architecture.md)

---

### Step 12: Interactive API Testing Component & Next.js 15 Integration
- **Context & Decision:**
  - Creating a headless SDK and command-line diagnostics proved core functionality, but demonstrating end-to-end viability in modern frontend applications required an interactive, full-stack visual testing harness.
- **Action & Implementation:**
  - **Full-Stack Server Actions Architecture:** Built `apps/web/src/app/actions.ts` with `'use server'` (`executeSkiddleQuery`), securing environment credentials (`process.env.SKIDDLE_API_KEY`) on the server while eliminating browser CORS restrictions when communicating with `api.skiddle.com` and `www.skiddle.com`.
  - **Fluent Condition Management UI:** Developed the `ApiTester` client component (`apps/web/src/components/ApiTester/ApiTester.tsx`) providing an interactive visual representation of SDK query condition chaining (`addCond`, `delCond`, `clearConditions`, `getConditions`) with tag chips and dynamic custom parameter forms.
  - **Tri-Mode Diagnostic Views:** Engineered three switchable inspection modes:
    - *Cards View*: Rich presentation layer with responsive cards, lazy loading, date formatting, pricing badges, and fallback image placeholders.
    - *Raw JSON View*: Formatted syntax-highlighted response contracts with a 1-click clipboard copy utility.
    - *SDK Debug Trace View*: Real-time telemetry displaying latency in milliseconds, HTTP status, and sanitized URLs with masked API credentials from `client.getDebugInfo()`.
  - **Preset Integration Demos & Error Trapping:** Added one-click shortcuts for classic scenarios (Manchester Live, UK Festivals, Creamfields, Single Event #42616476, Venues, Artists) and an explicit error handling test validating `SkiddleException` handling.
- **Verification:** Verified with `pnpm --filter web typecheck` and `pnpm --filter web build`.
- **Reference Doc:** [10-interactive-api-testing-component.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/10-interactive-api-testing-component.md)

### Step 12: Event Detail Schema & eFlyer Promotion Model Definition
- **Date:** 2026-10-16
- **Context & Decision:**
  - Standardized the single event data shape (`/api/v1/events/{id}/`) required for generating eFlyer promotional campaigns, marketing emails, and rich event previews.
- **Action & Implementation:**
  - **TypeScript Interfaces (`packages/sdk/src/types.ts`):** Defined `SkiddleEventDetail`, `SkiddleEventDetailVenue`, `SkiddleEventOpeningTimes`, `SkiddleEventGenreDetail`, `SkiddleEventRep`, and `SkiddleEventArtistDetail`.
  - **Execution & Response Envelopes:** Defined `SkiddleSingleEventApiResponse<T>` and `SkiddleSingleEventExecutionResult<T>` ensuring type safety across Server Actions and diagnostic traces.
  - **Normalized eFlyer Model & Helper (`packages/sdk/src/eflyer.ts`):** Created `EFlyerPromotionData` and the `toEFlyerPromotionData()` converter to automatically map raw event details into a clean ViewModel (handling cancellation booleans, hero image fallbacks, hex color themes, and formatted door timings).
  - **SDK Method Typing (`packages/sdk/src/events.ts`):** Enhanced `Events.getListing<T = SkiddleEventDetail>()` to default to `SkiddleEventDetail`.
- **Verification:** Tested with Vitest unit tests in `packages/sdk/tests/sdk.test.ts` and monorepo typecheck via `pnpm typecheck`.
- **Reference Doc:** [11-event-detail-and-eflyer-schema.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/11-event-detail-and-eflyer-schema.md)

---

### Step 13: Interview Strategy Crystallization & Interactive Event Selection
- **Date:** 2026-10-25
- **Context & Decision:**
  - Crystallized the core engineering philosophy for the upcoming Skiddle developer interview (candidate 6/6): *"A person is a good fit if their code is a good fit."*
  - Addressed the AI stigma head-on: establishing that this is **Agentic AI Engineering under Strict Human-Architected Guardrails**, not undisciplined "vibe coding".
  - Elevated the Day-0 Developer Experience CLI (`pnpm install && pnpm cli`) as the primary zero-onboarding entry point for any developer.
- **Action & Implementation:**
  - **Interactive Event Selection in Web UI:** Updated `ApiTester.tsx` and `ApiTester.module.css` so that selecting any live event in the search cards immediately transitions to single-event inspection (`/api/v1/events/{id}/`), rendering deep-dive venue addresses, door opening times, age restrictions, and promotional metadata with seamless back-navigation.
  - **Landing Showcase:** Created a modern showcase hero on `apps/web/src/app/page.tsx` introducing the monorepo architecture, Day-0 CLI quickstart, zero-dependency SDK benefits, and live API exploration.
  - **Comprehensive Interview Defense Guide:** Overhauled `docs/06-interview-discussion-guide.md` with targeted architectural defense strategies for Adam Chandler (Frontend) and Chris Seaton (Backend), the 4-stage walkthrough script, and the counter-narrative to "vibe coding".
  - **Documentation Alignment:** Synchronized `README.md`, `packages/cli/README.md`, and `AGENTS.md` to reinforce the Day-0 DX ethos and guardrails philosophy.
- **Verification:**
  - `pnpm --filter web typecheck` and `pnpm --filter web test`: 10/10 tests passed cleanly.
  - `pnpm run ci`: Full repository quality gate passed.
- **Reference Doc:** [06-interview-discussion-guide.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/06-interview-discussion-guide.md)

---

### Step 14: Real-Time Event Search, Multi-Facet Filtering & Discovery Architecture
- **Date:** 2026-10-25
- **Context & Decision:**
  - Transitioned the Next.js web application from diagnostic API testing (`ApiTester`) into a full-fledged marketing discovery and promotion portal (`EventSearch`).
  - Addressed client-side performance, race conditions during fast keystrokes, secure credential handling, and regex safety.
- **Action & Implementation:**
  - **`EventSearch` Component (`apps/web/src/components/EventSearch/EventSearch.tsx`):** Built interactive search with 350ms debouncing, React 19 `startTransition`, native `AbortController` cancellation for in-flight requests, and initial state suppression (no empty states/spinners before user input).
  - **Multi-Facet Query Composition:** Supported real-time filtering across keyword, event category (`eventcode` mapping: LIVE, CLUB, FEST, COMEDY, etc.), and event date (`bdate`).
  - **Regex-Safe Text Highlighting (`HighlightText.tsx`):** Created a sanitizing text highlighter escaping special regex characters (`[`, `]`, `(`, `)`, `*`, `+`) with high-contrast `<mark>` styling.
  - **Server REST Route Handlers (`apps/web/src/app/api/events/route.ts` & `apps/web/src/app/api/events/[id]/route.ts`):** Next.js 15 App Router endpoints initializing `@skiddle/sdk` on the server using `process.env.SKIDDLE_API_KEY`, eliminating CORS restrictions and client credential exposure.
  - **Promote Event Workflow Integration:** Connected search cards directly to `/events/[id]` for single event detail inspection and eFlyer promotion configuration.
  - **Unit Testing Suite (`apps/web/tests/unit/event-search.test.tsx`):** Authored 5 Vitest tests covering substring matching, case-insensitivity, regex token safety, null handling, and mount state isolation.
- **Verification:**
  - `pnpm --filter web test`: 15/15 unit and E2E tests passing.
  - `pnpm typecheck`: Monorepo type safety verified.
- **Reference Doc:** [13-event-search-filter-and-discovery.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/13-event-search-filter-and-discovery.md)

---

### Step 15: Monorepo Test Suite Modernization & Full Quality Gate Hardening
- **Date:** 2026-10-25
- **Context & Decision:**
  - Following the implementation of Next.js 15 route handlers, promotion detail server components, and multi-facet event filtering, modernized the entire monorepo test suite to achieve full automated coverage across all newly added runtime contracts.
  - Ensured strict network isolation, deterministic Vitest mocking, and complete parity between the JavaScript/TypeScript and PHP SDKs.
- **Action & Implementation:**
  - **Next.js 15 Route Handlers (`apps/web/tests/unit/api-routes.test.ts` — 8 tests):**
    - Tested `/api/events`: missing server API key rejection (500), query parameter sanitization (`keyword`, `eventcode`, `date`, `limit`), limit boundary clamping ($[1, 50]$), SDK v3 parameter translation (`eventCode`, `page[size]`), and `SkiddleException` HTTP status mapping.
    - Tested `/api/events/[id]`: missing ID rejection (400), missing server key rejection (500), single event retrieval with debug telemetry, and 404 propagation.
  - **Event Detail Server Component & Metadata (`apps/web/tests/unit/event-detail-page.test.tsx` — 4 tests):**
    - Tested `generateMetadata` contract producing dynamic SEO and social titles for target event IDs.
    - Tested `EventDetailPage` server rendering: API key missing screen, error recovery on missing listing/API rejection, and `EventDetailClient` rendering with lineup and pricing.
  - **Event Search & Normalization (`apps/web/tests/unit/event-search.test.tsx` — 11 tests):**
    - Tested `CATEGORIES` configuration, `stripHtml` tag stripping/trimming, and `normalizeEvent` transformation across legacy v1 and modern v3 response payloads.
  - **Global Footer Navigation (`apps/web/tests/unit/footer.test.tsx` — 1 test):**
    - Validated developer resource links (`/sdk`, Promotion Centre, API docs, GitHub repo), Skiddle navigation links, and copyright elements.
  - **CLI Discovery Parity (`packages/cli/tests/e2e.test.js` — 7 tests):**
    - Added test verifying `searchEventsCommand` rendering against API v3 response structures (`data` array and `meta.totalresults`).
  - **PHP SDK Entity Parity (`php/tests/EventsTest.php` — 4 tests):**
    - Added `testArtistsAndVenuesFluentConditions` testing PSR-4 parity for `Artists` and `Venues` fluent condition builders.
  - **Documentation Alignment:** Updated `apps/web/README.md`, `docs/04-testing-and-verification.md`, `docs/12-tdd-testing-suite-and-ci-cd.md`, and `docs/TRANSCRIPT.md`.
- **Verification:**
  - `pnpm test`: 90/90 Vitest tests passed across `@skiddle/sdk` (33), `@skiddle/cli` (23), and `apps/web` (34).
  - `php php/tests/run.php`: 9/9 PHP tests passed.
  - `pnpm typecheck` & `pnpm lint`: Zero errors across the monorepo.
  - Total: **99 automated tests** passing at 100% green.
- **Reference Docs:** [04-testing-and-verification.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/04-testing-and-verification.md), [12-tdd-testing-suite-and-ci-cd.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/12-tdd-testing-suite-and-ci-cd.md)

---

### Step 16: Event Promotion Studio, Flash Creative Engine & Job Spec Integration
- **Date:** 2026-10-25
- **Context & Decision:**
  - Standard event ticketing cards are functional, but promotional campaigns require high-energy, dynamic visual assets.
  - Created a dedicated promotional studio generating nostalgic, interactive Flash-style motion graphics powered by `@goldlabelapps/flash` and GSAP without bundling heavy video/audio media files.
- **Action & Implementation:**
  - **Flash Motion Graphics Studio (`PromoteFlashMovieClient.tsx`):**
    - Built interactive canvas engine using `@goldlabelapps/flash` (`Stage`, `CleverText`, `LightningBolt`) and GSAP timeline interpolation.
    - 4-beat narrative sequence: Intro electric burst $\rightarrow$ Artist lineup $\rightarrow$ Venue & British date $\rightarrow$ Pricing & Ticket CTA.
    - Zero-asset Web Audio API procedural synthesizer producing realtime retro sound effects (sawtooth sweeps, UI clicks, fanfares) on user gesture.
    - Complete player controls: timeline scrubber, play/pause, restart, fullscreen toggle, audio mute, and 1-click clipboard link sharing.
  - **Server Route & Page (`/events/[id]/promote`):**
    - Server Component fetching event metadata and passing typed payload into the client canvas studio.
  - **Event Detail Client Enhancements (`EventDetailClient.tsx`):**
    - Added direct links to promotional studio (`/events/[id]/promote`), richer ticket breakdown, artist lineups, and venue metadata.
  - **React Developer Job Spec (Sep 26) Integration:**
    - Placed official PDF in `apps/web/public/React Developer Job Spec - Sep 26.pdf` and `docs/`.
    - Added persistent footer access link and verified with unit testing in `footer.test.tsx`.
- **Verification:**
  - `pnpm --filter web test tests/unit/promote-page.test.tsx`: 4/4 tests passed cleanly.
  - Monorepo automated test count increased to **111 total tests** (102 Vitest, 9 PHPUnit).
- **Reference Doc:** [14-event-promotion-and-flash-creative-studio.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/14-event-promotion-and-flash-creative-studio.md)

---

### Step 17: Release v1.2.0, Documentation Sync & Project Time Estimation Audit
- **Date:** 2026-10-25
- **Context & Decision:**
  - Bumped monorepo release version to `1.2.0` across workspace packages following the delivery of the discovery search and promotional motion studio.
  - Performed an empirical time investment audit across git history and codebase cues, establishing an ongoing protocol to update the estimate whenever docs are modified.
- **Action & Implementation:**
  - **Version Bumping:**
    - Monorepo root `package.json`: `1.1.0` $\rightarrow$ `1.2.0`.
    - `apps/web/package.json`: `0.1.0` $\rightarrow$ `0.2.0`.
    - `packages/sdk/package.json`: `1.0.0` $\rightarrow$ `1.1.0`.
    - `packages/cli/package.json`: `1.0.0` $\rightarrow$ `1.1.0`.
  - **Time Investment Audit (`docs/15-project-time-and-effort-estimate.md`):**
    - Grouped 25 modernization commits into 8 distinct work sessions.
    - Calculated total active engineering time (~15.2h) and total investment including architecture and testing (~18.0h / 2.25 dev days).
    - Documented pillar breakdown: Web App & Studio (33%), Testing & CI (19%), Documentation & Transcripts (19%), SDK (14%), CLI (14%).
  - **Maintenance Protocol Enforcement:**
    - Added mandatory rule to `AGENTS.md` requiring time estimate updates alongside any future doc revisions.
- **Verification:**
  - Monorepo test suite: 111/111 passing tests.
- **Reference Doc:** [15-project-time-and-effort-estimate.md](file:///Users/milky/My%20Drive/GitHub/skiddle/docs/15-project-time-and-effort-estimate.md)




---

### Step 18: GpxRoute 3D Skiddle Venue Port & Promo Route Refactor
- **Date:** 2026-10-26
- **Context & Decision:**
  - Ported the responsive GpxRoute 3D venue showcase (`/gpxroute/skiddle-venue`) from `listingslab` into the Skiddle project.
  - Refactored the promotional Flash movie experience route from `/events/[id]/edit` to a clean dedicated top-level route `/promo/[id]`, while maintaining backwards-compatible re-exports at `/events/[id]/edit` and `/events/[id]/promote`.
- **Action & Implementation:**
  - **SkiddleVenue & 3D Web Component Engine (`apps/web/src/components/SkiddleVenue/`):**
    - Implemented `SkiddleVenue` React component, Web Component custom elements (`<skiddle-venue>`, `<gpx-route>`), iframe postMessage bridge, URL constructors, and dimension formatting.
    - Implemented high-fidelity `IPhoneFrame` chassis with Dynamic Island, iOS status bar, hardware side buttons, and CSS module styling with responsive desktop aspect ratios.
  - **GpxRoute Venue Subpage (`/gpxroute/skiddle-venue`):**
    - Deployed route at `apps/web/src/app/gpxroute/skiddle-venue/page.tsx` rendering Hare and Hounds Kings Heath 3D Cesium orbit scene.
  - **Promo Route Refactor (`/promo/[id]`):**
    - Created `apps/web/src/app/promo/[id]/page.tsx` as the canonical promotional Flash studio route.
    - Updated `EventDetailClient.tsx` to link to `/promo/${id}`.
    - Maintained backwards-compatible aliases at `apps/web/src/app/events/[id]/edit/page.tsx` and `/events/[id]/promote/page.tsx`.
  - **Automated Testing & Path Aliases:**
    - Configured `@/` path alias in `apps/web/vitest.config.ts`.
    - Added unit test suite `apps/web/tests/unit/gpxroute-venue-page.test.tsx` (6 tests).
    - Updated `promote-page.test.tsx` and `event-detail-page.test.tsx`.
- **Verification:**
  - Monorepo automated test suite: **117 total tests** passing (108 Vitest, 9 PHPUnit) across 100% green suites.
  - `pnpm typecheck`: Clean compilation with zero TypeScript errors.

---

### Step 19: Performance Audit & Benchmarking (Skiddle vs Demo Explorer)
- **Date:** 2026-10-26
- **Context & Decision:**
  - Prepared empirical performance research for Skiddle engineering interview with Adam Chandler (Front-End) and Chris Seaton (Back-End Team Leader).
  - Executed side-by-side technical audit between the official event listings interface (`https://www.skiddle.com/whats-on/`) and the modern Next.js 15 demo explorer (`https://skiddle.goldlabel.pro/`).
- **Action & Implementation:**
  - **Empirical Scorecard & Network Telemetry:**
    - HTML Document Size: 20.5 KB (demo) vs 503.9 KB (Skiddle) — 96% smaller payload (24.5x reduction).
    - Initial DOM Nodes: 187 (demo) vs 5,557 (Skiddle) — 96.6% fewer DOM elements.
    - Server TTFB: 140–180ms (demo on Cloudflare Edge) vs 520–1,610ms (Skiddle origin SSR behind CloudFront `no-store`).
    - Total JavaScript: 505.7 KB (demo chunked ESM) vs 1,546.8 KB (Skiddle monolithic + 3rd-party ad/tracking/bot scripts).
    - Total CSS: 15.6 KB (demo modular) vs 243.6 KB (Skiddle multi-sheet legacy styles).
    - Third-party script burden: 0 trackers (demo) vs 9 major tracking/analytics/WAF scripts on Skiddle (AWS WAF challenge, GTM, Meta Pixel, Sentry, Hotjar, jQuery, Moment.js).
  - **Interview Battle Stories & Debugging Methodologies:**
    - Documented real-world debugging case studies: search input latency/jank resolved via 350ms debouncing and React 19 `useTransition`; fast-typing network race conditions eliminated via `AbortController` cancellation in REST lookup effects; flash-sale ticket reservation drift resolved via monotonic server-synced timestamps and idempotency keys; Cumulative Layout Shift (CLS) reduced from 0.32 to 0.00 via fixed aspect-ratio container wrappers and skeleton placeholders.
  - **Actionable Architectural Recommendations:**
    - Formulated targeted engineering recommendations for both Skiddle production (edge caching with `s-maxage=60, stale-while-revalidate=300`, Partytown web workers for third-party tags, Moment.js/jQuery deprecation, list virtualization) and our demo explorer (upstream API Redis caching, hover-triggered route prefetching).
- **Verification & Documentation:**
  - Authored comprehensive report: [`docs/16-performance-audit-and-comparison.md`](./16-performance-audit-and-comparison.md).
  - Updated monorepo documentation index and time investment audit.

---

### Step 20: Promo Route AppShell Chrome Isolation & White Canvas Styling
- **Date:** 2026-10-26
- **Context & Decision:**
  - For the interactive promo experience route (`/promo/[id]`, e.g., `http://localhost:3000/promo/43032215`), global navigation elements (Header and Footer) cluttered the canvas.
  - Implemented an `AppShell` component that dynamically detects promo routes using `usePathname()` and omits `<Header />` and `<Footer />` while preserving full chrome across all standard routes (`/`, `/events/...`, `/sdk`).
  - Switched the promo page background color to clean white (`#ffffff` / `bg-white`) ensuring optimal contrast for the floating 3D iPhone chassis and back-navigation badge.
- **Verification & Testing:**
  - Authored `apps/web/tests/unit/app-shell.test.tsx` verifying route chrome exclusion.
  - Updated `apps/web/tests/unit/promote-page.test.tsx` asserting white background styles.
  - 100% test pass rate across 126 monorepo tests (117 Vitest, 9 PHPUnit).

---

### Step 21: Modular PromoFlash Architecture & SkiddleLogoMC Animation
- **Date:** 2026-10-26
- **Context & Decision:**
  - Transitioned the promo screen inside the iPhone view area from the raw GPX route component to a dedicated, modular Flash motion graphic engine named `PromoFlash`.
  - Removed the back-navigation button to make `PromoFlash` the sole component rendered in the phone screen view area.
  - Structured `PromoFlash` as a modular folder adhering to classic Flash architecture:
    - `MovieClips/SkiddleLogoMC`: Vector MovieClip faithfully constructed from `/skiddle-logo-dark.svg`.
    - `ActionScript/promoActionScript`: GSAP timeline animating the Skiddle logo smoothly into perfect vertical and horizontal center (`v & h`).
    - Barrel exports (`index.ts`) for clean re-exports of components and ActionScript timelines.
  - Set up `PromoFlash` on the `@goldlabelapps/flash` `Stage`.
- **Verification & Testing:**
  - Authored `apps/web/tests/unit/promo-flash.test.tsx` (3 tests) covering `PromoFlash`, `SkiddleLogoMC`, and `promoActionScript`.
  - Updated `apps/web/tests/unit/promote-page.test.tsx` verifying `PromoFlash` presence and back button removal.
  - Monorepo tests: 129 total tests passing (120 Vitest, 9 PHPUnit) across 100% green suites.

---

### Step 22: Promo Page Desktop Spacing & Light Background Drop Shadow Tuning
- **Date:** 2026-10-26
- **Context & Decision:**
  - With the promo experience set on a clean white canvas (`#ffffff`), the iPhone graphic's previous dark-mode radial halo (`0 0 50px rgba(0,0,0,0.5)`) and harsh `0.85` black drop shadow appeared overly stark and unnatural.
  - Introduced explicit `variant?: 'light' | 'dark'` support on `IPhoneFrame` (with default `'light'` and explicit `'dark'` for the venue 3D route).
  - Engineered an ultra-smooth, downward studio drop shadow tailored specifically for white backgrounds:
    - Subtle anti-aliased rim: `0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 0 2px #1e293b`.
    - Soft ambient ground shadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1)`.
    - Multi-layered directional elevation: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 35px 70px -15px rgba(0, 0, 0, 0.15)`.
    - Eliminated the un-directional `0 0 50px` dark smudge.
  - Increased desktop vertical breathing room above and below the device by updating container padding to `md:p-8` (32px top/bottom) and expanding desktop frame bounds from `calc(100dvh - 32px)` to `calc(100dvh - 64px)`.
- **Verification & Testing:**
  - Verified `apps/web/tests/unit/promote-page.test.tsx` and full web test suite (64 tests passing).
  - 100% test pass rate across 129 monorepo tests (120 Vitest, 9 PHPUnit) and clean TypeScript typecheck.

---

### Step 23: Cross-Package Linking & `corkscrew` ActionScript Implementation
- **Date:** 2026-10-26
- **Context & Decision:**
  - Configured parallel development between `@goldlabelapps/flash` (in `nx-private/packages/flash`) and `skiddle/apps/web` using the `link:` protocol in `package.json` (`"@goldlabelapps/flash": "link:../../../nx-private/packages/flash"`) and Next.js `transpilePackages`.
  - Added watch build script (`"dev": "tsc -p tsconfig.build.json --watch"`) in `packages/flash/package.json`.
  - Authored `corkscrewActionScript`, `corkScrew`, and `asMovieClip` in `@goldlabelapps/flash`:
    - Simulates the screw-like silhouette of the Skiddle logo threading in ("in") or unscrewing out ("out").
    - Drives 720° (2 full rotations) along the Z-axis paired with exponential scale and autoAlpha easing via GSAP.
    - Exposes classic ActionScript method chaining via `asMovieClip(target).corkScrew("in" | "out")`.
  - Consumed directly inside Skiddle's `PromoFlash` component:
    - Auto-plays `moviName.corkScrew("in")` on mount.
    - Provides interactive click/tap toggling between "in" and "out".
- **Verification & Testing:**
  - Built `packages/flash` with TypeScript declaration and bundle generation.
  - Verified `skiddle/apps/web` typecheck and unit test suite (10 test files, 61 tests passing).
  - Monorepo test suite remains 100% green.

---

### Step 24: Dynamic SEO, OpenGraph & Twitter Card Metadata for `/promo/[id]`
- **Date:** 2026-10-26
- **Context & Decision:**
  - Implemented dynamic `generateMetadata` on the Promo page (`/promo/[id]`):
    - Document title dynamically displays event title (`eventname`).
    - Meta description renders cleaned plain text from the event description.
    - OpenGraph (`og:image`) and Twitter card (`twitter:image`, `card: 'summary_large_image'`) feature the event's high-resolution `largeimageurl` (with fallback to `imageurl`).
  - Utilized React `cache()` for request-level memoization of `getEvent(id)` to prevent duplicate network calls between `generateMetadata` and `PromoPage`.
  - Added unit test cases in `apps/web/tests/unit/promote-page.test.tsx` verifying fallback and successful metadata generation.
- **Verification & Testing:**
  - `pnpm --filter web test tests/unit/promote-page.test.tsx` (5/5 tests passing).
  - `pnpm --filter web typecheck` (0 errors).
  - Full test suite verified green.

---

### Step 25: TitleText MovieClip & Logo Fade Sequence
- **Date:** 2026-10-26
- **Context & Decision:**
  - Designed and authored the `TitleText` MovieClip component in `@goldlabelapps/flash`:
    - Responsive multi-line typography scaling (`autoSize`) based on character length (`>60 chars` -> `1.125rem`, `>35 chars` -> `1.35rem`, `>20 chars` -> `1.5rem`, `<=20 chars` -> `1.75rem`).
    - Hyphenation, word break, and max-width wrapping preventing canvas boundary overflows.
    - Extended `asMovieClip` with `fadeIn` and `fadeOut` ActionScript methods.
  - Sequenced the timeline inside `PromoFlash`:
    - 1. Skiddle logo corkscrews in.
    - 2. Holds for 1.0 second.
    - 3. Skiddle logo smoothly fades out.
    - 4. `TitleText` component smoothly fades in, centered vertically and horizontally.
    - 5. Click/tap on stage cleanly replays the sequence.
- **Verification & Testing:**
  - Added test case in `apps/web/tests/unit/promo-flash.test.tsx` verifying multi-line `TitleText` rendering and dynamic font scaling.
  - 10 test files, 63 tests passing (100% green).

---

### Step 26: CleverText Typewriter Title Animation & React Singleton Deduplication
- **Date:** 2026-10-26
- **Context & Decision:**
  - Integrated `CleverText` from `@goldlabelapps/flash` to typewrite the event title in real-time as the logo fades out.
  - Added `active?: boolean` support to `CleverText` so typing triggers deterministically when the logo fade-out completes.
  - Configured React singleton deduplication in `vitest.config.ts` (`resolve.dedupe: ['react', 'react-dom']` + aliases) to prevent duplicate React runtime instances across cross-repo workspace symlinks in Node SSR test runners.
  - Styled title container with dynamic responsive typography scaling down font size and line height for long multi-line event titles.
- **Verification & Testing:**
  - `pnpm --filter web test:unit` passing all 63 tests across 10 test files.
  - `pnpm --filter web build` production compilation passing with zero errors.

---

### Step 27: ImageMC MovieClip & API Image Routing Architecture
- **Date:** 2026-10-26
- **Context & Decision:**
  - Audited and established image routing rules from Skiddle API event data:
    - `largeimageurl`: High-resolution asset designated for document OpenGraph (`og:image`) and Twitter (`twitter:image`, `card: 'summary_large_image'`) social cards.
    - `imageurl`: Standard event thumbnail designated for the interactive `ImageMC` visual component.
  - Authored `ImageMC` MovieClip in `@goldlabelapps/flash`:
    - Responsive 4:3 aspect ratio containment, smooth 12px border radius, subtle ambient elevation shadow, and eager loading.
  - Integrated `ImageMC` into `PromoFlash` with `ref={imageRef}`, ready for the upcoming movieclip animation sequence.
- **Verification & Testing:**
  - Added unit test in `apps/web/tests/unit/promo-flash.test.tsx` asserting `ImageMC` rendering when `imageurl` is supplied.
  - Web unit tests passing 64/64 tests across 10 test files.

---

### Step 28: Public Docs Consolidation & Candidate CV Link Integration
- **Date:** 2026-10-26
- **Context & Decision:**
  - Removed redundant root copy of `React Developer Job Spec - Sep 26.pdf` from `docs/` in favour of the single source of truth in `apps/web/public/docs/`.
  - Moved candidate CV (`Chris Dorward - CV.pdf`) from root `docs/` into `apps/web/public/docs/Chris Dorward - CV.pdf`.
  - Added "CV" link to the Candidate navigation column in `Footer.tsx` (`/docs/Chris%20Dorward%20-%20CV.pdf`) opening securely in a new tab (`target="_blank"` and `rel="noopener noreferrer"`).
  - Updated `apps/web/tests/unit/footer.test.tsx` with assertions for candidate CV link.
- **Verification & Testing:**
  - `pnpm --filter web test tests/unit/footer.test.tsx` passed (100% green).

---

### Step 29: Event Detail API Data Tab Image Reorganization
- **Date:** 2026-10-26
- **Context & Decision:**
  - Reorganized the `EventDetailClient` structured "API Data" tab:
    - Moved the image card section from above the description to the very bottom, after Description and Data Grid (Venue, Timings, Artists).
    - Refactored the image display to exclusively feature the large flyer image (`largeimageurl`), removing the standard image (`imageurl`) preview from this section.
    - Enhanced the preview container height to 380px for optimal flyer detail and aspect ratio fidelity.
- **Verification & Testing:**
  - Updated `apps/web/tests/unit/event-detail-page.test.tsx` asserting `largeimageurl` is rendered at the bottom and standard `imageurl` is omitted from that section.
  - Verified tests pass 5/5 and typecheck passes with zero errors.

---

### Step 30: Large Image MovieClip Animation & Separation Choreography
- **Date:** 2026-10-26
- **Context & Decision:**
  - Updated `PromoFlash` to prioritize the high-resolution event artwork (`largeimageurl` / `largeImageUrl` / `largeimage`) for the `ImageMC` MovieClip.
  - Authored `separatePromoActionScript`:
    - Synchronized timeline factory driving `CleverText` and `ImageMC` into elegant counter-motion.
    - Translates `CleverText` up (`y: -130`, `ease: 'power3.inOut'`) to the upper promotional zone.
    - Unfolds `ImageMC` down (`y: 110`, scaling `0.88` to `1.0`, fading `0` to `1.0`, `ease: 'power3.out'`) to the lower framing area.
    - Preserves centered alignment with `xPercent: -50, yPercent: -50` on initial reset.
  - Replays smoothly on user tap/click.
- **Verification & Testing:**
  - Added unit test in `apps/web/tests/unit/promo-flash.test.tsx` asserting `separatePromoActionScript` timeline creation and `largeimageurl` asset priority.
  - All 67 unit tests and 3 e2e web tests passing with zero errors and clean lint.

---

### Step 31: Promo Action Buttons MovieClip & 1-by-1 Presentation Choreography
- **Date:** 2026-10-26
- **Context & Decision:**
  - Designed and authored modular Action Buttons MovieClip (`PromoActionsMC`) and animation sequence timeline (`promoActionsActionScript`) positioned at the bottom of the Promo page.
  - Implemented 1-by-1 sequential entrance animation:
    1. Each action button starts offscreen below the bottom of the Promo container, centered horizontally ("right in the middle horx").
    2. Slides in along the middle horizontal axis, popping up just slightly above its resting row position (`y: -popLift` / 68px above resting) with top z-index (`z-index: 1000`) and pop-up scale (`scale: 1.35`, ease: `back.out(1.15)`).
    3. Action description pill (`z-index: 10001`) fades in directly above the popped-up icon (`bottom: 160px`), holds for reading, and cleanly fades out.
    4. Button shrinks down (`scale: 1.0`, ease: `power3.out`) from the center into its designated slot in the auto-spaced bottom row.
    5. Repeats seamlessly for each successive button in the configurable action set.
  - Implemented default action buttons:
    - Button 1: **Facebook** (`#1877F2`, standard white Facebook "f" icon) with description text *"Share to Facebook"*, opening the Facebook share dialog.
    - Button 2: **Twitter (X)** (`#000000`, crisp white geometric X icon) with description text *"Share to X"*, opening the X tweet intent dialog with pre-filled event title.
    - Button 3: **Email** (`#ea4335`, clean white envelope icon) with description text *"Share via Email"*, triggering native `mailto:` with formatted subject and body.
    - Button 4: **Search** (`#111827`, clean white magnifying glass icon) with description text *"More events"*, navigating to event search (`/`).
  - Added support for arbitrary extensible action configurations (`PromoActionButton[]`) with auto-spaced flexbox distribution across the bottom row.
- **Verification & Testing:**
  - Authored unit tests in `apps/web/tests/unit/promo-flash.test.tsx` asserting:
    - Rendering of `PromoActionsMC` with Facebook and Search buttons and aria labels.
    - Rendering of custom action buttons (e.g. WhatsApp) in auto-spaced layout.
    - Initialization and execution of `promoActionsActionScript` GSAP timeline.
  - Web unit tests passing 70/70 tests across 10 test files; production build passing clean.

---

### Step 32: Standardized Large Flyer Artwork to 1:1 Square Aspect Ratio
- **Date:** 2026-10-26
- **Context & Decision:**
  - Standardized all large image displays and MovieClips after confirming Skiddle high-resolution artwork (`largeimageurl`) is 1:1 square.
  - In `@goldlabelapps/flash`:
    - Updated `ImageMC` component default `aspectRatio` from `4/3` to `1/1` for square flyer rendering.
    - Rebuilt `@goldlabelapps/flash` package (`npm run build`).
  - In `PromoFlash`:
    - Set `aspectRatio="1/1"` on `ImageMC` within `PromoFlash.tsx`.
  - In `EventDetailClient`:
    - Updated `.imagePreview` and `.noImagePlaceholder` in `EventDetail.module.css` to `aspect-ratio: 1 / 1` (with `max-width: 440px`), ensuring flyers display in their native 1:1 framing without distortion or letterboxing.
- **Verification & Testing:**
    - Updated `apps/web/tests/unit/promo-flash.test.tsx` asserting `aspect-ratio:1/1`.
    - Verified all 70 unit tests in `apps/web` pass with zero regressions.

---

### Step 33: Event Description Presentation Underneath Featured Image in PromoFlash
- **Date:** 2026-10-27
- **Context & Decision:**
  - Added event description presentation underneath the featured image in `PromoFlash`.
  - Implemented `cleanDescription` utility function that strips HTML tags (`<p>`, `<div>`, etc.), decodes common HTML entities (`&amp;`, `&#39;`, `&pound;`, `&quot;`, `&nbsp;`), and normalizes whitespace for clean rendering on the promotional canvas.
  - Positioned the description element underneath the featured `ImageMC` artwork with responsive clamp (`WebkitLineClamp: 3`) and dynamic typography scaling (reducing font size from `0.8125rem` to `0.75rem` when descriptions exceed 180 characters).
  - Enhanced `separatePromoActionScript`:
    - Added `descriptionTarget` and `descriptionY` support to `SeparatePromoActionScriptOptions`.
    - Coordinates three-tier motion choreography when description is present: moves `CleverText` headline up (`y: -150`), unfurls `ImageMC` (`y: -10`, with compact width `220px` to optimize vertical clearance), and fades in the description smoothly underneath the image (`y: 155`).
    - Gracefully falls back to 2-tier positioning (`textY = -130`, `imageY = 110`, full `260px` image) when no description exists.
  - Re-exported `cleanDescription` from `@skiddle/components/PromoFlash` and consumed in `/promo/[id]/page.tsx` for metadata generation.
- **Verification & Testing:**
  - Added 6 unit tests to `apps/web/tests/unit/promo-flash.test.tsx` verifying:
    - HTML stripping and entity decoding in `cleanDescription`.
    - Rendering of event description underneath `ImageMC` with `width:220px` scale adjustment.
    - Explicit `description` prop override support.
    - Typography auto-sizing down to `0.75rem` for long descriptions ($>180$ chars).
    - Omission of description container when description is empty.
    - Initialization of `separatePromoActionScript` timeline with `descriptionTarget`.
  - All 146 monorepo tests passing: 76 Vitest (web) + 38 Vitest (sdk) + 23 Vitest (cli) + 9 PHPUnit. Full monorepo typecheck and linting clean.

---

### Step 34: Social Sharing (react-share), Search Routing & Animated Zoom-in Email Modal with Prospect Light Template
- **Date:** 2026-10-27
- **Context & Decision:**
  - Connected the bottom action buttons in `PromoActionsMC` to live production functionality:
    1. **Facebook Sharing:** Integrated `FacebookShareButton` from `react-share` (^6.1.0) with custom circular brand styling and official Facebook glyph. Opens standard Facebook share popup with resolved event URL.
    2. **Twitter (X) Sharing:** Integrated `XShareButton` (aliased as `TwitterShareButton`) from `react-share` with tweet text pre-populated (`Check out [Event Name] on Skiddle!`) and resolved event link.
    3. **Search Button Routing:** Configured the search action button (`id: 'search'`, "More events") to cleanly route back to the homepage (`/`) so users can browse and find another event from Skiddle's production catalogue.
    4. **Animated Email Zoom-in Modal:** Built `PromoEmailModal` featuring tactile GSAP spring zoom-in (`scale: 0.72` → `1.0`, `ease: back.out(1.5)`), backdrop blur dismiss, and top Skiddle logo header (`SkiddleLogoMC`).
    5. **Prospect Light Email Template Integration:** Replicated the exact light-mode email template used for Prospects in `private`, powered by `@goldlabelapps/notify`. Implemented `/api/promo/email` route that requires a valid email, accepts an optional message/body, and dispatches via `sendTemplatedEmail` to `https://private.goldlabel.pro/api/notify/email`.
- **Verification & Testing:**
  - Authored unit and integration test suite `apps/web/tests/unit/promo-email.test.tsx` verifying:
    - Search button routing and stopPropagation behavior.
    - `PromoEmailModal` structure, required recipient email field, optional message input, Skiddle logo header, and submit button labeled "Send".
    - `/api/promo/email` HTTP 400 validation on invalid email.
    - Template generation with `buildDefaultLightEmailHtml` and dispatch via `sendTemplatedEmail`.
    - Fallback invitation message when body is omitted.
  - All 87 web tests passing (157 total monorepo tests: 87 web + 38 sdk + 23 cli + 9 PHP).
  - Next.js production build (`pnpm --filter web build`) passing clean with `/api/promo/email` route registered.
