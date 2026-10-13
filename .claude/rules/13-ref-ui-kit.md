---
paths:
  - "src/**/*.tsx"
  - "src/shared/**"
---

# 13 — Ref: UI Kit (`@/shared/ui`) — reuse when it fits

Check DevShowcase (`app/screens/DevShowcaseScreen`, `__DEV__` row in Profile; one screen per category from `registry/showcaseRegistry.ts`, archetypes in `layoutVariants/`) before building UI. Every kit export demoed there (rule 10).

Catalog of what exists — reuse for behaviour, never as the look of a new design (rule 09 §0).

## Primitives & Layout

- `Box Text Pressable Card Image`. `Card` = borderless + soft navy `card` shadow + press spring by default (`border.card` hairline in dark).
- `Layout`:
  - `mode` scroll|static · `surface` · `padding` · `header` config → `ScreenHeader`
  - `headerBehavior` fixed|hideOnScroll|collapse|overlay
  - `hero`: edge-to-edge; header fades in once hero scrolled away. `heroBackdrop="brand"` = navy gradient behind transparent hero, stretches on pull-down, body slides over as rounded sheet. `"brandGlow"` = darker live gradient + drifting `GlowOrbs` — the one tab-root hero (creator Home, Wallet, Profile; pair with `parallax`, hero `pb="4xl"` clears the sheet). `"brandOpen"` = live gradient, hero draws its own edge (media kit); keep the hero `static`. `heroBehavior="parallax"`.
  - `sticky` (filter row pinned under header)
  - `footer={<LayoutFooter primary secondary tertiary top />}` (`secondary.variant` ghost|secondary; `tertiary` ghost), pinned above keyboard; `footerBehavior` divider|elevate|reveal (reveal = floats over the body, hidden until the hero is partly scrolled away)
  - `overlay` (FAB slot). Behaviours scroll-mode only. Safe-area edges + status bar automatic (inside `HeroSheet` too). Logic `resolveLayout`, scroll motion `useHeaderMotion`.
- `ScreenHeader`: `variant` solid|brand|transparent · `backIcon` back|close (✕ on a flow's first step) · `actions` ≤ 2 icons with `badge` (`glass` = glass tile on navy bars) · `leading` = start-aligned content instead of centred title (bar aligned to `xl` gutter, fades in with overlay header; Home/Profile pinned identity).

## Controls & building blocks

- `CustomButton` (`variant` incl. `onBrand` + `glass` for navy) · `CustomInput` (`suffix`, `showCount` = text area) · `PhoneInput` (libphonenumber, E.164) · `BottomSheet` (`onDismissed`: fires once gone; open native picker only then on iOS) · `SelectionModal` · `DateRangePicker` (`range="past"` for statements) · `GalleryModal`.
- `SuperList` (`emptyDescription` / `emptyAction` for "Clear filters") · `FloatingBottomBar`.
- `IconButton` `FAB` `SegmentedControl` `Tabs` · `Chip` (`variant` outline|tile — tile = discovery shortcut pill; `icon`, `dropdown`, `onClear` = filter chip) · `ChipRow` (filter row pinned under header, above `SuperList`; never hand-roll horizontal `ScrollView` — default `flexGrow:1` floats chips mid-screen) · `Switch` `Checkbox` `Radio`/`RadioGroup` `SearchBar`.
- `ListRow`/`ListGroup` (settings/menu rows; `selected` = single-choice row with radio mark) · `SectionHeader` `Divider` `KeyValueRow` (summaries, money emphasis).
- `Badge` `StatusPill` (any `HueTone` via `resolveHue` from `@/core/theme`) `Tag` `ProgressBar` (`surface="brand"` on navy) `Accordion` `AvatarGroup`.
- `Notice` (in-flow banner) · `EmptyState`/`ErrorState` (full-area; SuperList uses them) · `InlineError`.

## Navy surfaces & live parts (rule 09 §3.1)

- `HeroBackdrop` + `GlassCard` (Skia, built for navy backdrops; theme via `useGlassCardStyle()` outside `<Canvas>`).
- `GradientSurface`: `brand` navy hero gradient, no glass · `live` darker dashboard gradient · `premium` soft gold highlight card.
- `GlowOrbs` (Skia: three diffuse teal-family lights drifting slowly, no outlines; fills parent; `paused` freezes them — `LayoutHeroBackdrop` pauses while the screen is blurred or the hero is scrolled away, since tab roots stay mounted and every frame redraws the canvas).
- `LiveDot` (pulsing dot) · `LiveIsland` (blocker pill) · `AnimatedNumber` (digits roll once) · `MoneyFlow` (mint dots: money on its way) · `SmartBorder` (teal sheen, system suggestions only) · `StaggerIn` (sections rise once).

## Money & Sada parts

- `MoneyText` = only way to show an amount (rule 09b): `size` sm|md|title|lg|hero|display (`display` 58 = wallet balance) · `animated` · `tone` money (money flow) | `onBrand` · `showSign` · `estimate` · `notation="compact"` (stats/tiles only) · `precision` · `rounding` (`down` for balances) · `currencyDisplay` · `splitFraction` · `hidden` · `strikethrough`.
- `AmountInput` (`Money` minor units, Arabic digits accepted; helpers `parseAmountText`/`toAmountText` in `@/core/money`).
- `StatTile` · `Sparkline` (axis-free, time flips in RTL; `tone` interactive|money) · `BarChart` (monthly bars, highlighted bar + value bubble, grow once; `tone` money|neutral).
- `Timeline` (`variant` vertical: stages + captions · `track`: horizontal stage track, draws once; current stage pulses) · `Countdown` (deadline pill on `useCountdown`).
- `MediaTile` (photo/video, upload + review states) · `RatingStars` (display or 1–5 input) · `FilePickerCard uploadProgress` + `useFilePicker` (files or photos, MIME + size checks, `pickFrom(source)`).
- `TierBadge` (`surface="media"` = frosted pill over photos) / `TierInfoSheet` (rule 08) · `BrandLogo` (logo only via this) · `SocialPlatformIcon` · `Skeleton`.
- `formatMoney(m, lang, options)` / `formatMoneyParts` (same options as `MoneyText`; SYP minor units = 0, own ل.س / SYP symbol).

## Screen chrome & multi-step

- `HeroSheet` (navy hero + rounded surface sheet) for auth/entry forms; Login = reference.
- Hero compact layout via `useHeroCompact()` (keyboard open or window height < `COMPACT_HERO_MAX_HEIGHT` 700); `WizardShell` + Login already do.
- `WizardShell` (on `HeroSheet`: step pill + progress + title, optional `action` glass icon button every step; wrap a native-stack so only the sheet slides) + `useWizardHeader({step,title,subtitle,onBack})` per screen. Steps typed `WizardStepDef`. References: brand wizard (`constants/brandOnboarding.ts`), forgot-password (`PasswordResetNavigator`, `constants/passwordReset.ts`).
- `StepProgress` `FormSection` `ConfirmSheet` `OtpInput` (ref `shake()`).

## Lists (SuperList = FlashList v2)

No `estimatedItemSize`; `overrideItemLayout` supports `span` only; `key={layout}` when columns change; `scrollRestorationKey` persists offset in MMKV; with `Layout mode="static"` pass `useJSScrollHandler()` (`@/shared/context/ScrollContext`) to `onScroll` (`useScrollHandler()` = Animated scroll views only). Reference: `LayoutListStatesScreen`.

## Bottom bar

`FloatingBottomBar variant`: `lens` (creators: icon + label, white-glass lens springs between tabs) · `morph` (brands: icon pill, active tab widens into a teal capsule showing its label). Both hide on scroll; content scrolls behind → tab roots need bottom padding. `useHideBottomBar()` on inner screens.

## Theme

`useTheme()`, `useStyles()`, `useResponsiveValue()`; `moderateScale/fontScale` only for sizes without tokens. Font Tajawal. Colors: hue groups `{main,text,soft}` (`brand interactive money premium status.*`): `.text` text, `.main` fills/icons. Spacing `xs sm md lg xl 2xl … 7xl`. Typography `h1–h4 title body bodyMedium bodySmall caption button buttonSmall overline label`. Motion timings `motion` (`@/core/theme`). SVG via `react-native-svg-transformer` (import `.svg` as components).

## Not verified on device

- CustomInput/PhoneInput still hand-pick `row-reverse`/`textAlign` by `isRTL` (post Navy Trust migration).
- v4 visuals (radii, borderless cards, hero lights, lens, live parts) verified by typecheck/tests only: Android `card` shadow tint, Skia light cost, reduced motion.
