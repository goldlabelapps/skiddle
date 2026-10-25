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


