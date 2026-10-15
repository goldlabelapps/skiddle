# Step 6: Interview Discussion Guide & Architectural Rationale

This guide is tailored specifically for your technical conversation with **Adam Chandler** (Front-End Developer) and **Chris Seaton** (Back-End Development Team Leader) at Skiddle.

---

## 1. How to Introduce This Project (Agenda Item 3)

> *"To prepare for our conversation today, I took the original Skiddle PHP SDK and ported it into a modern, production-grade TypeScript package with a developer CLI called NX° Developer Experience. I documented every step of the migration in the `/docs` folder as a technical transcript."*

### Key Highlights to Emphasize:
- **Zero-runtime bloat**: Built with native `fetch` (Node 18+/24+), keeping the package footprint under 11 KB without unnecessary dependencies like Axios.
- **Contract Fidelity with Backend**: Addressed API v1 vs. v3 routing, query key transformation (`api_key` → `apiKey`), case-sensitivity quirks (`eventCode` uppercase), and normalized problem-details error decoding.
- **Dual module output (ESM & CJS)**: Ready to be consumed by modern Next.js/Vite apps as well as serverless Node runtimes.
- **Automated Testing**: 100% passing Vitest test suite testing critical edge cases and failure modes.

---

## 2. Targeted Talking Points by Interviewer

### For Chris Seaton (Back-End Team Leader)
- **API Versioning & Schema Drift**: Explain how you separated API v1 (`/events/`) and API v3 (`/events/instant-search/`), ensuring runtime errors are captured and normalized regardless of whether the backend returns `errormessage` or RFC-compliant `detail`.
- **Handling Race Conditions in Ticketing**: Mention how in high-demand ticket sales (e.g. Creamfields flash sales), client-side reservation timers must synchronize with server-side inventory locks and idempotency keys to avoid double-bookings.
- **Diagnostics & Benchmarking**: Show him the `nx benchmark` command in the CLI. It measures concurrent requests, average latency, and p50/p95/p99 percentiles, giving backend and frontend developers instant visibility into API performance.

### For Adam Chandler (Front-End Developer)
- **Developer Ergonomics**: Walk through the fluent query builder in `src/base.ts` and the `createClient()` factory function.
- **Type Safety & Intellisense**: Point out that event payloads, venues, and query conditions are strictly typed without `any` shortcuts.
- **Component Architecture & Future UI Integration**: Explain how this SDK can seamlessly power a Next.js 15 App Router application with React Server Components (for fast SEO-indexed event pages) and Client Components (for ticket tier selection and slide-over checkout).

---

## 3. Answering "When Things Went Awry in the Past"

The recruiter specifically advised being ready to discuss a scenario where things went off track and what you learned:

### Recommended Scenario: Flash-Sale Traffic Spike & Inventory Race Condition
- **Situation**: *"At a previous company, we experienced a flash sale where thousands of users hit the checkout flow simultaneously. We noticed carts failing at the final confirmation step because inventory had expired without clear feedback."*
- **Obstacle**: *"The client-side timer was out of sync with the backend redis lock by a few seconds, leading to frustrating 409 Conflict errors for users."*
- **Action I Took**: *"I implemented a real-time reservation heartbeat and an optimistic lock countdown in the front end, accompanied by an idempotency token on the checkout submit button to prevent duplicate charges. When an allocation timed out, instead of crashing the page, I introduced a gentle hold-extension prompt with fallback suggestions."*
- **Learnings**: *"I learned that frontend checkout UX cannot treat the backend as an instantaneous database; optimistic updates must always have graceful rollbacks and clear customer messaging."*
