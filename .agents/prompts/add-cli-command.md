# AI Prompt Helper: Add New NX° CLI Command

Use or copy this prompt when asking Antigravity to add a developer utility or command to the NX° CLI.

---

```markdown
I want to add a new command `[COMMAND_NAME]` to the NX° CLI (`cli/`).

Requirements:
1. Implement the command handler in `cli/src/commands/[COMMAND_NAME].js`.
2. Register the command in `cli/src/index.js` using `commander`.
3. Use `picocolors` for status outputs and `prompts` if user input is needed.
4. Integrate with the SDK via `createClient({ apiKey })` from `'skiddle-sdk'`.
5. Run `pnpm build` to ensure the SDK distribution is up-to-date.
6. Verify the command using `node ./cli/bin/nx.js [COMMAND_NAME] --help` and a dry-run execution.
```
