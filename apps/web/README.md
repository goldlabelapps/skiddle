# Skiddle Web App (`apps/web`)

Next.js 15 application built in the Skiddle monorepo powered by Turborepo.

## Features
- Next.js App Router & React 19
- Consumes `@skiddle/sdk` directly via workspace linking (`workspace:*`)
- Optimized build cache with Turborepo

## Running Locally

```bash
# Run web app only
pnpm --filter web dev

# Or run all apps in monorepo via Turborepo
pnpm dev
```
