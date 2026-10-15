# Step 10: Skiddle API v3 Compatibility & Pagination Modernization

## Objective
Resolve API v3 deprecation errors where legacy parameters (`limit` and `offset`) caused `400 Bad Request` responses on event listing queries across both the PHP and JavaScript SDKs, maintain cross-SDK parity, and eliminate PHP 8.2+ runtime deprecations.

---

## 1. Problem Diagnosis

When executing automated replay scenarios and developer load tests against the Skiddle API v3 events endpoint (`/v3/events/instant-search/`), requests failed with:

```text
[8/10]  Bandit: Festivals in the UK
     ✖ Failed (56ms) — Parameters 'limit' and 'offset' have been deprecated use page[number] and page[size] instead
[9/10]  Bandit: Comedy events in London
     ✖ Failed (78ms) — Parameters 'limit' and 'offset' have been deprecated use page[number] and page[size] instead
[10/10] Bandit: Live Music in Glasgow
     ✖ Failed (65ms) — Parameters 'limit' and 'offset' have been deprecated use page[number] and page[size] instead
```

### Root Causes
1. **API v3 Pagination Schema Change**:
   - The modern Skiddle API v3 enforces JSON:API-style pagination: `page[size]` and `page[number]`.
   - The legacy parameters `limit` and `offset` (from API v1) are rejected with a `400 Bad Request`.
2. **Incomplete Query Key Transformation**:
   - During the initial partial v3 migration, `transformRequestKeys()` only converted `api_key` $\rightarrow$ `apiKey`.
   - Query keys like `eventcode`, `ticketsavailable`, `b`, and `venueid` remained untranslated, causing schema rejections.
   - `order=random` is not supported on API v3.
3. **PHP 8.2+ Dynamic Property Deprecations**:
   - Properties `$debug`, `$api_key`, `$dev_mode`, `$request`, `$conditions`, and `$session` were not explicitly declared on PHP classes, producing PHP 8.2 runtime deprecation warnings.
4. **Dev-Mode Key Masking Bug in PHP**:
   - In debug/dev mode, `str_replace($args['api_key'], ...)` produced undefined array key warnings because `$args['api_key']` had already been transformed into `$args['apiKey']`.

---

## 2. Solution & Architectural Changes

### A. Transparent Pagination Normalization (`transformRequestKeys`)
Both the PHP (`php/src/SkiddleRequest.php`) and JavaScript (`javascript/src/request.ts`) request layers now translate legacy pagination automatically:

- **`limit` $\rightarrow$ `page[size]`**: Automatically maps the limit value to `page[size]` and strips `limit` from outbound query arguments.
- **`offset` $\rightarrow$ `page[number]`**: Calculates the 1-based page number using `floor(offset / pageSize) + 1` (defaulting `pageSize` to 20 if unspecified) and strips `offset` from outbound query arguments.
- If explicit `page[size]` or `page[number]` parameters are already supplied, they are preserved and take precedence.

#### PHP Implementation (`php/src/SkiddleRequest.php`)
```php
public function transformRequestKeys(array $requestData)
{
    $renameKeys = [
        'api_key'          => 'apiKey',
        'eventcode'        => 'eventCode',
        'ticketsavailable' => 'ticketsAvailable',
        'tickets'          => 'ticketsAvailable',
        'b'                => 'brandId',
        'venueid'          => 'venueIds',
        'venueId'          => 'venueIds',
    ];

    $newArgs = [];
    $limit = null;
    $offset = null;

    foreach ($requestData as $key => $val) {
        if ($key === 'limit') {
            $limit = $val;
            continue;
        }
        if ($key === 'offset') {
            $offset = $val;
            continue;
        }
        if ($key === 'order' && is_string($val) && strtolower($val) === 'random') {
            continue;
        }
        if (array_key_exists($key, $renameKeys)) {
            $key = $renameKeys[$key];
        }
        if ($key === 'eventCode' && is_string($val)) {
            $val = strtoupper($val);
        }
        $newArgs[$key] = $val;
    }

    if ($limit !== null && !isset($newArgs['page[size]'])) {
        $newArgs['page[size]'] = $limit;
    }

    if ($offset !== null && !isset($newArgs['page[number]'])) {
        $pageSize = ($limit !== null && (int)$limit > 0) ? (int)$limit : 20;
        $newArgs['page[number]'] = intdiv((int)$offset, $pageSize) + 1;
    }

    return $newArgs;
}
```

#### TypeScript / JavaScript Implementation (`javascript/src/request.ts`)
```typescript
public transformRequestKeys(requestData: Record<string, unknown>): Record<string, unknown> {
  const renameKeys: Record<string, string> = {
    api_key: 'apiKey',
    eventcode: 'eventCode',
    ticketsavailable: 'ticketsAvailable',
    tickets: 'ticketsAvailable',
    b: 'brandId',
    venueid: 'venueIds',
    venueId: 'venueIds',
  };

  const newArgs: Record<string, unknown> = {};
  let limit: unknown = undefined;
  let offset: unknown = undefined;

  for (const [key, val] of Object.entries(requestData)) {
    if (key === 'limit') {
      limit = val;
      continue;
    }
    if (key === 'offset') {
      offset = val;
      continue;
    }
    if (key === 'order' && typeof val === 'string' && val.toLowerCase() === 'random') {
      continue;
    }
    const targetKey = renameKeys[key] || key;
    newArgs[targetKey] =
      targetKey === 'eventCode' && typeof val === 'string' ? val.toUpperCase() : val;
  }

  if (limit !== undefined && newArgs['page[size]'] === undefined) {
    newArgs['page[size]'] = limit;
  }

  if (offset !== undefined && newArgs['page[number]'] === undefined) {
    const parsedLimit = Number(limit);
    const pageSize = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const parsedOffset = Number(offset) || 0;
    newArgs['page[number]'] = Math.floor(parsedOffset / pageSize) + 1;
  }

  return newArgs;
}
```

---

### B. PHP 8.2+ Modernization & Dynamic Property Fixes
- Added explicit class properties in:
  - `php/src/SkiddleSession.php`: `public $api_key;`, `public $dev_mode = false;`
  - `php/src/SkiddleRequest.php`: `public $apiVersion = 1;`, `public $debug;`
  - `php/src/SkiddleBase.php`: `public $request;`, `public $conditions = [];`, `public $session;`
- Hardened dev-mode debugging to inspect both `apiKey` and `api_key` when masking credentials in URLs and curl info.

---

### C. CLI Scenario Runner Modernization (`cli/src/commands/scenarios.js`)
- Updated the response item count counter to inspect both `res.data` (API v3 schema) and `res.results` (API v1 schema).

---

## 3. Verification & Validation

| Test Target | Verification Command | Result |
| :--- | :--- | :--- |
| **PHP Syntax Checks** | `cd php && php -l autoloader.php && php -l src/SkiddleRequest.php ...` | All passed, 0 syntax errors |
| **PHP Live V3 Query** | Tested `Events::getListings()` with `limit`, `offset`, and `eventcode` | Returned 5 events, 0 deprecation notices |
| **TypeScript Typecheck** | `pnpm typecheck` | Passed (`tsc --noEmit`), 0 errors |
| **JavaScript Unit Tests** | `pnpm --filter skiddle-sdk test` | 14/14 Vitest tests passing |
| **Dual ESM/CJS Build** | `pnpm build` | Clean dual compilation via `tsup` |
| **Developer CLI Scenarios** | `node cli/bin/nx.js scenarios` | **10/10 scenarios passed in 1.57s** |

```text
  WILCO: Executing 10 test scenario(s) (PHP LoadTest Parity)...
─────────────────────────────────────────────────────────────────
[1/10]  Bandit: Events within 10 miles of Manchester       ✔ Passed (196ms) — Returned 5 event(s)
[2/10]  Bandit: Latest Club nights (random order)         ✔ Passed (121ms) — Returned 5 event(s)
[3/10]  Bandit: Popular events trending now (goingto count)✔ Passed (130ms) — Returned 5 event(s)
[4/10]  Bandit: Tribute Acts                              ✔ Passed (155ms) — Returned 5 event(s)
[5/10]  Bandit: Events with tickets on sale               ✔ Passed (398ms) — Returned 5 event(s)
[6/10]  Bandit: Brand Showcase: Weird Science             ✔ Passed (162ms) — Returned 5 event(s)
[7/10]  Bandit: Venue Showcase: Thekla, Bristol           ✔ Passed (98ms)  — Returned 5 event(s)
[8/10]  Bandit: Festivals in the UK                       ✔ Passed (92ms)  — Returned 5 event(s)
[9/10]  Bandit: Comedy events in London                   ✔ Passed (125ms) — Returned 5 event(s)
[10/10] Bandit: Live Music in Glasgow                     ✔ Passed (90ms)  — Returned 5 event(s)
─────────────────────────────────────────────────────────────────
  Tally-ho: All 10 scenarios passed successfully in 1570ms.
```
