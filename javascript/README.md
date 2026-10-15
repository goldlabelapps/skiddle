# Skiddle JavaScript & TypeScript SDK

Modern, zero-dependency TypeScript and JavaScript SDK for the official [Skiddle API](https://www.skiddle.com/api/).

---

## 🚀 Features

- **Zero External Dependencies**: Built strictly on native web standards (`fetch`, `URL`, `URLSearchParams`, `AbortController`).
- **Dual ESM & CommonJS**: Supports `import` and `require` seamlessly with generated `.d.ts` declaration maps.
- **Strong Typing**: Full TypeScript interfaces for API v1 and v3 queries and response payloads.
- **Fluent Query Builder**: Parity with the classic fluent condition builder pattern (`addCond()`, `delCond()`, `getConditions()`, `clearConditions()`).
- **Skiddle API v1 & v3 Support**: Automatic parameter transforms for v3 endpoints (`latitude` ⇄ `lat`, `longitude` ⇄ `lon`, `radius` ⇄ `rad`, `eventcode` ⇄ `event_code`).

---

## 📦 Installation

```bash
pnpm add skiddle-sdk
# or npm install skiddle-sdk
```

---

## 🛠 Quickstart

### Initialize Client

```typescript
import { createClient } from 'skiddle-sdk';

// Automatically uses process.env.SKIDDLE_API_KEY if key omitted
const client = createClient({ apiKey: 'YOUR_API_KEY' });
```

### Search Events

```typescript
client.events
  .addCond('keyword', 'Creamfields')
  .addCond('limit', 5)
  .addCond('radius', 20);

const response = await client.events.getListings();
console.log(response.results);
```

### Fetch Event by ID

```typescript
const event = await client.events.getListing('12345678');
console.log(event.results);
```

### Search Artists & Venues

```typescript
// Artists
client.artists.addCond('name', 'Bicep');
const artists = await client.artists.getListings();

// Venues
client.venues.addCond('keyword', 'Warehouse Project');
const venues = await client.venues.getListings();
```

---

## 🧪 Development & Testing

```bash
# Install dependencies
pnpm install

# Run automated Vitest test suite
pnpm test

# Type-check with TypeScript compiler
pnpm typecheck

# Build ESM & CJS distribution bundles
pnpm build
```

---

## 📄 License

MIT © Skiddle Ltd
