# AI Prompt Helper: Port Feature from Legacy PHP SDK

Use or copy this prompt when asking Antigravity to check the original PHP implementation and port missing logic or behavior.

---

```markdown
Please check the legacy PHP SDK implementation located in `php/` for [FEATURE_NAME or CLASS_NAME].

Tasks:
1. Review the PHP source file (e.g. `php/classes/[FILE].php` or `php/tests/[FILE].php`).
2. Identify any query parameter mappings, validation checks, default behaviors, or response structures.
3. Port this functionality into the modern TypeScript SDK in `src/`.
4. Ensure zero external dependencies are introduced, and keep ESM/CJS build compatibility intact.
5. Add a test in `tests/sdk.test.ts` verifying behavioral equivalence with the PHP version.
6. Verify via `pnpm test` and `pnpm typecheck`.
```
