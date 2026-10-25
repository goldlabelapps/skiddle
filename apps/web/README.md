# Skiddle Web App (`apps/web`)

> **Event Discovery & Promotion Centre Application**  
> Built with Next.js 15, React 19, and Turborepo. Consumes the zero-dependency workspace library [`@skiddle/sdk`](../../packages/sdk) directly via workspace linking (`workspace:*`).

---

## 🚀 Key Features & Pages

- **Live Event Search & Multi-Facet Filtering (`/`)**:
  - Real-time search by title, artist, venue, or keyword.
  - Multi-facet filtering by Category / Event Code (`LIVE`, `CLUB`, `FEST`, `COMEDY`, `THEATRE`, `SPORT`, etc.) and Event Date.
  - Regex-safe match highlighting with `<HighlightText />`.
  - Immediate responsive UI feedback using React 19 transitions (`useTransition`).
- **Single Event Promotion Builder (`/events/[id]`)**:
  - High-performance server-rendered event detail view with dynamic OpenGraph metadata via `generateMetadata`.
  - Structured view highlighting event date, doors, tickets, pricing, venue details, and lineup.
  - Raw JSON inspection tab and one-click JSON clipboard export.
  - Dedicated direct route alias: `/events/[id]/edit`.
- **SDK Explorer & Interactive API Tester (`/sdk`)**:
  - Developer workbench for testing all `@skiddle/sdk` resources (`events`, `event-single`, `venues`, `artists`).
  - Interactive condition builder mirroring SDK `addCond`, `delCond`, and `clearConditions`.
  - Telemetry inspector displaying sanitized debug traces and request durations.
- **Next.js 15 Server Route Handlers**:
  - `/api/events`: Proxies searches to Skiddle API v3 with parameter clamping, sanitization, and structured error propagation.
  - `/api/events/[id]`: Fetches individual event details from Skiddle API v1 with latency telemetry.
- **PWA Ready**:
  - Configured with `@ducanh2912/next-pwa`, `manifest.webmanifest`, and theme-aware viewport metadata.

---

## 🛠 Development & Testing

```bash
# Start development server (Next.js 15 + Fast Refresh)
pnpm --filter web dev

# Run TypeScript compilation checks
pnpm --filter web typecheck

# Run architectural & asset linter
pnpm --filter web lint

# Run all automated tests (Vitest)
pnpm --filter web test

# Run isolated unit tests
pnpm --filter web test:unit

# Run End-to-End contract tests
pnpm --filter web test:e2e

# Production build
pnpm --filter web build
```

---

## 🏛 Workspace Architecture

```
apps/web/
├── public/                 # Favicons, PWA icons, Skiddle SVG logos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── events/     # Next.js 15 Route Handlers (/api/events, /api/events/[id])
│   │   ├── events/[id]/    # Server component & EventDetailClient
│   │   ├── sdk/            # SDK Explorer & API Tester page
│   │   ├── actions.ts      # Next.js Server Actions for SDK execution
│   │   ├── layout.tsx      # Root layout, Header & Footer
│   │   ├── manifest.ts     # PWA Web App Manifest
│   │   └── page.tsx        # Home page rendering EventSearch
│   └── components/
│       ├── ApiTester/      # Multi-view interactive API tester
│       ├── EventSearch/    # Real-time search, filters, cards & HighlightText
│       ├── Footer.tsx      # Global footer with developer resources
│       └── Header.tsx      # Global header with navigation
└── tests/
    ├── e2e/                # Manifest & Server Action E2E tests
    └── unit/               # Route handlers, EventSearch, EventDetailPage & Footer tests
```
