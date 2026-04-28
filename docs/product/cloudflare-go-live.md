# Qahal Cloudflare Go-Live Guide

This is the single source of truth for a full Cloudflare setup of all environments.

Use this document top-to-bottom. Do not skip steps.

Run all commands from `/Users/jhonny/qahal`.

## Target names and domains

- Worker (testing): `qahal-dev`
- Worker (production): `qahal`
- Pages project (testing): `qahal-dev`
- Pages project (production): `qahal`
- API domain (testing): `api-development.qahal.xyz`
- API domain (production): `api.qahal.xyz`
- App domain (testing): `development.qahal.xyz`
- App domain (production): `app.qahal.xyz`

## -1) Optional full reset

Run this only if you want to recreate everything from zero.

```bash
bunx wrangler delete qahal-worker --force || true
bunx wrangler delete qahal-worker-production --force || true
bunx wrangler delete qahal-dev --force || true
bunx wrangler delete qahal --force || true

bunx wrangler pages project delete qahal-dev --yes || true
bunx wrangler pages project delete qahal --yes || true
bunx wrangler pages project delete qahal-miniapp-test --yes || true
bunx wrangler pages project delete qahal-miniapp-prod --yes || true
```

If you also want to recreate databases, run:

```bash
bunx wrangler d1 delete qahal-db-test --yes || true
bunx wrangler d1 delete qahal-db-prod --yes || true
```

## 0) Fill `.env`

Set these values in `.env`:

- `TELEGRAM_BOT_TOKEN_TEST`
- `TELEGRAM_BOT_TOKEN_PROD`
- `INITDATA_MAX_AGE_SECONDS_TEST=300`
- `INITDATA_MAX_AGE_SECONDS_PROD=300`

Verify they are not empty:

```bash
grep '^TELEGRAM_BOT_TOKEN_TEST=' .env
grep '^TELEGRAM_BOT_TOKEN_PROD=' .env
grep '^INITDATA_MAX_AGE_SECONDS_TEST=' .env
grep '^INITDATA_MAX_AGE_SECONDS_PROD=' .env
```

## 1) Install and validate

```bash
bun install
bun run check
bun run build
```

## 2) Authenticate Cloudflare

```bash
bun run cf:login
bun run cf:whoami
```

Confirm this account owns `qahal.xyz`.

## 3) Ensure D1 databases exist

List existing D1 databases:

```bash
bunx wrangler d1 list
```

If missing, create:

```bash
bun run cf:d1:create:test
bun run cf:d1:create:prod
```

## 4) Verify worker config

Open `apps/worker/wrangler.toml` and confirm:

- top-level `name = "qahal-dev"`
- production `name = "qahal"`
- testing route `api-development.qahal.xyz`
- production route `api.qahal.xyz`
- testing D1 binding uses `qahal-db-test`
- production D1 binding uses `qahal-db-prod`

## 5) Run D1 migrations

```bash
bun run cf:d1:migrate:test
bun run cf:d1:migrate:prod
```

## 6) Upload worker secrets from `.env`

```bash
bun run cf:secret:bot:test
bun run cf:secret:bot:prod
bun run cf:secret:initdata:test
bun run cf:secret:initdata:prod
```

## 7) Deploy workers

```bash
bun run cf:deploy:test
bun run cf:deploy:prod
```

After deploy, verify both workers exist in Cloudflare:

- `qahal-dev`
- `qahal`

and both custom API domains are attached:

- `api-development.qahal.xyz`
- `api.qahal.xyz`

## 8) Create Pages projects

Create projects:

```bash
bunx wrangler pages project create qahal-dev --production-branch main
bunx wrangler pages project create qahal --production-branch main
```

## 9) Configure Pages (dashboard)

For both projects in Cloudflare Pages:

- Root directory: `apps/miniapp`
- Build command: `bun run build`
- Output directory: `dist`

Environment vars for `qahal-dev`:

- `VITE_API_BASE_URL=https://api-development.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=true`

Environment vars for `qahal`:

- `VITE_API_BASE_URL=https://api.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=false`

Connect GitHub repo to both Pages projects in dashboard (required for auto deploy on push).

## 10) Bind Pages domains

In Pages dashboard:

- project `qahal-dev` -> `development.qahal.xyz`
- project `qahal` -> `app.qahal.xyz`

## 11) Configure BotFather URLs

- testing bot -> `https://development.qahal.xyz`
- production bot -> `https://app.qahal.xyz`

Do not cross-link test and production URLs.

## 12) Smoke test in Telegram

For both testing and production bots:

1. Open Mini App from bot menu.
2. Confirm app shell loads and expands.
3. Confirm auth succeeds (no `invalid_hash`).
4. Complete onboarding.
5. Confirm map and communities load.
6. Confirm profile update works.

## 13) Troubleshooting

- `Invalid uuid`: wrong D1 ID in `apps/worker/wrangler.toml`.
- `Authentication error [code: 10000]`: run `bun run cf:login` and `bun run cf:whoami` again.
- `Missing TELEGRAM_BOT_TOKEN_TEST in .env`: token value is empty in `.env`.
- `invalid_hash`: wrong bot token for the bot that launched the Mini App.
- CORS failures: check `CORS_ALLOWED_ORIGINS` for both environments.
- Worker deploy from CI workspace root fails: deploy command must run from `apps/worker`.

## Useful commands

```bash
bun run cf:tail:test
bun run cf:tail:prod
```
