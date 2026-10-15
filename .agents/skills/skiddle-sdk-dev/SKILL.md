---
name: skiddle-sdk-dev
description: >-
  Develop, extend, or refactor the Skiddle JavaScript/TypeScript SDK (javascript/src/), add new API endpoints or resources,
  update type definitions, and verify dual ESM/CJS builds and tests.
---

# Skiddle SDK Development Workflow

Use this skill when implementing new features, endpoints, or fixes in the Skiddle JavaScript & TypeScript SDK (`javascript/src/`).

## Architectural Principles

1. **Zero External Dependencies**:
   The SDK runtime must remain lightweight and dependency-free. Always use native `fetch`, `URL`, `URLSearchParams`, and `AbortController`.
2. **ESM Import Convention**:
   All relative imports within `javascript/src/` must specify the `.js` extension (e.g. `import { SkiddleBase } from './base.js';`).
3. **Inheritance & Fluent API**:
   Any new resource or entity must extend `SkiddleBase` to inherit condition management and request delegation.

---

## Step-by-Step: Adding a New Resource Entity

### 1. Define Resource Types in `javascript/src/types.ts`
Export strongly-typed interfaces for the endpoint params and response data:
```typescript
export interface MyResourceQueryConditions extends QueryConditions {
  filterKey?: string;
}

export interface MyResourceResponse {
  error: number;
  totalcount?: number;
  results: Array<{
    id: string;
    name: string;
    // ...
  }>;
}
```

### 2. Implement Entity Class in `javascript/src/<resource>.ts`
Extend `SkiddleBase`:
```typescript
import { SkiddleBase } from './base.js';
import type { MyResourceResponse } from './types.js';

export class MyResource extends SkiddleBase {
  public async getListings(): Promise<MyResourceResponse> {
    return this.request.callApi<MyResourceResponse>('myendpoint/', this.conditions);
  }

  public async getById(id: string | number): Promise<MyResourceResponse> {
    return this.request.callApi<MyResourceResponse>(`myendpoint/${id}/`);
  }
}
```

### 3. Expose via `javascript/src/index.ts`
1. Re-export the new file:
   ```typescript
   export * from './myresource.js';
   ```
2. Instantiate and attach in `createClient()`:
   ```typescript
   const myresource = new MyResource();
   myresource.setSession(session);
   return { session, events, artists, venues, myresource };
   ```

### 4. Add Unit Tests in `javascript/tests/sdk.test.ts`
Mock `globalThis.fetch` to assert request URL, query string serialization, and returned objects.

---

## ⚡ Verification Checklist

Run targeted verification:
1. `pnpm --filter skiddle-sdk test tests/sdk.test.ts` — Verify tests pass.
2. `pnpm typecheck` — Verify strict TypeScript compilation.
3. `pnpm build` — Verify dual ESM (`dist/index.js`) and CJS (`dist/index.cjs`) output.

