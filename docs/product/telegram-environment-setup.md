# Telegram Environment Setup for Qahal

This guide is focused only on the Telegram Mini App environment setup for this project.

## Prerequisites

1. Bun 1.2 or newer
2. Cloudflare account
3. Telegram account
4. Bot token from BotFather

## 1) Install dependencies

Run in project root (/Users/jhonny/qahal):

```bash
bun install
```

## 2) Create your Telegram bot and Mini App entry

In Telegram, open BotFather and do the following:

1. Run /newbot and create your bot.
2. Copy the bot token.
3. Configure Mini App launch for your bot (menu button or direct launch option).
4. Set Mini App URL to your deployed frontend HTTPS URL.

Notes:

- Telegram Mini Apps require HTTPS in production.
- The frontend domain in BotFather should match your deployed app domain.

## 3) Configure Cloudflare D1

Run in /Users/jhonny/qahal/apps/worker:

```bash
cd /Users/jhonny/qahal/apps/worker
bunx wrangler d1 create qahal-db
```

Then update apps/worker/wrangler.toml with the real D1 database ID:

- database_name = "qahal-db"
- database_id = "<YOUR_REAL_D1_DATABASE_ID>"

Apply migrations in /Users/jhonny/qahal/apps/worker:

```bash
cd /Users/jhonny/qahal/apps/worker
bunx wrangler d1 migrations apply qahal-db --local --config wrangler.toml
bunx wrangler d1 migrations apply qahal-db --remote --config wrangler.toml
```

## 4) Configure Worker secrets

Run in /Users/jhonny/qahal/apps/worker:

```bash
cd /Users/jhonny/qahal/apps/worker
bunx wrangler secret put TELEGRAM_BOT_TOKEN
```

Optional:

```bash
cd /Users/jhonny/qahal/apps/worker
bunx wrangler secret put INITDATA_MAX_AGE_SECONDS
```

INITDATA_MAX_AGE_SECONDS defaults to 300 seconds if omitted.

## 5) Run local development

Run in /Users/jhonny/qahal:

```bash
bun run dev
```

This starts:

- Frontend at http://localhost:3006
- Worker at http://127.0.0.1:8787
- API proxy from frontend /api to worker

## 6) Deploy Worker and frontend

Deploy Worker from /Users/jhonny/qahal/apps/worker:

```bash
cd /Users/jhonny/qahal/apps/worker
bun run deploy
```

Set frontend production environment variable:

```bash
VITE_API_BASE_URL=https://your-worker-url.workers.dev
```

If frontend is on Cloudflare Pages, set VITE_API_BASE_URL in Pages environment settings.

## 7) Connect Telegram bot to deployed frontend

In BotFather, set the Mini App URL to your deployed frontend URL.

Expected flow in Telegram:

1. Telegram opens the Mini App in WebView.
2. Telegram provides initData.
3. Frontend sends initData to worker endpoint /auth/telegram/verify.
4. Worker validates signature using TELEGRAM_BOT_TOKEN.

## 8) Validate setup

Run checks in /Users/jhonny/qahal:

```bash
bun run check
bun run build
```

Manual Telegram validation:

1. Open your bot in Telegram.
2. Launch Mini App.
3. Confirm full-height launch and theme behavior.
4. Confirm auth endpoint accepts valid initData.

## Troubleshooting

- invalid_hash from /auth/telegram/verify:
  - TELEGRAM_BOT_TOKEN is wrong for the bot launching the Mini App.
- init_data_expired:
  - Launch app again or adjust INITDATA_MAX_AGE_SECONDS.
- D1 runtime errors:
  - database_id is still placeholder or migrations are missing.
- App works in browser but not in Telegram:
  - BotFather Mini App URL is not the deployed HTTPS frontend URL.
