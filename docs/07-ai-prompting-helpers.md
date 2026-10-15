# Step 7: Antigravity AI Prompting Helpers & Agent Automation

> **Target Audience:** Engineering Team & AI Pair-Programmers  
> **Objective:** Document the customized Antigravity AI configuration, workspace rules, modular skills, and prompt templates designed to accelerate development on the Skiddle SDK & NX° CLI.

---

## 🚀 Overview

To make developing and extending this project fast, consistent, and resource-efficient with **Google Antigravity**, we have established a complete AI pair-programming infrastructure directly inside the repository.

Antigravity operates with automatic progressive discovery:
1. **Workspace Rules (`AGENTS.md` / `GEMINI.md`)**: Automatically loaded at workspace root for every session. Enforces architecture constraints, zero-dependency rules, and verification patterns.
2. **Specialized Skills (`.agents/skills/`)**: Modular runbooks discovered and loaded on-demand when user prompts match specific development tasks.
3. **Reusable Prompt Templates (`.agents/prompts/`)**: Pre-crafted, high-signal prompts for developers to copy-paste or reference.

---

## 📂 AI Configuration Map

```
skiddle/
├── AGENTS.md                            # High-priority workspace rules for Antigravity
├── GEMINI.md                            # Symlink for Gemini/Antigravity discovery
├── .agents/
│   ├── skills/
│   │   ├── skiddle-sdk-dev/             # Skill: Developing & extending the TypeScript SDK
│   │   │   └── SKILL.md
│   │   ├── skiddle-cli-dev/             # Skill: Adding & modifying NX° CLI commands
│   │   │   └── SKILL.md
│   │   └── skiddle-mock-tester/         # Skill: Deterministic Vitest fetch mocking
│   │       └── SKILL.md
│   └── prompts/
│       ├── add-endpoint.md              # Template: Scaffolding a new API endpoint/resource
│       ├── port-php-feature.md          # Template: Porting logic from legacy PHP SDK
│       ├── add-cli-command.md           # Template: Adding a subcommand to NX° CLI
│       └── fix-bug.md                   # Template: Reproducing & fixing issues with tests
└── docs/
    └── 07-ai-prompting-helpers.md       # This guide
```

---

## 🛠 Active Skills

### 1. `skiddle-sdk-dev`
- **When it triggers:** User asks to add, modify, or refactor SDK resources, endpoints, types, or build settings.
- **Enforces:**
  - Zero external dependencies in `src/`.
  - Proper `.js` extensions on relative ESM imports.
  - Inheritance from `SkiddleBase`.
  - Type definitions in `src/types.ts` and exports in `src/index.ts`.
  - Verification sequence (`vitest`, `tsc`, `tsup`).

### 2. `skiddle-cli-dev`
- **When it triggers:** User asks to create, modify, or troubleshoot CLI commands in `cli/`.
- **Enforces:**
  - Commander subcommand pattern in `cli/src/commands/`.
  - CLI feedback with `picocolors` and `prompts`.
  - Re-use of built SDK via `createClient({ apiKey })`.
  - Pre-test build verification (`npm run build`).

### 3. `skiddle-mock-tester`
- **When it triggers:** User asks to author tests or test API integration without live network calls.
- **Enforces:**
  - Deterministic mocking with `vi.spyOn(globalThis, 'fetch')`.
  - Coverage for Skiddle API v1 (`error: 0`) and v3 error structures (`error: 1`, `detail`).
  - Strict assertion on query parameters and credentials.

---

## 📋 Copy-Paste Prompt Templates

The `.agents/prompts/` folder contains ready-to-use prompts:

| Goal | Prompt File | Usage |
| :--- | :--- | :--- |
| **Add New Endpoint** | [add-endpoint.md](file:///Users/milky/My%20Drive/GitHub/skiddle/.agents/prompts/add-endpoint.md) | Copy, replace `[RESOURCE_NAME]`, paste to Antigravity |
| **Port PHP Logic** | [port-php-feature.md](file:///Users/milky/My%20Drive/GitHub/skiddle/.agents/prompts/port-php-feature.md) | Reference legacy `/php` class to port accurately |
| **Add CLI Command** | [add-cli-command.md](file:///Users/milky/My%20Drive/GitHub/skiddle/.agents/prompts/add-cli-command.md) | Scaffold a new command in `cli/src/commands/` |
| **Fix a Bug** | [fix-bug.md](file:///Users/milky/My%20Drive/GitHub/skiddle/.agents/prompts/fix-bug.md) | Test-first bug reproduction and minimal fix |

---

## 💡 Recommended Antigravity Slash Commands

- `/plan`: Use before major refactors (e.g., adding streaming responses or pagination iterators) to draft architecture steps.
- `/boost`: Use for complex multi-endpoint integrations or deep architectural reasoning.
- `/goal`: Use for autonomous, end-to-end task completion (e.g. running full verification across build, test, and CLI).
