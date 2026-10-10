---
paths:
  - "src/core/theme/tokens/**"
  - "src/assets/images/logo/**"
  - "src/shared/ui/BrandLogo/**"
  - "src/shared/ui/FloatingBottomBar/**"
  - "src/shared/ui/GlassCard/**"
  - "src/shared/ui/GlowOrbs/**"
  - "scripts/**"
  - "docs/brand/**"
  - ".claude/skills/sada-screen/**"
  - "ios/**/Images.xcassets/**"
  - "android/app/src/main/res/**"
---

# 08b — Brand Palette (raw values), Tab Bar, Logo, Assets

Raw values live ONLY in `src/core/theme/tokens/**`. Roles and usage: rule 08.

## Hues (light · dark)

| Token | Light | Dark |
|---|---|---|
| `brand` | `#1C3349` | bg `#0B1622` |
| `interactive` | `#397D8C` · text `#347482` · soft `#E3F0F2` | `#6FC0CF` · CTA `#5FAFBF` (on-CTA `#06121C`) · soft `#16303A` |
| `money` | `#12B886` · text `#087F5B` · soft `#E3F8F0` | `#3DDBA5` · soft `#0F2E2A` |
| `premium` | fill `#D9B46A` · text `#8A6A24` · soft `#FBF3E2` | `#E6C47E` (fine as text) · soft `#2E2716` |

Text shades on white (≥ 4.5:1): `interactive.text #347482` 5.29 · `money.text #087F5B` 5.0 · `premium.text #8A6A24` 5.04 · `success.text #067647` 5.69 · `warning.text #B54708` 5.43 · `danger.text #B42318` 6.57 · `info.text #175CD3` 5.99 · `neutral.text #667085` 4.97. Mustard `#D9B46A` on white ~2:1.

## Neutrals

| Token | Light | Dark |
|---|---|---|
| `layout.base` | `#F5F7F9` | `#0B1622` |
| surface | `#FFFFFF` | `#122131` |
| surface2 (elevated/skeleton) | `#EDF1F4` | `#182B3D` |
| border | `#DCE3EA` | `#22384C` |
| border strong | `#C3CDD7` | `#30495F` |
| text primary / secondary / tertiary | `#0F1D2B` / `#475869` / `#667085` (was `#8394A5`, failed AA) | `#EAF0F5` / `#A5B5C4` / `#8394A5` |
| `border.card` | `transparent` | `#1B2B3C` |
| `text.onAccent` | `#FFFFFF` | `#06121C` |
| `text.onBrand` | `#FFFFFF` | `#F5F7F9` |
| `text.onBrandMuted` | `#C9D6E0` | — |
| `brand.text` | `#1C3349` | `#EAF0F5` |
| brand-soft | `#E6ECF2` | `#16303A` |
| `mediaBackdrop` | `#000000` | `#000000` |
| `gradients.hero` | `#1C3349 → #27506A → #397D8C` | `#1C3349 → #1F4A5C → #2D6B78` |
| `gradients.heroLive` | `#1C3349 → #22425C → #27506A → #2F6577` | `#0B1622 → #1C3349 → #1F4A5C → #2D6B78` |
| `gradients.onboarding` | = hero | `#0B1622 → #1C3349 → #1F4A5C → #2D6B78` |
| `gradients.premium` | `#FDF8EE → #F6E6C3` | `#2E2716 → #3B321C` |

## Status (light main · text · soft | dark main = text · soft)

- success `#12A150` · `#067647` · `#E7F6EC` | `#47CD89` · `#0F2A1D`
- warning `#DC6803` · `#B54708` · `#FEF0E6` | `#FDB022` · `#2E2210`
- danger `#D92D20` · `#B42318` · `#FDECEA` | `#F97066` · `#2E1719`
- info `#1570EF` · `#175CD3` · `#E8F1FE` | `#6CA6FF` · `#12233D`
- neutral `#667085` · `#667085` · `#F2F4F7` | `#98A2B3` · `#1E2A36`

## Glass (`colors.glass`, light / dark)

fill `rgba(255,255,255,.15)` / `.07` · border `.28` / `.18` · badge `.18` / `.10` · progress track `.22` / `.14`, fill `#F5F7F9` / `#6FC0CF` · glowPrimary + glowSecondary `#397D8C` + `#6FC0CF` / `#2D6B78` + `#397D8C` · glowHighlight `#F5F7F9` / `#6FC0CF` · icons: interactive `#6FC0CF`, money `#3DDBA5`. Hero lights: glowSecondary 30% · glowPrimary 55% · glowHighlight 7%. Card shadow: `#1C3349`, y 8, blur 16, 9%.

## Bottom tab bar (floating navy liquid glass; white glass rejected — blended into white screens)

- Floating capsule, `lg` side margins, corner 26, navy both modes (`navigation.tabBar.glassTint` = `#1C3349` at 96% light / 92% dark).
- Skia drop shadow `glassShadow` drawn outside capsule only (view `shadow` lost on Android without background) + hairline `glassBorder`.
- Hides on scroll, returns on scroll up / near top. Removed on inner screens via `useHideBottomBar()`. Content scrolls behind.
- Native blur iOS only (`@react-native-community/blur` thin dark material; Android blur ignores rounded clip → grey rectangle) + tint + Skia specular rim (`glassRim` → `glassRimFaint`).
- Every tab: icon (`icon.md`) + `caption` label. Active = teal `tabBar.active` `#6FC0CF` on a **liquid lens** (white-glass capsule `tabBar.lens` → `lensFaint`, top highlight `glassRim`, springs to active tab). Inactive `tabBar.inactive` `#A5B5C4`. Both ≥ 4.5:1 on tint. No box/border.

## Logo (Concept C — Concentric Echo, geometry v4, FINAL — changes need explicit user approval)

- Symbol viewBox `0 0 100 100`, arcs ±50° per side, round caps, arc group rotated **−20°** around the dot (dot not rotated). Fade A: inner → outer `stroke-opacity` 50/75/100% (40% rejected). Tiers: lg radii `19/30/41` stroke 6 dot 9 · md `22/38` stroke 8 dot 10 (75/100) · sm `30` stroke 11 dot 12 (100).
- Source of truth: `python3 scripts/logo/gen.py` (never hand-edit SVGs). Glyphs `scripts/logo/wordmark-glyphs.svg`. Wordmark = Tajawal ExtraBold outlines (HarfBuzz), mint dot r=5 at ص counter centre.
- **Logo palette, 5 colors only:** Navy `#1C3349`, Teal `#397D8C`, Mint `#12B886`, BG `#F5F7F9` (Mustard `#D9B46A` not used in logo). No dark tints, no `#FFF`, no new hexes; gradients = `stroke-opacity` only. Limit applies to logo assets only.
- Meaning: left arcs = brand reach (navy), right arcs = creator resonance & trust (teal), dot = escrow/money (mint).
- On light: left navy, right teal, dot mint. On navy: navy arcs → BG `#F5F7F9`, dot mint.
- **App icon (locked, option A):** navy bg, left arcs BG, right arcs teal, mint dot, fade A (teal-on-navy ≈ 2.8:1 accepted; don't "fix" to all-BG). **Dark lockup** right arcs stay teal — must match icon.
- Wordmark «صدى» Tajawal ExtraBold, navy on light / BG on navy, mint dot inside ص loop. English "Sada": glyphs `scripts/logo/wordmark-glyphs-en.svg`, mint dot r=5 inside bowl of `d` (rejected: first-`a` counter, end period). Same colours, symbol, −20° tilt (+20° rejected). EN lockup: symbol left, height 1.2× cap height, gap 0.23× cap height, centred on cap height. Never combine «صدى» + "Sada" in one lockup.
- AR lockup: symbol on reading-start side (right), height 1.2× font-size, gap 0.23× font-size, centred on ص body.
- Symbol tiers: ≥ 48px 3 arcs · 24–32px 2 arcs · 16px 1 arc. Mono (print): single color, no opacity.
- Clear space ¼ symbol height each side; lockup min 24px screen / 8mm print; symbol min 16px (`symbol-sm`).
- Files `src/assets/images/logo/`: `logo-full-{light,dark}.svg`, `logo-full-en-{light,dark}.svg`, `wordmark-en-{light,dark}.svg`, `symbol-{lg,md,sm}.svg`, `symbol-{lg,md,sm}-dark.svg` (on navy), `wordmark-{light,dark}.svg`, `symbol-mono.svg` (`currentColor`), `app-icon.svg` (1024 full-bleed navy; OS masks corners). `BrandLogo/logoAspect.ts` generated by `gen.py` (never edit). `BrandLogo` picks artwork by mode, tier by height, «صدى»/"Sada" by language.
- **Native bootsplash:** symbol only (`symbol-lg-dark`, 112pt/dp) on navy, no wordmark (native can't follow in-app language).
- Native assets (iOS AppIcon, Android mipmaps + adaptive foreground, Play icon, bootsplash, Android notification icon): `python3 scripts/logo/native.py` after any logo change; never hand-edit PNGs.

## Brand book

`docs/brand/sada-brand-book.html` (AR/EN toggle) + `sada-brand-book-ar.pdf` / `-en.pdf`, generated by `python3 scripts/brand/build.py` from `scripts/brand/template.html`; logos + Tajawal inlined at build (never paste logo SVG into template). Any change to rule 08/08b (colors, type, radii, logo) → update template + rebuild in same change.
