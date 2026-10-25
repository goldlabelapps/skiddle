# NX° Developer Experience CLI (`@skiddle/cli`)

> **Day-0 Developer Experience & Diagnostics for the Skiddle Platform**  
> *How is it used? It's used always, from the very start: `pnpm install && pnpm cli`.*  
> Eliminates developer onboarding friction entirely. An interactive, self-documenting terminal utility to diagnose environments, explore live event endpoints, benchmark latency, and execute legacy test scenarios.

---

## ⚡ Day-0 Developer Onboarding

In modern engineering teams, onboarding friction kills momentum. The NX° CLI solves this immediately:
```bash
# Clone the repository
git clone <repo-url> && cd skiddle

# Install and launch the interactive CLI
pnpm install
pnpm cli
```
Within 30 seconds, any engineer—regardless of familiarity with the repo—can verify API credentials with `doctor`, query live events, run latency benchmarks, and replay test suites with zero manual configuration.

---

## 📦 Usage

### Inside this Monorepo
```bash
# Interactive menu (recommended entry point)
pnpm cli

# Direct command execution via root alias
pnpm cli [command]

# Targeted execution via package filter
pnpm --filter @skiddle/cli start [command]
```

### Standalone / NPX Execution
```bash
npx @skiddle/cli doctor
# or install globally
npm install -g @skiddle/cli
skiddle-nx doctor
```

---

## 🛠 Available Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `doctor` | Validates environment, Node version, and pings API v1/v3 | `pnpm cli doctor` |
| `events <query>` | Searches events with pricing, dates, and ticket status | `pnpm cli events "Warehouse Project" --limit 5` |
| `event <id>` | Inspects full details of a specific event ID | `pnpm cli event 12345678` |
| `scenarios [id]` | Runs classic Skiddle test scenarios (1–10) | `pnpm cli scenarios 1` |
| `benchmark` | Measures latency (p50/p95/p99) and request throughput | `pnpm cli benchmark -c 5 -n 20` |
| `git [action]` | Conventional commit helper and uncommitted status | `pnpm cli git commit` |
| `test [mode]` | Runs pipeline quality gates (typecheck, tests, build) | `pnpm cli test pipeline` |

---

## 🔑 Environment Configuration

The CLI automatically reads `SKIDDLE_API_KEY` from your local `.env` file or process environment.

You can also pass the key explicitly with any command:
```bash
pnpm cli doctor --key "YOUR_SKIDDLE_API_KEY"
```

---

## 🧪 Testing

```bash
pnpm --filter @skiddle/cli test
```

---

## 📄 License

MIT © Skiddle Ltd
