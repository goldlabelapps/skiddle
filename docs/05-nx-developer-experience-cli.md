# Step 5: "NX° Developer Experience" CLI (`/cli`)

## Objective
Provide developers with a terminal utility to inspect live Skiddle events, run health diagnostics, execute legacy test scenarios, and run latency benchmarks.

## Installation & Execution

```bash
# Via npm script
npm run cli -- <command>

# Or directly via binary
./cli/bin/nx.js <command>
```

## Command Reference

### 1. `doctor`
Validates local Node.js environment, checks presence of `SKIDDLE_API_KEY`, and pings the v3 instant-search endpoint to verify live connectivity and latency.
```bash
npm run cli -- doctor
```

### 2. `events [keyword]`
Searches live events and outputs a formatted summary including event date, venue, ticket availability status, and deep link.
```bash
npm run cli -- events "Creamfields" --limit 3
```

### 3. `event <id>`
Fetches detailed payload for a specific event listing ID.
```bash
npm run cli -- event 4040
```

### 4. `scenarios [id]`
Executes the test scenarios from Skiddle's legacy PHP `loadTest.php`, evaluating query parameters and verifying response health:
- Scenario 1: Events within 10 miles of Manchester (`latitude`, `longitude`, `radius`)
- Scenario 2: Club nights in random order
- Scenario 3: Trending events by `goingto` count
- Scenario 4: Tribute acts
- Scenario 5: Events with active tickets on sale
- Scenario 6: Brand showcase (Weird Science)
- Scenario 7: Venue showcase (Thekla, Bristol)

```bash
npm run cli -- scenarios 1
```

### 5. `benchmark`
Runs parallel load requests to measure API throughput (req/s), average latency, and p50/p95/p99 percentiles.
```bash
npm run cli -- benchmark --concurrency 5 --requests 20
```

### 6. `interactive`
Launches an interactive prompt menu allowing developers to navigate features without remembering command-line flags.
```bash
npm run cli -- interactive
```
