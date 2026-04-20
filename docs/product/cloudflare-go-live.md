# Qahal Cloudflare Go-Live Guide

This guide gets Qahal live with separate testing and production environments for Telegram Mini App usage.

## 1. Target Architecture

Use two isolated environments:

- Testing (staging): safe for internal QA and simulated data.
- Production: real users and real data only.

Recommended custom domains:

- Testing miniapp: https://development.qahal.xyz
- Testing API: https://api-development.qahal.xyz
- Production miniapp: https://app.qahal.xyz
- Production API: https://api.qahal.xyz

## 2. Why Two Environments

Telegram initData verification is tied to the bot token that launched the Mini App.
Each environment must keep these aligned:

- BotFather Mini App URL
- Worker TELEGRAM_BOT_TOKEN
- Frontend VITE_API_BASE_URL
- D1 database

## 3. Prerequisites

- Bun installed
- Cloudflare account (Pages + Workers + D1)
- Telegram account
- Two Telegram bots from BotFather (test + prod)

## 4. Local Validation Before Deploy

From repository root:

```bash
bun install
bun run check
bun run build
```

From worker folder:

```bash
cd apps/worker
bun run build
```

## 5. Create D1 Databases

From `apps/worker`:

```bash
bunx wrangler d1 create qahal-db-test
bunx wrangler d1 create qahal-db-prod
```

Copy both `database_id` values.

## 6. Configure Worker D1 Bindings

Update `apps/worker/wrangler.toml`:

- Replace `database_id = "REPLACE_WITH_D1_DATABASE_ID"` with the target environment ID.
- Keep test and prod IDs separate.

If you deploy both environments from one codebase, maintain environment-specific Wrangler config values per target.

## 7. Apply D1 Migrations

From `apps/worker`:

```bash
bunx wrangler d1 migrations apply qahal-db-test --remote --config wrangler.toml
bunx wrangler d1 migrations apply qahal-db-prod --remote --config wrangler.toml
```

## 8. Configure Worker Secrets and Vars

From `apps/worker` set bot token and optional max age:

```bash
bunx wrangler secret put TELEGRAM_BOT_TOKEN
bunx wrangler secret put INITDATA_MAX_AGE_SECONDS
```

Set per environment:

- Testing token for testing worker
- Production token for production worker

Set CORS allowlist var in Wrangler or dashboard:

- `CORS_ALLOWED_ORIGINS="https://development.qahal.xyz,https://app.qahal.xyz"`

## 9. Deploy Worker API

From `apps/worker`:

```bash
bun run deploy
```

Verify:

- `GET /health` returns `ok: true`
- `POST /auth/telegram/verify` validates real Telegram launch initData

## 10. Create Cloudflare Pages Projects

Create Pages project(s) from this repo for `apps/miniapp`.

Build settings:

- Build command: `bun run build`
- Output directory: `dist`
- Root directory: `apps/miniapp`

Environment variables:

Testing:

- `VITE_API_BASE_URL=https://api-development.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=true`

Production:

- `VITE_API_BASE_URL=https://api.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=false`

## 11. Bind Custom Domains

Cloudflare Pages domains:

- Testing project/deployment -> `development.qahal.xyz`
- Production project/deployment -> `app.qahal.xyz`

Cloudflare Worker custom domains/routes:

- Testing worker -> `api-development.qahal.xyz`
- Production worker -> `api.qahal.xyz`

## 12. Configure BotFather URLs

Testing bot:

- Mini App URL = `https://development.qahal.xyz`

Production bot:

- Mini App URL = `https://app.qahal.xyz`

Do not cross-link test bot token with production Mini App URL, or vice versa.

## 13. Telegram End-to-End Smoke Test

Run these in Telegram for both bots:

1. Launch Mini App from bot menu button.
2. Confirm shell loads and expands properly.
3. Confirm auth passes (no invalid hash/auth errors).
4. Complete onboarding.
5. Confirm map/community screens load.
6. Confirm profile update works.
7. Confirm API responses are healthy.

## 14. Simulated Data Strategy

- Keep simulated/fallback data only in testing.
- Keep production strictly real data.
- Use staging environment to validate onboarding and map flows repeatedly without polluting production.

## 15. Production Release Checklist

Before going live:

1. Build and typecheck pass.
2. Worker has correct production D1 binding.
3. Worker secrets point to production bot token.
4. Production Pages env uses production API URL.
5. BotFather production bot points to production app domain.
6. CORS allowlist includes production app domain.
7. Health and Telegram verify endpoint tested from production URL.

## 16. Troubleshooting

- `invalid_hash` on `/auth/telegram/verify`:
  - Wrong bot token for the bot that launched the Mini App.
- Onboarding/profile calls fail with CORS:
  - Missing method in CORS config or origin not in `CORS_ALLOWED_ORIGINS`.
- D1 errors:
  - Wrong `database_id` or migrations not applied.
- Works locally but fails in Telegram:
  - BotFather URL not matching deployed HTTPS miniapp domain.

## 17. Files In This Repo Related To Deploy

- `apps/miniapp/src/app/useAppFlow.ts`
- `apps/miniapp/src/lib/api.ts`
- `apps/miniapp/src/lib/env.ts`
- `apps/worker/src/routes/auth.ts`
- `apps/worker/src/middleware/cors.ts`
- `apps/worker/src/types/env.ts`
- `apps/worker/wrangler.toml`
