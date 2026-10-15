# Step 4: Testing & Verification

## Objective
Provide automated regression and contract testing for all SDK classes without relying on live external networks during CI runs.

## Test Strategy

We implemented targeted unit tests using **Vitest** in `tests/sdk.test.ts`.

### Test Coverage Areas
1. **Authentication & Session**:
   - Initializing with explicit keys.
   - Falling back to `process.env.SKIDDLE_API_KEY`.
   - Throwing `SkiddleException` on missing credentials.
   - Toggling developer/debug mode.

2. **Request Layer & Transport**:
   - Query key transformation (`api_key` → `apiKey` in v3).
   - Base URL switching between `api.skiddle.com/v3` and `www.skiddle.com/api/v1`.
   - Decoding error payloads from both API v1 (`errormessage`) and API v3 (`detail`).
   - Masking API keys in debug logging (`xxxxxxxxxxxxxxxxxx`).

3. **Condition Management**:
   - Fluent method chaining (`addCond`).
   - Array serialization (`['house', 'techno']` → `'house,techno'`).
   - Safe condition deletion and throwing on invalid deletion.
   - Automatic uppercase transformation of `eventCode`.

4. **Entity Clients & Factory**:
   - Mocking single event fetch (`getListing`).
   - Verifying `createClient()` factory ergonomics.

## Test Execution Results

```bash
$ pnpm test

 ✓ tests/sdk.test.ts (14)
   ✓ SkiddleSession (4)
     ✓ initializes successfully with an explicit apiKey
     ✓ falls back to SKIDDLE_API_KEY environment variable when no key is passed
     ✓ throws a SkiddleException when no API key is provided
     ✓ allows toggling devMode
   ✓ SkiddleRequest (5)
     ✓ correctly renames keys for API v3 in transformRequestKeys
     ✓ constructs v3 endpoint and headers when apiVersion is 3
     ✓ parses API v1 error format properly
     ✓ parses API v3 error format properly
     ✓ masks API key in debug logs when devMode is true
   ✓ SkiddleBase & Conditions (3)
     ✓ manages query conditions fluently
     ✓ throws an exception when trying to delete a non-existent condition
     ✓ uppercases eventCode quirk automatically
   ✓ Entities: Events, Artists, Venues (2)
     ✓ fetches single event by id via getListing
     ✓ works seamlessly with createClient helper

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Duration  358ms
```
