---
name: skiddle-mock-tester
description: >-
  Write and execute unit and integration tests for the Skiddle SDK or CLI using Vitest mocks,
  ensuring 100% network isolation and deterministic test runs.
---

# Skiddle Mock Testing Guide

Use this skill when adding tests, reproducing bugs, or verifying features without making real HTTP network requests to Skiddle servers.

---

## Vitest Mocking Patterns for `fetch`

Because the Skiddle SDK relies on native `fetch` with zero external dependencies, mock `globalThis.fetch` using Vitest's `vi.spyOn`:

### 1. Mocking a Successful Response

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Events, SkiddleSession } from '../src/index.js';

describe('Events Mocked Test', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries events with proper parameters and returns results', async () => {
    const mockResponsePayload = {
      error: 0,
      totalresults: 1,
      results: [
        {
          id: '12345',
          eventname: 'Creamfields 2026',
          venue: { name: 'Daresbury Estate', town: 'Warrington' },
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponsePayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const session = new SkiddleSession({ apiKey: 'mock_key' });
    const events = new Events();
    events.setSession(session);
    events.addCond('keyword', 'Creamfields');

    const res = await events.getListings();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('api_key')).toBe('mock_key');
    expect(calledUrl.searchParams.get('keyword')).toBe('Creamfields');
    expect(res.results[0].eventname).toBe('Creamfields 2026');
  });
});
```

### 2. Mocking an API Error (e.g. Invalid API Key)

```typescript
it('throws SkiddleException when API returns an error structure', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: 1,
        description: 'Invalid API key provided',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  );

  const session = new SkiddleSession({ apiKey: 'invalid_key' });
  const events = new Events();
  events.setSession(session);

  await expect(events.getListings()).rejects.toThrowError('Invalid API key provided');
});
```

---

## ⚡ Verification Checklist

Run targeted test verification:
```bash
pnpm --filter skiddle-sdk test tests/sdk.test.ts
```
