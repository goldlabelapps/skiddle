# AI Prompt Helper: Add New Skiddle API Resource

Use or copy this prompt when asking Antigravity to implement a new API endpoint or resource in the SDK.

---

```markdown
I want to add support for the Skiddle [RESOURCE_NAME] endpoint (e.g., /v1/[ENDPOINT_PATH]/).

Please follow the project guidelines:
1. Define the TypeScript interfaces in `src/types.ts` for both query parameters and API response objects.
2. Implement a new class `src/[RESOURCE_NAME].ts` extending `SkiddleBase`.
3. Re-export the entity and update `createClient()` in `src/index.ts`.
4. Add unit test coverage in `tests/sdk.test.ts` mocking `fetch` calls.
5. Verify your implementation with:
   - `pnpm test`
   - `pnpm typecheck`
   - `pnpm build`
Ensure zero external dependencies are added to `src/`.
```
