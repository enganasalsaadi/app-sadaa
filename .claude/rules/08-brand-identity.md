---
paths:
  - "src/**/*.tsx"
  - "src/shared/ui/**"
  - "src/core/theme/**"
---
# 08 — Brand Identity (Navy Trust)

**Rule locks colors + type only.** Shape, depth, glass, motion, layout = creative choices (rule 09 §0).

Sada feels **trusted** on money/deal screens, **social, alive** on discovery screens (Brand Home, Explore, creator profiles): people + content lead. Same colors/type both. Raw hexes, contrast ratios, logo geometry, tab bar spec, native assets: **08b** (loads w/ theme tokens / logo / native files). Components consume semantic tokens only (rule 02).

## Color roles — one job each

| Role | Token | Meaning | Never |
|---|---|---|---|
| Navy | `brand` | identity, headers, hero, primary CTA (light) | CTA in dark (invisible; navy = dark canvas) |
| Teal | `interactive` | links, focus, selected, secondary actions, CTA in dark | money, status |
| Mint | `money` | money ONLY: balances, amounts, escrow released, earnings | success status, generic buttons, decoration |
| Mustard | `premium` | verified/top creators, badges, rankings, paid tiers/premium features | warning, body text, large areas |

- **Mustard text:** `premium.main` = fill/icon/border only on light (~2:1). Mustard text on light → `premium.text`.
- **Mint = money.** Green success pill → `status.success`, not `money`.
- **Dark CTA switch:** primary = navy light / teal dark via `colors.button.primary`. Never branch on `isDark`.
- Per-screen proportion: neutrals ~68% · navy ~16% · teal ~9% · mint ~5% · mustard ~2%.
- **Text shades (WCAG, non-negotiable):** each hue `main` (fill/icon/border) + darker `text` **exclusively** for text on light (≥ 4.5:1). Never small text in `main` on light. Dark: `text` = `main`.
- Energy from content, light, depth, motion — not extra hues. Gradients/tints/translucency from palette hues free (add tokens). No new hues w/o updating rule.
- **Rejected colors (v3 "Echo"):** purple/dusk AI hue, per-niche tints, pearl bg. Never reintroduce unless user asks.

## Neutral & special tokens

`layout.base` (bg) · `surface.main` · `surface.elevated` (surface2, skeleton) · `border.default` · `border.strong` (dividers on surface2, switch track off) · `border.card` (transparent light; hairline in dark replacing card shadow) · `text.primary/secondary/tertiary` · `text.onAccent` (on teal/danger fill) · `text.onBrand` / `text.onBrandMuted` (on navy) · `brand.text` (navy-toned text; light in dark) · `brand.soft` · `mediaBackdrop` · `gradients.hero` (HeroSheet, wizards, highlight cards) · `gradients.heroLive` (dashboard tab roots under hero lights; ends darker) · `gradients.onboarding` · `gradients.premium`.

## Status colors

`status.success|warning|danger|info|neutral`, each `{ main, text, soft }`; pill/badge/toast = `soft` bg + `text` label + `main` icon/dot. Warning orange — must not resemble mustard.

Deal status → tone (map in `domains/marketplace/constants/`, `Record<DealStatus, …>`): `pending_approval`/`under_review` → info · `awaiting_payment` → warning · `in_progress`/`ready_to_publish`/`published` → interactive · `completed` → success · `disputed` → danger · `cancelled`/`refunded` → neutral. Status never color-only (text + icon where space allows).

## Mode

Default follow system (`useColorScheme`); user override light|dark|system in MMKV via `StorageKeys`. Light + dark designed together; every new color token needs both. Contrast: text ≥ 4.5:1, large text/icons ≥ 3:1, both modes.

## Typography

- **Tajawal** (Arabic + Latin). Weights `light regular medium bold extraBold` (`FontWeightToken` → PostScript names). No SemiBold: 600 → Bold 700.
- `<Text variant>` only, never `fontFamily`/`fontWeight`.
- Money/prices/timers: tabular figures (in typography token).
- **Western digits** both langs (`1,250`, never `١٬٢٥٠`); formatters force `latn`.
- Tagline locked: «ثقة في كل صفقة» / "Trust in every deal". Verbatim.

## Shape, depth, glass, motion

All free. Add tokens (radii, shadows, gradients/alphas of palette hues, motion curves) as concept needs. Two tech facts only:
- Skia, not `BlurView`, under animated transforms (native blur = jank); Skia can't read context → read theme outside `<Canvas>`.
- Text on navy: `text.onBrand` / `text.onBrandMuted`; primary navy CTA invisible on navy — pick contrasting button (contrast, not style).

## Logo in app

- Only via `<BrandLogo variant="full|wordmark|symbol" height surface="auto|brand" />`. Never import logo SVGs in domains. Logo artwork locked (08b).

## Follower tier badges

- Tier (`NANO/MICRO/MID_TIER/MACRO/MEGA`) mapping in `FOLLOWER_TIER_STYLE` (`@/core/config`) + `TierBadge`; new tier looks read from there. Name from `followerTier.*` i18n, never server `label_ar/en`.

## Currency

`DEFAULT_CURRENCY = 'USD'` (`core/config/app.ts`). Money `{ amount: minorUnits, currency }` (rule 06). Display via `<MoneyText>` or `formatMoney` (`$1,250.00` / AR `1,250.00 $`, SYP whole `6,402,500 ل.س`). Sizes (tabular): `amountSmall` 14 · `amount` 16 · `amountTitle` 22 (card totals, pinned header balance) · `amountLarge` 32 · `amountHero` 44 · `amountDisplay` 58; add sizes as concept needs. Money color only for money flow (balance, earning, payout).