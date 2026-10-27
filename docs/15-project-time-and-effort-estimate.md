# Project Time Investment & Engineering Effort Audit

> **Target Audience:** Engineering Leadership & Technical Interview Panel (Adam Chandler, Chris Seaton, Neil Meredith) at Skiddle.  
> **Objective:** Provide a transparent, data-driven estimate of the engineering hours invested in modernizing the Skiddle SDK, building the NX° CLI, developing the Next.js 15 web application, and authoring the automated test and documentation suite.  
> **Living Document Rule:** *Whenever repository documentation is updated, this document must be re-evaluated and synchronized with the latest git history, commit metrics, and test results.*

---

## 📊 1. Executive Summary & Metric Scorecard

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Active Engineering Time** | **~25.2 Hours** | Direct coding, refactoring, benchmark profiling, and test authoring |
| **Total Project Investment** | **~29.0 Hours** | Includes architectural design, telemetry research, and comprehensive docs |
| **Equivalent Developer Days** | **~3.62 Days** | Standard 8-hour senior engineering days |
| **Modernization Commits** | **68 Commits** | Authored by DriveByAbuser across 5 active dates |
| **Total Monorepo Tests** | **174 Tests (100% Pass)** | 165 Vitest (SDK, CLI, Web) + 9 PHPUnit |
| **Architectural Documents** | **16 Guides + Transcript** | Comprehensive technical documentation in `/docs` |
| **Code Additions** | **+25,850 Lines** | Polyglot monorepo across TS, React, Node, and PHP |
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
   - 138 automated tests authored across 4 distinct test runners/configurations (`@skiddle/sdk`, `@skiddle/cli`, `apps/web`, and `php/tests`).
4. **Architectural Documentation Footprint:**
   - 16 standalone technical architecture decision records totaling over 2,800 lines of markdown plus an extensive chronological migration transcript.

---

## 📅 3. Session-by-Session Git History Breakdown

```
2026-10-15  [==========]  Session 1-3: Legacy Isolation, TypeScript SDK, CLI (4.0h)
2026-10-16  [=========]   Session 4: Turborepo, Next.js 15, Single Event Schema (3.6h)
2026-10-25  [==============] Session 5-8: Event Search, Flash Creative Studio, Docs (7.6h)
2026-10-26  [===========]  Session 9-21: GpxRoute 3D, PromoFlash, Actions, Performance & Docs (5.2h)
2026-10-27  [=======]      Session 22-32: PromoFlash, Clamps, Actions, Buy Tickets CTA, Attention Loop, Date Chip & Elevation (2.9h)
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

### Day 4 — Monday, October 26, 2026 (~4.5 Hours)
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
- **Session 11 (13:54 – 14:10 BST):**
  - Cross-repository parallel development setup linking `@goldlabelapps/flash` via `link:` protocol and Next.js `transpilePackages`.
  - Authored `corkscrewActionScript`, `corkScrew`, and `asMovieClip` in `@goldlabelapps/flash` (GSAP timeline modeling a screw threading in/out with 720° rotation, scale and opacity easing).
  - Integrated `asMovieClip(logoRef.current).corkScrew("in" | "out")` directly into Skiddle `PromoFlash`.
  - *Estimated Effort:* **0.6h**
- **Session 12 (14:10 – 14:15 BST):**
  - Dynamic SEO, OpenGraph and Twitter card metadata for `/promo/[id]` with React `cache` request deduplication.
  - Formatted title to event title, description to clean plain text, and OpenGraph/Twitter card image to `largeimageurl`.
  - *Estimated Effort:* **0.2h**
- **Session 13 (14:15 – 14:25 BST):**
  - Authored responsive multi-line `TitleText` MovieClip component and `fadeIn`/`fadeOut` methods in `@goldlabelapps/flash`.
  - Implemented GSAP animation sequence in `PromoFlash`: Skiddle logo corkscrews in, pauses 1s, fades out, and smoothly fades into the event title.
  - Added dynamic typography scaling (`autoSize`) handling long multi-line titles without overflow.
  - Web unit tests expanded to 63 tests (131 total monorepo tests).
  - *Estimated Effort:* **0.4h**
- **Session 14 (14:25 – 14:35 BST):**
  - Integrated `CleverText` typewriter animation into `PromoFlash` for streaming event title typography.
  - Added `active?: boolean` control to `CleverText` in `@goldlabelapps/flash`.
  - Configured React singleton deduplication in `vitest.config.ts` (`resolve.dedupe: ['react', 'react-dom']`) preventing duplicate React instance conflicts across cross-repo links in Node SSR environments.
  - Verified 100% green test passes and production build.
  - *Estimated Effort:* **0.3h**
- **Session 15 (14:35 – 14:40 BST):**
  - Confirmed OpenGraph & Twitter preview card uses high-resolution `largeimageurl`.
  - Authored `ImageMC` component in `@goldlabelapps/flash` consuming standard `imageurl`.
  - Integrated `ImageMC` into `PromoFlash` with `imageRef` ready for the upcoming scene sequence.
  - Test suite expanded to 64 tests (132 total monorepo tests).
  - *Estimated Effort:* **0.2h**
- **Session 16 (14:40 – 14:45 BST):**
  - Added dual image asset display (`imageurl` standard thumbnail & `largeimageurl` large flyer) to the "API Data" view on `/events/[id]`.
  - Added responsive image preview cards with key badges, external open links, and full URLs.
  - Added unit test asserting both images render on API data view. Monorepo tests expanded to 133 tests.
  - *Estimated Effort:* **0.1h**
- **Session 17 (14:45 – 14:50 BST):**
  - Removed unused duplicate `React Developer Job Spec - Sep 26.pdf` from root `docs/` folder.
  - Moved candidate CV (`Chris Dorward - CV.pdf`) into `apps/web/public/docs/`.
  - Added "CV" link to the Candidate navigation menu in `Footer.tsx` (`/docs/Chris%20Dorward%20-%20CV.pdf`).
  - Updated `footer.test.tsx` verifying CV link rendering and attributes.
  - *Estimated Effort:* **0.1h**
- **Session 18 (14:50 – 14:55 BST):**
  - Reorganized the Event Detail structured "API Data" tab on `/events/[id]`.
  - Relocated the image section from the top of the tab to the bottom (below Description and Data Grid).
  - Streamlined the image card to exclusively feature the high-resolution flyer image (`largeimageurl`), removing the redundant thumbnail image.
  - Enhanced preview frame height to 380px for improved flyer legibility and updated unit tests.
  - *Estimated Effort:* **0.1h**
- **Session 19 (14:55 – 15:05 BST):**
  - Updated `PromoFlash` to prioritize high-resolution `largeimageurl` / `largeimage` for `ImageMC`.
  - Authored `separatePromoActionScript` coordinating synchronized counter-motion:
    - Moves `CleverText` headline up (`y: -130`, `ease: 'power3.inOut'`).
    - Unfolds `ImageMC` down (`y: 110`, scale `0.88` to `1.0`, fade `0` to `1.0`, `ease: 'power3.out'`).
    - Perfectly separates elements on the stage with balanced breathing space.
  - Expanded unit test suite to 67 unit tests in `apps/web` (135 total across monorepo).
  - *Estimated Effort:* **0.3h**
- **Session 20 (15:05 – 15:25 BST):**
  - Designed and authored modular Action Buttons MovieClip (`PromoActionsMC`) and animation sequence timeline (`promoActionsActionScript`) positioned at the bottom of the Promo page.
  - Implemented 1-by-1 sequential entrance animation:
    - Slides in from bottom along horizontal center axis, popping up just slightly above its resting row position (`scale: 1.35`, `z-index: 1000`).
    - Reading description pill (`z-index: 10001`) fades in directly above the popped-up icon, holds, and cleanly fades out.
    - Button shrinks down (`scale: 1.0`) into its slot in the auto-spaced bottom row.
    - Cycles smoothly through all configured action buttons (Facebook, Twitter/X, Email, Search/More Events).
  - Added unit tests in `apps/web/tests/unit/promo-flash.test.tsx` verifying `PromoActionsMC` buttons, custom actions, and `promoActionsActionScript` timeline. Web unit tests expanded to 70 tests.
  - *Estimated Effort:* **0.4h**
- **Session 21 (15:25 – 15:35 BST):**
  - Standardized large artwork and flyer display to 1:1 square:
    - Updated `ImageMC` default `aspectRatio` from `4/3` to `1/1` in `@goldlabelapps/flash`.
    - Rebuilt `@goldlabelapps/flash` package distributions.
    - Updated `PromoFlash.tsx` with explicit `aspectRatio="1/1"` property.
    - Refactored `EventDetail.module.css` (`.imagePreview` and `.noImagePlaceholder`) to `aspect-ratio: 1 / 1; max-width: 440px`.
  - Added unit test asserting `aspect-ratio:1/1`. Monorepo test suite stands at 138 total automated tests (100% pass).
  - *Estimated Effort:* **0.2h**

### Day 5 — Tuesday, October 27, 2026 (~2.9 Hours)
- **Session 22 (11:10 – 11:20 BST):**
  - Integrated event description presentation underneath the featured image in `PromoFlash`.
  - Implemented `cleanDescription` utility function for HTML tag stripping, entity decoding (`&amp;`, `&#39;`, `&pound;`, `&quot;`), and whitespace normalization.
  - Enhanced `separatePromoActionScript` with 3-tier choreography: `CleverText` headline moves up (`y: -150`), `ImageMC` flyer unfurls in center (`y: -10`, compact 220px width), and event description fades in underneath (`y: 155`).
  - Added responsive clamping (`WebkitLineClamp: 3`) and dynamic typography scaling (reducing font size from `0.8125rem` to `0.75rem` for descriptions $>180$ characters).
  - Authored 6 unit tests in `apps/web/tests/unit/promo-flash.test.tsx` verifying HTML stripping, typography scaling, prop overrides, omission when empty, and timeline initialization. Total monorepo tests expand to 146.
  - *Estimated Effort:* **0.4h**
- **Session 23 (11:25 – 11:40 BST):**
  - Connected action buttons in `PromoActionsMC` to live production integrations:
    - Installed `react-share` (^6.1.0) and integrated `FacebookShareButton` and `XShareButton` (aliased as `TwitterShareButton`) with custom circular branding.
    - Linked `id: 'search'` button to route back to homepage (`/`) for browsing events.
    - Created `PromoEmailModal` featuring tactile GSAP spring zoom-in (`scale: 0.72` → `1.0`, `ease: back.out(1.5)`), backdrop blur dismiss, and top Skiddle logo header (`SkiddleLogoMC`).
    - Integrated `@goldlabelapps/notify` and built `/api/promo/email` route replicating the exact Prospect light email template from `private` (`buildDefaultLightEmailHtml`), validating required email with optional body/message and dispatching via `sendTemplatedEmail` to `https://private.goldlabel.pro/api/notify/email`.
  - Authored comprehensive test suite in `apps/web/tests/unit/promo-email.test.tsx`. Total automated tests expanded to 157.
  - *Estimated Effort:* **0.5h**
- **Session 24 (12:00 – 12:05 BST):**
  - Implemented strict 3-line clamp on promo page event title in `PromoFlash.tsx` and `PromoFlash.module.css`.
  - Added extended typography scale down to `1rem` for $>90$ characters and lifted `textY` separation to `-158` for multi-line titles with descriptions.
  - Authored unit tests asserting `-webkit-line-clamp: 3` and 1rem scaling in `apps/web/tests/unit/promo-flash.test.tsx`. Total monorepo tests expand to 158.
  - *Estimated Effort:* **0.3h**
- **Session 25 (12:15 – 12:20 BST):**
  - Streamlined direct event-to-promo navigation: eliminated the intermediate event detail step (`/events/[id]`), navigating directly from search results to `/promo/[id]`.
  - Added automatic HTTP redirect in `next.config.mjs` forwarding `/events/:id` to `/promo/:id`.
  - *Estimated Effort:* **0.2h**
- **Session 26 (12:22 – 12:28 BST):**
  - Swapped search icon with official Skiddle vector mark (`SkiddleIcon`, viewBox `0 0 500 500`) in `PromoActionsMC` while preserving "More events" label.
  - Rectified button shape defect where `react-share` injected `border-radius: 0` into Facebook & Twitter share buttons; configured `resetButtonStyle={false}`, inline `borderRadius: '50%'`, and CSS module `border-radius: 50% !important`.
  - Updated unit tests in `apps/web/tests/unit/promo-flash.test.tsx`.
  - *Estimated Effort:* **0.2h**
- **Session 27 (12:30 – 12:45 BST):**
  - Integrated venue location and clean date presentation on the promotional Flash experience (`/promo/[id]`).
  - Iterated away from unnecessary visual clatter (split-flap arrivals board) in favor of crisp, legible date and venue badges.
  - Implemented `formatPromoDate` formatting native dates, ISO timestamps, and British calendar strings.
  - Built `PromoVenueDateMC` MovieClip combining the dark slate date & doors pill (`📅 Thu 15 Apr 2027 • Doors 19:30`) with the venue location badge (`📍 The Stoller Hall • Manchester`).
  - Integrated into `PromoFlash` choreography and updated `separatePromoActionScript`.
  - Authored 9 unit tests in `apps/web/tests/unit/promo-venue-date.test.tsx`. Total web unit tests stand at 94 (164 across monorepo at 100% pass).
  - *Estimated Effort:* **0.4h**
- **Session 28 (12:35 – 12:40 BST):**
  - Integrated high-impact "Buy Tickets" Call-To-Action MovieClip (`PromoCtaMC`) with direct Skiddle purchasing URL (`target="_blank"`).
  - Authored entrance spring animation and looping heartbeat attention loop (pulsing ring aura and light shimmer streak).
  - Added unit test suite in `apps/web/tests/unit/promo-flash.test.tsx` (5 new tests, 102 web tests across 13 test suites). Total monorepo tests expand to 172.
  - *Estimated Effort:* **0.4h**
- **Session 29 (12:44 – 12:46 BST):**
  - Refined vertical positioning of `PromoCtaMC` by moving the "Buy Tickets" CTA button up to `bottom: 104px` (from `88px`), establishing a consistent 28px vertical rhythm above the lower action button row.
  - Verified 100% green tests and production build.
  - *Estimated Effort:* **0.1h**
- **Session 30 (12:46 – 12:49 BST):**
  - Refactored `PromoVenueDateMC` into distinct `PromoDateChipMC` and `PromoVenueMC` MovieClips.
  - Moved the Date chip to the top above the title container (`dateY`: `-235px`).
  - Shifted all stage elements up vertically (`textY`: `-170px`, `imageY`: `-40px`, `venueY`: `+68px`, `descriptionY`: `+145px`) with expanded breathing room.
  - Authored unit test coverage verifying visual hierarchy in DOM. Monorepo tests expand to 174 (100% pass).
  - *Estimated Effort:* **0.2h**
- **Session 31 (12:50 – 12:52 BST):**
  - Further raised the "Buy Tickets" CTA MovieClip to `bottom: 120px` (from `104px`), opening a 44px channel above the action row and centering the CTA comfortably in the lower third.
  - *Estimated Effort:* **0.1h**
- **Session 32 (12:55 – 12:56 BST):**
  - Elevated the "Buy Tickets" CTA to `bottom: 140px` (from `120px`), establishing a balanced midpoint between the bottom action button row (~64px margin below) and the event description (~60px margin above).
  - *Estimated Effort:* **0.1h**

---

## 🏛 4. Effort Distribution by Technical Pillar

```
Next.js 15 Web Application & Flash Studio : 11.8h (47%) ████████████████
Architecture, ADRs & Transcripts (16 docs):  5.0h (20%) ████████
Automated Testing & CI (174 tests)        :  4.4h (17%) ██████
Core TypeScript SDK (@skiddle/sdk)        :  2.0h (8%)  ███
NX° Developer CLI (@skiddle/cli)          :  2.0h (8%)  ███
```

| Pillar | Components / Files | Est. Hours | % of Total |
| :--- | :--- | :--- | :--- |
| **Next.js 15 Web App** | `EventSearch`, `EventDetailClient`, `PromoFlash`, `PromoActionsMC`, `PromoCtaMC`, `PromoVenueDateMC`, `PromoEmailModal`, `/api/promo/email`, routes | **11.8h** | 47% |
| **Architecture & Docs** | 16 architectural ADRs, interview guide, migration transcript, performance audit | **5.0h** | 20% |
| **Automated Testing & CI** | 165 Vitest tests, 9 PHPUnit tests, Turborepo pipeline, GitHub Actions | **4.4h** | 17% |
| **Core TypeScript SDK** | Zero-dependency client, API v1/v3 routing, fluent builder, eFlyer ViewModel | **2.0h** | 8% |
| **NX° Developer CLI** | Native terminal UI, `doctor`, `events`, `benchmark`, `scenarios` | **2.0h** | 8% |
| **Total** | | **25.2h** | **100%** |

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
