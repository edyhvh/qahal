# DESIGN.md — Qahal Design System

**Status:** Active system aligned with current miniapp implementation  
**Version:** 1.2.0  
**Last Updated:** 2026-05-23

---

## 1. Brand Concept

**Qahal** (קהל — "assembly") is a sacred gathering of believers. The brandmark is a stylized **Hebrew Qof (ק)** representing spiritual connection, community, and the search for belonging.

The visual identity blends Hebrew symbolism with a warm, minimal product language: sacred purple, contemplative navy, warm white day surfaces, and warm charcoal night surfaces. The product should feel reverent, calm, and intentionally restrained.

---

## 2. Design Principles

1. **Sacred Simplicity** — Remove decorative noise. Every layer must justify itself.
2. **Warm Neutrals First** — Default screens and major sections use warm neutral surfaces, not large saturated blocks.
3. **Color With Restraint** — Purple and navy are accent tools for CTAs, active states, outlines, icons, and small emphasis areas.
4. **Flat Surfaces Over Effects** — Avoid gradients, radial overlays, glassmorphism, frosted panels, and translucent hero cards on core product surfaces.
5. **Compact Clarity** — Spacing should feel calm but efficient; sections should read quickly on mobile.
6. **Mobile-First, Telegram-Native** — Respect safe areas, vertical density, and Telegram WebView constraints.
7. **Token-Driven Consistency** — Shared theme variables in `index.css` define the visual system; screens should consume them instead of inventing local palettes.

---

## 3. Active Token Layers

`apps/miniapp/src/styles/index.css` is the live source of truth for theme tokens.

### 3.1 Brand Tokens

| Token                | Value     | Usage                                      |
| -------------------- | --------- | ------------------------------------------ |
| `--brand-purple`     | `#7D5AF2` | Primary action color, active nav, emphasis |
| `--brand-navy`       | `#09194D` | Strong text, contrast, icon color          |
| `--brand-accent`     | `#5C4DD9` | Secondary accent purple                    |
| `--brand-text`       | `#0F172A` | Light-theme text base                      |
| `--brand-text-muted` | `#475569` | Light-theme secondary text                 |
| `--brand-border`     | `#CBD5E1` | Generic subtle border                      |
| `--brand-success`    | `#10B981` | Success states                             |
| `--brand-warning`    | `#F59E0B` | Warning states                             |

### 3.2 Shell And Surface Tokens

| Token                             | Light Value              | Dark Value                | Usage                          |
| --------------------------------- | ------------------------ | ------------------------- | ------------------------------ |
| `--theme-bg-main`                 | `#F7F2EB`                | `#26211D`                 | Primary screen background      |
| `--theme-bg-solid`                | `#F7F2EB`                | `#26211D`                 | Body/root background           |
| `--theme-card-bg`                 | `#FFFAF4`                | `#332D29`                 | Elevated cards and popups      |
| `--theme-card-border`             | `rgba(9,25,77,0.08)`     | `rgba(245,239,231,0.08)`  | Card and panel borders         |
| `--theme-card-shadow`             | `0 8px 24px rgba(...)`   | `0 10px 24px rgba(...)`   | Elevated surface shadow        |
| `--theme-nav-bg`                  | `rgba(247,242,235,0.96)` | `rgba(38,33,29,0.94)`     | Bottom navigation bar          |
| `--theme-nav-shadow`              | soft top shadow          | darker top shadow         | Bottom navigation elevation    |
| `--theme-text-primary`            | `--brand-navy`           | `--brand-text-dark`       | Main text                      |
| `--theme-text-secondary`          | `--brand-text-muted`     | `--brand-text-muted-dark` | Secondary text                 |
| `--theme-surface-warm`            | `#FFFAF4`                | `#332D29`                 | Neutral filled controls        |
| `--theme-surface-warm-muted`      | `#F3ECE3`                | `#2B2622`                 | Alternate neutral section fill |
| `--theme-surface-warm-border`     | subtle neutral border    | subtle neutral border     | Inner panels and controls      |
| `--theme-surface-warm-text`       | `--brand-text`           | `--brand-text-dark`       | Filled control text            |
| `--theme-surface-warm-muted-text` | `--brand-accent`         | `#D4C7FF`                 | Muted accent text              |

### 3.3 Action Tokens

| Token                             | Usage                  |
| --------------------------------- | ---------------------- |
| `--theme-button-primary-bg`       | Primary CTA fill       |
| `--theme-button-primary-border`   | Primary CTA border     |
| `--theme-button-primary-text`     | Primary CTA text       |
| `--theme-button-primary-shadow`   | Primary CTA shadow     |
| `--theme-button-secondary-bg`     | Neutral secondary fill |
| `--theme-button-secondary-border` | Secondary border       |
| `--theme-button-secondary-text`   | Secondary text         |
| `--theme-input-bg`                | Input fill             |
| `--theme-input-border`            | Input border           |
| `--theme-input-text`              | Input text             |
| `--theme-input-placeholder`       | Input placeholder      |

### 3.4 Feature Tokens

| Token Group | Tokens                                      | Usage                               |
| ----------- | ------------------------------------------- | ----------------------------------- |
| Onboarding  | `--theme-onboarding-*`                      | Titles, cards, body copy, dots      |
| Map         | `--theme-map-canvas`, `--theme-map-chip-*`  | Map canvas and map chips            |
| Sheets      | `--theme-sheet-shadow`, `--theme-handle-bg` | Bottom sheets and draggable handles |
| Shell       | `--theme-toggle-*`                          | Theme toggle in app shell           |

### 3.5 Token Rules

- Prefer `--theme-*` variables for surfaces, borders, text, and elevation.
- Use raw brand colors directly only for deliberate emphasis, not for major section backgrounds.
- Legacy `--color-*` tokens still exist only for gradual migration. Do not use them for new UI.
- Older Home hero token families were removed from the active system. Do not reintroduce screen-specific color token clusters when shared surface tokens are sufficient.

---

## 4. Typography System

### Font Stack

| Role    | Font Family      | Weights       | Token            |
| ------- | ---------------- | ------------- | ---------------- |
| Display | Playfair Display | 700           | `--font-display` |
| Body    | Inter            | 400, 500, 600 | `--font-body`    |
| Hebrew  | Inter            | 400, 500, 600 | `--font-hebrew`  |
| Mono    | JetBrains Mono   | 400           | `--font-mono`    |

### Current Product Scale

| Role          | Typical Size                              | Usage                                         |
| ------------- | ----------------------------------------- | --------------------------------------------- |
| Screen title  | 30-32px Playfair                          | Home, Profile, Manage, primary screen headers |
| Section title | 20-22px Playfair                          | Card titles, grouped sections                 |
| Card title    | 16-17px Inter/Playfair depending emphasis | Rows and compact cards                        |
| Body          | 13-14px Inter                             | Supporting descriptions                       |
| Meta          | 11.5-13px Inter                           | Secondary labels, helper text, chips          |
| Control label | 12-14px Inter 600                         | Buttons, select labels, small actions         |

**Hebrew note:** Inter remains the default Hebrew-capable family. Use proper line-height and avoid overly tight spacing for mixed English/Hebrew content.

---

## 5. Layout And Component Structure

### 5.1 Core Surface Hierarchy

| Layer               | Current Shape                                                                 | Usage                                              |
| ------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| Screen shell        | Full-height warm background, 24px side padding, reserved bottom space for nav | All major screens                                  |
| Section card        | 18px radius, 14-18px padding, subtle border, very light shadow                | Home, Profile, Manage sections                     |
| Accent-outline card | Same as section card but with purple-tinted border                            | Important grouped content without heavy fill       |
| Inner panel         | 14px radius, 12-14px padding, background `--theme-bg-main`                    | Rows inside cards, member rows, modal sub-sections |
| Utility control     | 38-42px tall, 10px radius                                                     | Edit, refresh, filter, compact actions             |
| Primary CTA         | 42-52px tall, 10-14px radius                                                  | Confirm, continue, message, primary actions        |
| Modal/sheet         | `--theme-card-bg`, `--theme-card-border`, `--theme-card-shadow`               | Popups and bottom sheets                           |

### 5.2 Current Screen Composition Pattern

The current product structure follows this composition model:

1. **Screen shell**
2. **Title header**
3. **Stack of compact neutral cards**
4. **Optional inner panels inside those cards**
5. **Primary/secondary actions**
6. **Overlay components** when needed: popup, toast, bottom sheet
7. **Fixed bottom nav**

### 5.3 Current Feature Ownership

| Area       | Main Files                                                                                                                                 | Notes                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| App shell  | `apps/miniapp/src/App.tsx`, `apps/miniapp/src/styles/index.css`, `apps/miniapp/src/app/theme.ts`                                           | Theme mode, shell, shared tokens                           |
| Onboarding | `OnboardingCarouselScreen.tsx`, `OnboardingStateScreen.tsx`, `OnboardingQuestionsScreen.tsx`, `OnboardingDataScreen.tsx`, `CitySearch.tsx` | Shared onboarding surface pattern                          |
| Home       | `HomeScreen.tsx`, `components/HomePopups.tsx`, `components/JoinRequestToast.tsx`                                                           | Neutral compact cards, popup, toast                        |
| Profile    | `ProfileScreen.tsx`                                                                                                                        | Neutral card stack for profile sections and local controls |
| Manage     | `ManageQahalScreen.tsx`                                                                                                                    | Neutral management cards with inner panels                 |
| Map        | `MapScreen.tsx`, `MapView.tsx`, `components/MapPersonSheet.tsx`, map subcomponents                                                         | Map canvas plus neutral sheet surfaces                     |

---

## 6. Current Component Guidelines

### Buttons

- Use brand purple for primary actions.
- Use transparent or warm-neutral backgrounds for secondary actions.
- Compact utility actions may be 38-42px tall.
- Full-width primary actions may be 48-52px tall.
- Avoid oversized glossy buttons or multi-layer gradient buttons.

### Cards

- Default major sections should use warm-neutral surfaces, not solid purple/navy fills.
- Distinguish cards with border color, subtle tint, spacing, or icon treatment before using heavy fill.
- Keep shadows light. The border should do most of the separation work.
- Inner rows should typically use `--theme-bg-main` or `--theme-surface-warm-muted`.

### Popups, Toasts, And Sheets

- Popups use `--theme-card-bg` with subtle border and shared shadow.
- Toasts may still use brand purple when the feedback should be immediate and clearly affirmative.
- Bottom sheets use the shared sheet shadow and handle tokens.

### Navigation

- Bottom nav is a neutral bar with an accent active pill.
- The active item may use filled brand purple; inactive items stay outline/text only.
- Safe area padding remains required.

---

## 7. Implementation Rules

### 7.1 Source Of Truth Order

When the visual system changes, update in this order:

1. `apps/miniapp/src/styles/index.css`
2. `apps/miniapp/src/App.tsx` if shell or nav surfaces change
3. The owning feature screen or overlay component using inline style values
4. This document

### 7.2 Styling Rules

- Prefer shared theme variables over raw hex values.
- Add both light and dark values for any new shared token.
- Keep Tailwind focused on structure and layout; let CSS variables drive theming.
- Do not add screen-specific token families unless a pattern is genuinely shared.
- Avoid gradients, radial overlays, frosted layers, and decorative blurs on primary product surfaces.

### 7.3 Active Tailwind Role

Tailwind is currently used mainly for:

- layout
- spacing
- sizing
- flex/grid behavior
- positioning

The visual theme itself is primarily driven by CSS variables and inline token-based styles.

---

## 8. Current Source Of Truth Files

| File Path                                                        | Responsibility                         |
| ---------------------------------------------------------------- | -------------------------------------- |
| `apps/miniapp/src/styles/index.css`                              | Active theme token layer               |
| `apps/miniapp/src/App.tsx`                                       | App shell, theme toggle, root surfaces |
| `apps/miniapp/src/features/onboarding/*.tsx`                     | Onboarding visual pattern              |
| `apps/miniapp/src/features/home/HomeScreen.tsx`                  | Home section layout and card pattern   |
| `apps/miniapp/src/features/home/components/HomePopups.tsx`       | Popup surface pattern                  |
| `apps/miniapp/src/features/home/components/JoinRequestToast.tsx` | Toast accent pattern                   |
| `apps/miniapp/src/features/profile/ProfileScreen.tsx`            | Profile compact neutral card pattern   |
| `apps/miniapp/src/features/manage/ManageQahalScreen.tsx`         | Manage compact neutral card pattern    |
| `apps/miniapp/src/features/map/components/MapPersonSheet.tsx`    | Shared sheet pattern                   |

---

**This document is the single source of truth for current visual and interaction design decisions in the Qahal miniapp. If implementation and this file disagree, update this file immediately after resolving the code path.**
