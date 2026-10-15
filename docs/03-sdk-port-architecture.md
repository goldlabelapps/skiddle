# Step 3: TypeScript SDK Architecture & Parity

## Objective
Port the object-oriented PHP classes into modern TypeScript modules, preserving API familiarity while adding type safety, asynchronous promises, and robust error handling.

## Component Mapping: PHP vs. TypeScript

| PHP Class (`SkiddleSDK\...`) | TypeScript Module (`src/...`) | Modern Enhancements |
| :--- | :--- | :--- |
| `SkiddleSession.php` | `src/session.ts` | Resolves from explicit config or `SKIDDLE_API_KEY` environment variable. Immutable key storage. |
| `SkiddleException.php` | `src/errors.ts` | Inherits standard `Error`, preserves prototype chain, includes HTTP status code and API payload. |
| `SkiddleRequest.php` | `src/request.ts` | Native `fetch` implementation. Handles URL search params, v1 (`/api/v1`) vs v3 (`api.skiddle.com/v3`) endpoint routing, API key transformation (`api_key` → `apiKey`), and credential sanitization in debug logs. |
| `SkiddleBase.php` | `src/base.ts` | Fluent builder methods (`addCond`, `delCond`, `clearCond`), automatic uppercase transformation for `eventCode` quirk, dependency injection of session. |
| `Events.php` | `src/events.ts` | Strongly typed response interfaces: `getListings()` routes to v3 `/events/instant-search/`, `getListing(id)` routes to `/events/{id}/`. |
| `Artists.php` | `src/artists.ts` | Strongly typed artist listings. |
| `Venues.php` | `src/venues.ts` | Strongly typed venue listings. |

## Handling Skiddle API Quirks

1. **API v3 Query Key Transformation**:
   In API v1, authentication was passed via `api_key`. In API v3, it requires camelCase `apiKey`.
   In `SkiddleRequest.ts`:
   ```ts
   public transformRequestKeys(requestData: Record<string, unknown>) {
     const renameKeys = { api_key: 'apiKey' };
     // automatically transforms keys when apiVersion === 3
   }
   ```

2. **The `eventCode` Uppercase Requirement**:
   Skiddle's backend expects event category codes (such as `LIVE`, `CLUB`, `FEST`) to be uppercase.
   In `SkiddleBase.ts`:
   ```ts
   if (args.eventCode && typeof args.eventCode === 'string') {
     args.eventCode = args.eventCode.toUpperCase();
   }
   ```

3. **Dual Error Schema Normalization**:
   Skiddle API v1 returns errors as `{ error: 1, errormessage: "..." }`.
   Skiddle API v3 returns RFC-style problem details as `{ status: 404, detail: "..." }`.
   `SkiddleRequest.ts` decodes both structures and throws a unified `SkiddleException` with HTTP status and human-readable messages.

## Usage Example

```ts
import { createClient } from 'skiddle-sdk';

const client = createClient({ apiKey: process.env.SKIDDLE_API_KEY });

// Fluent filtering
client.events
  .addCond('keyword', 'Warehouse Project')
  .addCond('limit', 10);

const response = await client.events.getListings();
console.log(response.results);
```
