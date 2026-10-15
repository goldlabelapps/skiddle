# Step 2: Package & Toolchain Architecture

## Objective
Establish a lightweight, high-performance Node.js package environment supporting both ECMAScript Modules (ESM) and CommonJS (CJS) with strict TypeScript types and fast test execution.

## Key Toolchain Decisions

### 1. Dual Module Output (ESM + CommonJS)
Modern front-end applications (such as Next.js 14/15, Vite, Remix) use ESM by default, whereas legacy Node services or older build pipelines may require CommonJS.
- In `package.json`:
  ```json
  {
    "type": "module",
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js",
        "require": "./dist/index.cjs"
      }
    }
  }
  ```

### 2. Zero Runtime Bloat
- Replaced the PHP cURL dependency with the **native global `fetch` API** (standard in Node 18+ and Node 24).
- Avoided large external HTTP clients (like Axios or node-fetch), keeping the core SDK runtime bundle size under 11 KB.

### 3. Build System (`tsup`)
- Powered by `esbuild` under the hood.
- Builds both `index.js` and `index.cjs` in < 200ms and generates complete `.d.ts` declaration maps with zero complex bundler configuration.

### 4. Test Runner (`Vitest`)
- Replaced PHPUnit with `Vitest`.
- Provides instant TypeScript execution, native ESM support, and Jest-compatible assertion syntax with execution speeds measured in milliseconds.
