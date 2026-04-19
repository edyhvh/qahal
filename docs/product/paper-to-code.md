# Paper to Code Workflow

## Goal

Convert approved MCP Paper artboards into production-ready React + TelegramUI screens with low rework.

## Workflow

1. Freeze screen inventory in Paper.
2. For each screen, define component contract and states.
3. Build screen shell in apps/miniapp/src/features with TelegramUI primitives.
4. Wire route and local state first, then API integration.
5. Validate visual parity against Paper after each slice.
6. Promote reusable parts into apps/miniapp/src/components.

## Naming Rules

- Screen files: FeaturePurposeScreen.tsx
- Reusable blocks: FeatureNameCard.tsx
- Hooks: useFeatureName.ts

## Delivery Pattern

For each screen:

1. Static shell
2. Mocked data state
3. Worker API integration
4. D1 persistence
5. Telegram runtime polish (theme, haptics, safe area)

## Definition of Done

A screen is done when:

- Visual parity with Paper is approved.
- Runtime behavior works inside Telegram WebView.
- Typecheck passes in all workspaces.
- API contracts use shared schemas.
