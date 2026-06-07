# 2026-06-07 - backend-foundation

## Files changed
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/lib/errors.ts`
- `apps/api/src/middleware/errorHandler.ts`
- `logs/backend.md`

## What was implemented
- Kept the Express app/server split with `app.ts` exporting the testable app and `server.ts` owning `listen()`.
- Added `config/env.ts` with dotenv loading and Zod validation for `NODE_ENV` and `PORT`.
- Added `/health` and `/api/health` JSON health endpoints.
- Added central API error primitives in `lib/errors.ts`.
- Added `middleware/errorHandler.ts` to return the shared `{ error: { code, message, details } }` response shape.
- Added unknown-route handling through the central error handler.

## How to test
- `cd apps/api && ./node_modules/.bin/tsc --noEmit --ignoreDeprecations 6.0`
- `pnpm --filter @storybook/api build`
- `pnpm --filter @storybook/api dev`, then request `GET /health` or `GET /api/health`.

## Known issues
- `pnpm --filter @storybook/api build` currently stops at dependency build-script approval for `esbuild@0.28.0`; no dependency policy changes were made.
- The TypeScript command needs `--ignoreDeprecations 6.0` because the root `tsconfig.json` uses `baseUrl`, which TypeScript 6 reports as deprecated.
