---
paths:
  - "src/**/*.tsx"
  - "src/shared/ui/**"
  - "src/core/theme/**"
---

# 08 — Brand Identity (Navy Trust)

Sada sells **trust** on money and deal screens, **social energy** on discovery screens (Brand Home, Explore, creator profiles): people and their content lead there, money shrinks to one slim card between them. Same colors, type and radii either way. Raw hexes, contrast ratios, logo geometry, tab bar spec, native assets: **08b** (loads with theme tokens / logo / native files). Components consume semantic tokens only (rule 02).

## Color roles — one job each

| Role | Token | Meaning | Never |
|---|---|---|---|
| Navy | `brand` | identity, headers, hero, primary CTA (light) | CTA in dark (invisible; navy = dark canvas) |
| Teal | `interactive` | links, focus, selected, secondary actions, CTA in dark | money, status |
| Mint | `money` | money ONLY: balances, amounts, escrow released, earnings | success status, generic buttons, decoration |
| Mustard | `premium` | verified/top creators, badges, rankings, paid tiers/premium features | warning, body text, large areas |

- **Mustard text:** `premium.main` = fill/icon/border only on light (~2:1). Mustard-toned text on light → `premium.text`.
- **Mint is money.** Green success pill → `status.success`, not `money`.
- **Dark CTA switch:** primary = navy light / teal dark via `colors.button.primary`. Never branch on `isDark`.
- **One primary CTA per screen.** Rest secondary/ghost.
- Proportion per screen: neutrals ~68% · navy ~16% · teal ~9% · mint ~5% · mustard ~2%.
- **Text shades (WCAG, non-negotiable):** every hue `main` (fill/icon/border) + darker `text` used **exclusively** for text on light (≥ 4.5:1). Never small text in `main` on light. Dark: `text` = `main`.
- Energy from content (imagery), light and motion (rule 09 §3.1), not extra colors. No new hues without updating this rule.
- **Rejected (v3 "Echo", read as crowded):** purple/dusk AI hue, per-niche tints, pearl background, logo-derived decoration (watermark arcs, echo gauge, «صداك» score). Never reintroduce unless user asks.

## Neutral & special tokens

`layout.base` (bg) · `surface.main` · `surface.elevated` (surface2, skeleton) · `border.default` · `border.strong` (dividers on surface2, switch track off) · `border.card` (transparent light; hairline in dark replacing card shadow) · `text.primary/secondary/tertiary` · `text.onAccent` (on teal/danger fill) · `text.onBrand` / `text.onBrandMuted` (on navy) · `brand.text` (navy-toned text; light in dark) · `brand.soft` · `mediaBackdrop` · `gradients.hero` (HeroSheet, wizards, highlight cards) · `gradients.heroLive` (dashboard tab roots under hero lights; ends darker) · `gradients.onboarding` · `gradients.premium`.

## Status colors

`status.success|warning|danger|info|neutral`, each `{ main, text, soft }`; pill/badge/toast = `soft` bg + `text` label + `main` icon/dot. Warning is orange — must not resemble mustard.

Deal status → tone (map in `domains/marketplace/constants/`, `Record<DealStatus, …>`): `pending_approval`/`under_review` → info · `awaiting_payment` → warning · `in_progress`/`ready_to_publish`/`published` → interactive · `completed` → success · `disputed` → danger · `cancelled`/`refunded` → neutral. Status never color-only (text + icon where space allows).

## Mode

Default follow system (`useColorScheme`); user override light|dark|system in MMKV via `StorageKeys`. Light + dark designed together; every new color token needs both. Contrast text ≥ 4.5:1, large text/icons ≥ 3:1, both modes.

## Typography

- **Tajawal** (Arabic + Latin). Weights `light regular medium bold extraBold` (`FontWeightToken` → PostScript names). No SemiBold: 600 → Bold 700.
- `<Text variant>` only, never `fontFamily`/`fontWeight`.
- Money/prices/timers: tabular figures (inside typography token).
- **Western digits** in both languages (`1,250`, never `١٬٢٥٠`); formatters force `latn`.
- Tagline locked: «ثقة في كل صفقة» / "Trust in every deal". Verbatim.

## Shape

- Radii: `xs` 4 skeleton lines, checkbox · `sm` 10 tags, small badges on media · `md` 15 buttons, inputs, chips-as-fields (`Chip` default `outline`), 44pt icon tiles, rows inside cards · `lg` 22 cards, glass cards, KPI strip, toasts · `xl` 28 sheet top corners, hero → body seam, modals · `full` avatars, status pills, live island, `Chip variant="tile"`. CTAs stay `md`, never pills.
- **Chip variants:** `outline` (default) = filters/fields in forms and Explore. `tile` = discovery shortcuts (category rows): `interactive.soft` fill, no border, teal icon + label, radius `full`; selected = `button.primary` fill. **One tint for every category** — never a color per niche (rejected v3).
- **Creator media:** creator cards lead with a 4:5 photo (`resizeMode="cover"`, top radius `lg`); no photo → monogram initials on `brand.soft` in `brand.text`. Stats over a photo sit on an `overlay` pill (radius `sm`, `text.onBrand`).
- **Cards have no border.** `Card` = `surface.main` + shadow `card` (soft navy) + 1px `border.card`. `selected` card keeps teal border. Dividers inside cards `border.default`.
- Shadows `none · sm · md · card · lg`, navy-tinted in light: `card` content cards · `sm`/`md` small floating parts (FAB, chips over media) · `lg` sheets + tab bar.

## Glass & navy surfaces

- **Glass only over the navy gradient** (`HeroBackdrop` + `GlassCard`). Never on `layout.base`/surface — use `Card`. Tab bar = navy glass.
- `GlassCard`: radius `lg`, 1px `glass.border`, `glass.fill`, shadow `md` clipped outside. **Skia**, no `BlurView` (native blur under animated transforms = jank). Skia can't read context: `useGlassCardStyle()` outside `<Canvas>`. Icon badge 44×44 radius `md`.
- `colors.glass`: fill, border, badge, progress track/fill, glows (teal family only, no mint), icons on glass (`iconInteractive`, `iconMoney`).
- **Hero lights** (`heroBackdrop="brandGlow"`): `gradients.heroLive` + `GlowOrbs` = three fully diffuse radial lights (glowSecondary top end, glowPrimary bottom start, glowHighlight top start), very slow drift, stop under reduced motion. **Visible circles, rings, arcs in hero banned.**
- `GradientSurface`: `brand` = hero gradient, no glass/glows · `premium` = soft mustard wash + 1px `premium.main` border, highlight cards only; text on it neutral, mustard only in icon / `premium` pill.
- Text on navy: `text.onBrand` (titles) · `text.onBrandMuted` (subtitles, card body; keep off the last teal gradient stop).
- **CTA on navy:** `CustomButton variant="onBrand"` (navy primary invisible there).

## Logo in app

- Only via `<BrandLogo variant="full|wordmark|symbol" height surface="auto|brand" />`. Never import logo SVGs in domains.
- **Allowed:** splash/boot, auth/entry (`HeroSheet`, `WizardShell`), welcome/celebration. **Not allowed:** tab roots, headers, cards, decoration (no echo gauges, watermark arcs, logo-shaped scores).

## Follower tier badges

- Every follower tier (`NANO/MICRO/MID_TIER/MACRO/MEGA`) shown as `TierBadge` (`@/shared/ui`) — never bare text or one-off pill.
- Hex crest; glyph escalates: 1/2/3 chevrons (NANO/MICRO/MID_TIER), star (MACRO), crown (MEGA). Colors from `FOLLOWER_TIER_STYLE` (`@/core/config`): neutral → teal → teal → navy → mustard; navy glyph on mustard fill.
- Tap → `TierInfoSheet` (range + one-line description). `interactive={false}` only inside another pressable row.
- Sizes `xs` (bare icon) · `sm`/`md`/`lg` (icon + short name). Name from `followerTier.*` i18n, never server `label_ar/en`.

## Currency

`DEFAULT_CURRENCY = 'USD'` (`core/config/app.ts`). Money `{ amount: minorUnits, currency }` (rule 06). Display via `<MoneyText>` or `formatMoney` (`$1,250.00` / AR `1,250.00 $`, SYP whole `6,402,500 ل.س`). Sizes (tabular): `amountSmall` 14 · `amount` 16 · `amountTitle` 22 (card totals, pinned header balance) · `amountLarge` 32 · `amountHero` 44 · `amountDisplay` 58 (wallet balance only). Money color only for money flow (balance, earning, payout).
