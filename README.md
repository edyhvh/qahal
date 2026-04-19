# Qahal

Qahal is a Telegram Mini App focused on helping users connect with local Emunah communities in the physical world.

## Stack

- Package manager and runtime: Bun
- Frontend: React 19 + TypeScript + Tailwind + TelegramUI + Leaflet
- Backend: Hono + Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2 and KV when needed

## Monorepo Structure

- apps/miniapp: Telegram Mini App frontend
- apps/worker: Cloudflare Worker backend
- packages/shared: shared types and schemas

## Setup

1. In /Users/jhonny/qahal run:

```bash
bun install
```

2. In /Users/jhonny/qahal run frontend and worker in parallel:

```bash
bun run dev
```

3. In /Users/jhonny/qahal run checks:

```bash
bun run check
```

4. In /Users/jhonny/qahal run builds:

```bash
bun run build
```

## Worker Environment

Set Worker secrets before deployment:

- TELEGRAM_BOT_TOKEN
- INITDATA_MAX_AGE_SECONDS (optional)

Configure D1 in apps/worker/wrangler.toml by setting database_id and database_name.

## Paper-to-Code

Design integration workflow is documented in docs/product/paper-to-code.md.
