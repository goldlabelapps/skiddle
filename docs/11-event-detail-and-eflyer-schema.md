# 11 — Event Detail Schema & eFlyer Promotion Type Specification

> **Document Version:** 1.0.0  
> **Topic:** Comprehensive TypeScript typing, data contract, and ViewModel architecture for Skiddle Single Event Details (`/api/v1/events/{id}/`) and automated eFlyer promotional campaigns.

---

## 🎯 Executive Overview & Strategic Context

In event discovery and live entertainment marketing, **eFlyer promotions** (email marketing blasts, social previews, digital posters, and marketing embeds) require a rich, deterministic data shape. 

While the Skiddle API v3 `/events/instant-search/` endpoint delivers high-throughput search listings optimized for search grids, detailed promotional materials require granular metadata provided by the single event endpoint (`/api/v1/events/{id}/`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Skiddle API Ecosystem                           │
│                                                                        │
│   GET /api/v1/events/{id}/             GET /v3/events/instant-search/  │
│   (Granular Event Details)              (High-Throughput Search Lists)  │
└───────────────────┬───────────────────────────────────┬────────────────┘
                    │                                   │
                    ▼                                   ▼
        ┌───────────────────────┐           ┌───────────────────────┐
        │   SkiddleEventDetail  │           │      SkiddleEvent     │
        │ - Hex header color    │           │ - Search snippets     │
        │ - Door / Entry times  │           │ - Pagination offsets  │
        │ - Full venue & phone  │           │ - Multi-facet filters │
        │ - Cancellation reason │           └───────────────────────┘
        └───────────┬───────────┘
                    │ toEFlyerPromotionData()
                    ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                     EFlyerPromotionData                       │
        │  Normalized ViewModel for React, MJML, & Email HTML Flyers   │
        └───────────────────────────────────────────────────────────────┘
```

This specification establishes:
1. **Strict TypeScript Interfaces** matching Skiddle API v1 single event responses.
2. **End-to-End Execution Envelope Typing** compatible with Next.js Server Actions and developer tooling.
3. **`EFlyerPromotionData` Normalized ViewModel** stripping API idiosyncrasies for frontend consumers.
4. **`toEFlyerPromotionData()` Transformation Utility** providing zero-overhead, deterministic mapping.

---

## 📐 TypeScript Interfaces & Entity Definitions

The types are defined in [`packages/sdk/src/types.ts`](file:///Users/milky/My%20Drive/GitHub/skiddle/packages/sdk/src/types.ts) and exported from the root `@skiddle/sdk` package.

### 1. `SkiddleEventDetail` (Core Single Event Entity)

Represents the complete payload returned within `data.results`:

```typescript
/**
 * Detailed venue structure returned by the single event endpoint (/api/v1/events/{id}/).
 */
export interface SkiddleEventDetailVenue {
  id: string;
  name: string;
  address: string;
  town: string;
  postcode: string;
  countrycode: string;
  cityname: string;
  phone: string;
  latitude: string;
  longitude: string;
  link: string;
  [key: string]: unknown;
}

/**
 * Opening times structure for an event.
 */
export interface SkiddleEventOpeningTimes {
  doorsopen: string;
  doorsclose: string;
  lastentry: string;
  [key: string]: unknown;
}

/**
 * Genre entry for single event details.
 */
export interface SkiddleEventGenreDetail {
  genreid: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Rep / brand ambassador settings on an event.
 */
export interface SkiddleEventRep {
  enabled: boolean;
  [key: string]: unknown;
}

/**
 * Artist structure inside single event details.
 */
export interface SkiddleEventArtistDetail {
  artistid?: string;
  name?: string;
  imageurl?: string;
  [key: string]: unknown;
}

/**
 * Complete single event detail shape as returned by Skiddle API v1 (/api/v1/events/{id}/)
 * and utilized for generating eFlyer promotional materials.
 */
export interface SkiddleEventDetail {
  id: string;
  listingid: string;
  eventname: string;
  cancelled: '0' | '1' | string;
  cancellationDate?: string;
  cancellationType?: string;
  cancellationReason?: string;
  rescheduledDate?: string;
  venue: SkiddleEventDetailVenue;
  imageurl: string;
  largeimageurl: string;
  headerhex: string;
  link: string;
  date: string;
  dateStart: string;
  dateEnd: string;
  startdate: string;
  enddate: string;
  description: string;
  openingtimes: SkiddleEventOpeningTimes;
  genres: SkiddleEventGenreDetail[];
  entryprice: string;
  MinAge: string | number;
  going?: unknown[];
  imgoing?: number;
  goingtos?: number;
  artists?: Array<SkiddleEventArtistDetail | unknown>;
  ticketStatus?: string;
  tickets: boolean;
  paymentPlanTCs?: string | null;
  eventVisibility?: 'public' | 'private' | string;
  ticketUrl?: string;
  groupingid?: string;
  rep?: SkiddleEventRep;
  seatingPlanID?: string;
  healthAndSafety?: unknown[];
  [key: string]: unknown;
}
```

---

### 2. API Response & Execution Envelopes

Encapsulates the standard Skiddle REST wrapper and Next.js / Server Action execution metadata:

```typescript
/**
 * Standard envelope for the single event API response.
 */
export interface SkiddleSingleEventApiResponse<T = SkiddleEventDetail> {
  error: number | string;
  totalcount: number;
  pagecount: number;
  results: T;
  requestId: string;
  [key: string]: unknown;
}

/**
 * Full execution result envelope for single event queries, including latency & debug traces.
 */
export interface SkiddleSingleEventExecutionResult<T = SkiddleEventDetail> {
  success: boolean;
  data: SkiddleSingleEventApiResponse<T>;
  conditionsSent: Record<string, string | number | boolean>;
  debugInfo?: DebugEntry[];
  executionTimeMs: number;
  resource: 'event-single' | string;
}
```

---

### 3. `EFlyerPromotionData` (Normalized ViewModel)

While the raw Skiddle API uses legacy naming conventions (`headerhex`, `MinAge`, `doorsopen`), modern component trees and email generators require clean camelCase properties, boolean cancellation flags, and flattened genre lists:

```typescript
/**
 * Normalized ViewModel specifically structured for generating eFlyer promotional materials.
 */
export interface EFlyerPromotionData {
  eventId: string;
  listingId: string;
  eventName: string;
  description: string;
  heroImageUrl: string;
  thumbnailImageUrl: string;
  accentColor: string;
  skiddleUrl: string;
  eventDate: string;
  doorsOpen: string;
  doorsClose: string;
  lastEntry?: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venuePostcode: string;
  venuePhone?: string;
  venueLink?: string;
  entryPrice: string;
  minAge?: string;
  ticketsAvailable: boolean;
  ticketUrl?: string;
  genres: string[];
  isCancelled: boolean;
  cancellationReason?: string;
}
```

---

## 🔄 Automated Normalizer: `toEFlyerPromotionData`

The SDK provides an out-of-the-box helper [`toEFlyerPromotionData`](file:///Users/milky/My%20Drive/GitHub/skiddle/packages/sdk/src/eflyer.ts) in `@skiddle/sdk`:

```typescript
import { createClient, toEFlyerPromotionData } from '@skiddle/sdk';

const client = createClient({ apiKey: process.env.SKIDDLE_API_KEY });
const response = await client.events.getListing('42616476');

// Convert directly to eFlyer promotion ViewModel
const eFlyer = toEFlyerPromotionData(response.results);
```

### Key Normalization Highlights:
- **Hero Image Fallback:** Gracefully falls back from `largeimageurl` to `imageurl` if high-resolution artwork is absent.
- **Brand Accent Hex:** Uses `headerhex` directly, defaulting to `#080808` dark styling if missing.
- **Cancellation Boolean:** Evaluates `cancelled === '1'` and presence of cancellation reasons into a single boolean `isCancelled`.
- **Genre Array Flattening:** Flattens `Array<{ genreid: string; name: string }>` into an ergonomic `string[]` (`['Classical', 'Orchestral']`).
- **Venue Address Sanitization:** Normalizes city/town fallbacks (`venue.town || venue.cityname`).

---

## 💻 Practical Usage in Next.js & React

### 1. Server Action Fetch

```typescript
// app/actions/eflyer.ts
'use server';

import { createClient, toEFlyerPromotionData, type EFlyerPromotionData } from '@skiddle/sdk';

export async function fetchEventForEFlyer(eventId: string): Promise<EFlyerPromotionData> {
  const client = createClient({ apiKey: process.env.SKIDDLE_API_KEY });
  const response = await client.events.getListing(eventId);
  
  return toEFlyerPromotionData(response.results);
}
```

### 2. Promotional eFlyer Card Component

```tsx
// components/EFlyerCard.tsx
import React from 'react';
import type { EFlyerPromotionData } from '@skiddle/sdk';

export function EFlyerCard({ flyer }: { flyer: EFlyerPromotionData }) {
  return (
    <article 
      style={{ borderColor: flyer.accentColor }} 
      className="max-w-md overflow-hidden rounded-2xl border-2 bg-neutral-900 text-white shadow-2xl"
    >
      <div className="relative h-64 w-full">
        <img 
          src={flyer.heroImageUrl} 
          alt={flyer.eventName} 
          className="h-full w-full object-cover"
        />
        {flyer.isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 font-bold text-red-500 uppercase tracking-widest text-xl">
            Cancelled
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {flyer.genres.map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white font-medium">
              {g}
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">{flyer.eventName}</h2>
        <p className="text-sm text-neutral-400 line-clamp-3 mb-4">{flyer.description}</p>

        <div className="space-y-1 text-xs text-neutral-300 border-t border-white/10 pt-4 mb-6">
          <p><strong>Venue:</strong> {flyer.venueName}, {flyer.venueCity} ({flyer.venuePostcode})</p>
          <p><strong>Date:</strong> {flyer.eventDate} (Doors: {flyer.doorsOpen} - {flyer.doorsClose})</p>
          <p><strong>Price:</strong> £{flyer.entryPrice}</p>
        </div>

        <a
          href={flyer.skiddleUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: flyer.accentColor }}
          className="block w-full py-3 text-center font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          {flyer.ticketsAvailable ? 'Book Tickets on Skiddle' : 'View on Skiddle'}
        </a>
      </div>
    </article>
  );
}
```

---

## 🧪 Verification & Automated Tests

Automated testing for this contract is implemented in [`packages/sdk/tests/sdk.test.ts`](file:///Users/milky/My%20Drive/GitHub/skiddle/packages/sdk/tests/sdk.test.ts):
- Single event payload parsing and field mapping verification.
- Cancelled event handling and cancellation reason extraction.
- End-to-end `SkiddleSingleEventExecutionResult` structure validation.

Run the targeted test:
```bash
pnpm --filter @skiddle/sdk test
```
Run monorepo typecheck:
```bash
pnpm typecheck
```
