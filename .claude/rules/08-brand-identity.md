# 08 — Brand Identity (Navy Trust)

Accepted 2026-09-24. Theme name: **Navy Trust**. Sada sells *trust in escrowed money* first, social energy second. Every visual choice serves that.

Raw values below live ONLY in `src/core/theme/tokens/**` (rule 02). Components consume semantic tokens, never these hexes.

## Color roles — one job each

| Role | Meaning | Light | Dark | Never use for |
|---|---|---|---|---|
| **Navy** (`brand`) | identity, headers, hero, primary CTA (light) | `#1C3349` | bg `#0B1622` (navy becomes the canvas) | CTA in dark mode (invisible) |
| **Teal** (`interactive`) | links, focus, selected, secondary actions, CTA in dark | `#397D8C` · text `#347482` · soft `#E3F0F2` | `#6FC0CF` · CTA `#5FAFBF` (on-CTA `#06121C`) · soft `#16303A` | money, status |
| **Mint** (`money`) | money ONLY: balances, amounts, escrow released, earnings | `#12B886` · text `#087F5B` · soft `#E3F8F0` | `#3DDBA5` · soft `#0F2E2A` | success status, generic buttons, decoration |
| **Mustard** (`premium`) | distinction: verified/top creators, badges, rankings, **paid tiers / premium features** | fill `#D9B46A` · text `#8A6A24` · soft `#FBF3E2` | `#E6C47E` · soft `#2E2716` | warning, body text, large areas |

Rules:
- **Mustard text contrast:** `#D9B46A` is ~2:1 on white → fill / icon / border only. Any mustard-toned text on light surfaces uses `premium.text` `#8A6A24`. In dark, `#E6C47E` is fine as text.
- **Mint is money.** A green "success" pill uses `status.success`, not `money`.
- **Dark-mode CTA switch:** primary button = navy in light, teal `#5FAFBF` in dark. Resolve via `colors.button.primary` — never branch on `isDark` in components.
- **One primary CTA per screen** (navy/teal). Everything else secondary/ghost.
- Proportion per screen (approved 2026-09-24): neutrals ~68% · navy ~16% · teal ~9% · mint ~5% · mustard ~2%.
- **Text shades (approved 2026-09-24, WCAG non-negotiable):** every hue has a `main` (fill/icon/border) and a darker `text` shade used **exclusively** for text on light surfaces (≥ 4.5:1 on white and bg). Never put small text in a `main` shade on light. Dark mode: `text` = `main` (all pass on dark surfaces).
  `interactive.text #347482` (5.29) · `money.text #087F5B` (5.0) · `premium.text #8A6A24` (5.04) · `success.text #067647` (5.69) · `warning.text #B54708` (5.43) · `danger.text #B42318` (6.57) · `info.text #175CD3` (5.99) · `neutral.text #667085` (4.97).
- Energy comes from **content** (large creator/campaign imagery), not extra colors. Do not add new hues without updating this rule.

## Neutrals

| Token | Light | Dark |
|---|---|---|
| bg (`layout.base`) | `#F5F7F9` | `#0B1622` |
| surface | `#FFFFFF` | `#122131` |
| surface2 (elevated/skeleton) | `#EDF1F4` | `#182B3D` |
| border | `#DCE3EA` | `#22384C` |
| border strong (dividers on surface2, switch track off) | `#C3CDD7` | `#30495F` |
| text primary / secondary / tertiary | `#0F1D2B` / `#475869` / `#8394A5` | `#EAF0F5` / `#A5B5C4` / `#6C8093` |
| `text.onAccent` (on teal / danger fill) | `#FFFFFF` | `#06121C` |
| `text.onBrand` (on navy hero/header) | `#FFFFFF` | `#F5F7F9` |
| `brand.text` (navy-toned text) | `#1C3349` | `#EAF0F5` (navy invisible on dark) |
| brand-soft | `#E6ECF2` | `#16303A` |
| `mediaBackdrop` (full-screen media viewer) | `#000000` | `#000000` |
| hero gradient | `#1C3349 → #27506A → #397D8C` | `#1C3349 → #1F4A5C → #2D6B78` |

## Status colors (constant across themes)

| Status | Light main · text · soft | Dark main (= text) · soft |
|---|---|---|
| success | `#12A150` · `#067647` · `#E7F6EC` | `#47CD89` · `#0F2A1D` |
| **warning** | **`#DC6803`** (orange — must not resemble mustard) · `#B54708` · `#FEF0E6` | `#FDB022` · `#2E2210` |
| danger | `#D92D20` · `#B42318` · `#FDECEA` | `#F97066` · `#2E1719` |
| info | `#1570EF` · `#175CD3` · `#E8F1FE` | `#6CA6FF` · `#12233D` |
| neutral | `#667085` · `#667085` · `#F2F4F7` | `#98A2B3` · `#1E2A36` |

Code shape (`src/core/theme/tokens/colors.ts`): every hue group is `{ main, text, soft }` — `colors.brand`, `colors.interactive`, `colors.money`, `colors.premium`, `colors.status.{success|warning|danger|info|neutral}`. Pill/badge/toast = `soft` bg + `text` label + `main` icon/dot.

Deal status → badge color (map in `domains/marketplace/constants/`, `Record<DealStatus, …>`, rule 06):
`pending_approval`/`under_review` → info · `awaiting_payment` → warning · `in_progress`/`ready_to_publish`/`published` → interactive (teal) · `completed` → success · `disputed` → danger · `cancelled`/`refunded` → neutral.
Status is never conveyed by color alone — pill always has text (+ icon where space allows).

## Mode

- Default: **follow system** (`useColorScheme`). User override (light | dark | system) persisted in MMKV via `StorageKeys`.
- Light and dark are designed together; every new color token needs both values.
- Contrast: text pairs ≥ 4.5:1, large text/icons ≥ 3:1 (WCAG AA), verified in both modes.

## Typography

- Primary font: **Tajawal** (Arabic + Latin). Replaces Almarai.
- Weights shipped: `Light 300 · Regular 400 · Medium 500 · Bold 700 · ExtraBold 800`. Font files `src/assets/fonts/Tajawal-<Weight>.ttf`.
- Font family/weight are typed: `FontWeightToken = 'light' | 'regular' | 'medium' | 'bold' | 'extraBold'` → `Record<FontWeightToken, string>` of PostScript names. Components use `<Text variant>` only, never `fontFamily`/`fontWeight` directly.
- Tajawal has no SemiBold: weight `600` maps to **Bold 700** (approved 2026-09-24).
- Numbers in money/prices/timers use tabular figures (`fontVariant: ['tabular-nums']` inside the typography token).
- **Digits (approved 2026-09-24):** Western digits (`1,250`) in **both** Arabic and English — never Arabic-Indic (`١٬٢٥٠`). Formatters force `numberingSystem: 'latn'` (rule 03).

## Tagline (locked 2026-09-24)

«ثقة في كل صفقة» / "Trust in every deal". Use verbatim; do not paraphrase or translate differently.

## Shape — structured marketplace, not social app

- Radius range **8–12px**. Buttons, inputs, chips-as-fields: `md` (8). Cards, sheets' top corners, modals, hero cards: `lg` (12). Small tags: `sm` (4). Avatars/status pills: `full`.
- `radii.ts` has only `none · sm · md · lg · full` (xs/xl/2xl/3xl removed 2026-09-24). Shadows: only `none · sm · md`.
- Elevation: flat surfaces + 1px `border`; shadows only `sm`/`md` for floating elements (bottom bar, sheets, FAB).

## Logo

Concept **C — Concentric Echo**, geometry v4. **Approved 2026-09-24** (SVG files signed off — logo is final; changes need explicit user approval).

- **Geometry v4 (final):** symbol viewBox `0 0 100 100`, arcs span ±50° per side, round caps, arc group rotated **−20°** around the dot (dot not rotated). **Fade A** = inner faint → outer strong via `stroke-opacity` **50% / 75% / 100%** (40% rejected: teal 40% on BG ≈ 1.7:1). Tiers: lg radii `19/30/41` stroke 6 dot 9 · md `22/38` stroke 8 dot 10 (opacity 75/100) · sm `30` stroke 11 dot 12 (100).
- **Source of truth:** SVGs are generated by `python3 scripts/logo/gen.py`, never hand-edited (change the script, re-run). Glyph source `scripts/logo/wordmark-glyphs.svg`. Wordmark = Tajawal ExtraBold glyph outlines (HarfBuzz-shaped, no font dependency); mint dot r=5 at the ص counter centre (font-size 100 units).

- **Logo palette is strict — 5 brand colors only:** Navy `#1C3349`, Teal `#397D8C`, Mint `#12B886`, BG `#F5F7F9`, (Mustard `#D9B46A` exists but is **not used** in the logo — premium only). No dark-mode tints, no white `#FFF`, no new hexes in logo assets. Gradients = `stroke-opacity` on the same hex, never a new color.
- **Symbol meaning:** left arcs = brand/ad reach (navy), right arcs = creator resonance & financial trust (teal), center dot = escrow/money (mint).
- **Per background:** on light → left navy, right teal, dot mint. On navy → navy arcs become BG `#F5F7F9`, dot mint.
- **App icon (locked, option A — changed from B 2026-09-24):** same colours as the dark lockup: navy `#1C3349` background, left arcs BG `#F5F7F9`, right arcs teal `#397D8C`, mint dot, fade A. User accepted teal-on-navy ≈ 2.8:1 for brand consistency; do not "fix" to all-BG.
- **Dark lockup (locked):** right arcs stay teal (not BG) — the icon and the dark lockup must always match.
- **Wordmark (locked):** «صدى» Tajawal ExtraBold, navy on light / BG on navy, **mint dot inside the loop of ص**.
- **Responsive symbol tiers:** ≥48px → 3 arcs · 24–32px → 2 arcs · 16px → 1 arc (3 arcs merge at 16px).
- **Mono** (print/stamp/engraving): single color, no opacity.
- **Clear space & minimum size** (approved 2026-09-24): clear space = ¼ symbol height on every side; lockup min 24px tall on screen / 8mm print; symbol min 16px (`symbol-sm`).
- **Lockup:** symbol on the reading-start side (right, RTL), height 1.2× font-size, gap 0.23× font-size, vertically centred on the ص body.
- Files: `src/assets/images/logo/` — `logo-full-light.svg`, `logo-full-dark.svg`, `symbol-{lg,md,sm}.svg`, `symbol-{lg,md,sm}-dark.svg` (on navy), `wordmark-{light,dark}.svg`, `symbol-mono.svg` (`currentColor`, no opacity), `app-icon.svg` (1024 full-bleed navy; OS applies the corner mask). Legacy `images/logo.*` deleted 2026-09-24.
- **In app:** render the logo only via `<BrandLogo variant="full|wordmark|symbol" height surface="auto|brand" />` from `@/shared/ui` (picks light/dark artwork + symbol tier by height). Never import logo SVGs directly in domains.
- **Native assets** (iOS AppIcon, Android mipmaps + adaptive foreground, Play Store icon, bootsplash logo/background, Android notification icon) are generated by `python3 scripts/logo/native.py` from the SVGs above — re-run after any logo change; never hand-edit the PNGs.

**Scope of the 5-color limit:** logo assets only. UI dark-mode tokens (tables above) may use WCAG-compliant tints of the brand hues.

## Brand book

- `docs/brand/sada-brand-book.html` (interactive, AR/EN toggle) + `sada-brand-book-ar.pdf` / `-en.pdf`, generated by `python3 scripts/brand/build.py` from `scripts/brand/template.html`. Logos and Tajawal fonts are inlined from `src/assets/images/logo/` + `scripts/brand/fonts/` at build time — never paste logo SVG into the template.
- Any change to this rule (colors, type, radii, logo) → update the template and rebuild in the same change.

## Currency

- `DEFAULT_CURRENCY = 'USD'` (`core/config/app.ts`). Money is `{ amount: minorUnits, currency }` — `Money`/`CurrencyCode` from `@/core/money` (rule 06); display via `formatMoney` from `@/core/i18n` (`$1,250.00`, narrow symbol, Western digits; rule 03). Money text uses `<Text variant="amount" | "amountLarge">` (tabular). Amounts rendered in `money` color only when they represent money flow (balance, earning, payout).

## Tech debt (tracked)

- `react-native-fast-image` is unmaintained (needs `--legacy-peer-deps` + TS shim). Keep for now; replace with `expo-image` or RN `Image` in a dedicated refactor. All image usage must go through `@/shared/ui` `Image` so the swap touches one file.
