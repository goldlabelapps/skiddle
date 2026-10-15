# AI Prompt Helper: Bug Reproduction & Minimal Fix

Use or copy this prompt when asking Antigravity to investigate and fix a bug with maximum resource efficiency.

---

```markdown
There is an issue reported in [COMPONENT_OR_FILE]:
[DESCRIBE THE ISSUE OR ERROR MESSAGE]

Please follow resource-efficient debugging:
1. Write a targeted failing test in `tests/` reproducing the exact failure scenario.
2. Inspect only the affected file(s).
3. Apply the minimal necessary fix without refactoring unrelated code.
4. Verify the fix passes the targeted test: `pnpm --filter skiddle-sdk test tests/[TEST_FILE].ts`.
5. Run `pnpm typecheck` to ensure no typing regressions.
```
