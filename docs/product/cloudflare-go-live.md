# Qahal Cloudflare Go-Live Guide

This is the single source of truth for deploying Qahal to Cloudflare.

## Single Step-by-Step Path

Run all commands from `/Users/jhonny/qahal`.

### 0. Fill `.env` first

Open `.env` and set:

- `TELEGRAM_BOT_TOKEN_TEST`
- `TELEGRAM_BOT_TOKEN_PROD`
- `INITDATA_MAX_AGE_SECONDS_TEST` (default `300`)
- `INITDATA_MAX_AGE_SECONDS_PROD` (default `300`)

### 1. Validate the project

```bash
bun install
bun run check
bun run build
```

### 2. Authenticate with Cloudflare

```bash
bun run cf:login
bun run cf:whoami
```

### 3. Verify D1 IDs in Wrangler config

Open `apps/worker/wrangler.toml` and make sure these are set:

- Testing D1 ID: `81652040-b23b-4841-bd48-a129b3d34d5a`
- Production D1 ID: `bc3c7a13-6714-4396-af65-728eda27aa7c`

### 4. Apply D1 migrations

```bash
bun run cf:d1:migrate:test
bun run cf:d1:migrate:prod
```

### 5. Set Worker secrets

These commands read values from `.env` and upload them to Cloudflare.

First verify `.env` is filled:

```bash
grep '^TELEGRAM_BOT_TOKEN_TEST=' .env
grep '^TELEGRAM_BOT_TOKEN_PROD=' .env
grep '^INITDATA_MAX_AGE_SECONDS_TEST=' .env
grep '^INITDATA_MAX_AGE_SECONDS_PROD=' .env
```

If any line ends with only `=`, fill that value in `.env` before continuing.

```bash
bun run cf:secret:bot:test
bun run cf:secret:bot:prod
bun run cf:secret:initdata:test
bun run cf:secret:initdata:prod
```

### 6. Deploy Workers

The scripts explicitly target testing top-level environment and production environment, so multi-environment Wrangler warnings should not appear.
Worker custom domains are configured in `apps/worker/wrangler.toml` and will be applied by these deploy commands.

```bash
bun run cf:deploy:test
bun run cf:deploy:prod
```

### 7. Create Cloudflare Pages projects

Create two Pages projects from this repository with:

- Root directory: `apps/miniapp`
- Build command: `bun run build`
- Output directory: `dist`

Testing Pages env vars:

- `VITE_API_BASE_URL=https://api-development.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=true`

Production Pages env vars:

- `VITE_API_BASE_URL=https://api.qahal.xyz`
- `VITE_ENABLE_PROFILE_TESTING=false`

### 8. Bind domains

Worker API domains (managed by Wrangler deploy from `apps/worker/wrangler.toml`):

- Testing API: `api-development.qahal.xyz`
- Production API: `api.qahal.xyz`

Pages domains (configure in Cloudflare Pages dashboard):

- Testing app: `development.qahal.xyz`
- Production app: `app.qahal.xyz`

### 9. Configure BotFather Mini App URLs

- Testing bot URL: `https://development.qahal.xyz`
- Production bot URL: `https://app.qahal.xyz`

Do not cross-link test bot with production URL or production bot with test URL.

### 10. Smoke test both bots in Telegram

For testing and production bots:

1. Open Mini App from bot menu.
2. Confirm app shell loads and expands.
3. Confirm auth succeeds (no `invalid_hash`).
4. Complete onboarding.
5. Confirm map and communities load.
6. Confirm profile update works.

### 11. Troubleshooting

- If migration fails with `Invalid uuid`: wrong D1 ID in `apps/worker/wrangler.toml`.
- If migration/deploy fails with `Authentication error [code: 10000]`: run `bun run cf:login` again and confirm with `bun run cf:whoami`.
- If secrets command says `Missing TELEGRAM_BOT_TOKEN_TEST in .env` (or similar): the value is empty or missing in `.env`.
- If Telegram auth fails with `invalid_hash`: bot token does not match the bot that launched the Mini App.
- If API requests fail with CORS: verify `CORS_ALLOWED_ORIGINS` includes `https://development.qahal.xyz,https://app.qahal.xyz` in production vars.

### 12. Useful commands

```bash
bun run cf:tail:test
bun run cf:tail:prod
```
