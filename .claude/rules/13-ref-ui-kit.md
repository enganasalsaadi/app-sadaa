---
paths:
  - "src/**/*.tsx"
  - "src/shared/**"
---
# 13 — Ref: UI Kit (`@/shared/ui`) — reuse when it fits

Check DevShowcase (`app/screens/DevShowcaseScreen`, `__DEV__` row in Profile; 1 screen/category from `registry/showcaseRegistry.ts`, archetypes in `layoutVariants/`) before building UI. Every kit export demoed there (rule 10).

Catalog of existing parts. Reuse for behaviour, never as look of new design (rule 09 §0).

## Primitives & Layout

- `Box Text Pressable Card Image`. `Pressable scaleOnPress` passes `style` flex / alignSelf / position / offsets / zIndex to scale wrapper (so `CustomButton style={{flex: 1}}` truly splits row). `Card` = borderless + soft navy `card` shadow + press spring by default (`border.card` hairline in dark).
- `Layout`:
  - `mode` scroll|static · `surface` · `padding` · `header` config → `ScreenHeader`
  - `headerBehavior` fixed|hideOnScroll|collapse|overlay
  - `hero`: edge-to-edge; header fades in once hero scrolled away. `heroBackdrop="brand"` = navy gradient behind transparent hero, stretches on pull-down, body slides over as rounded sheet. `"brandGlow"` = darker live gradient + drifting `GlowOrbs`. Sole tab-root hero (creator Home, Wallet, Profile; pair w/ `parallax`, hero `pb="4xl"` clears sheet). `"brandOpen"` = live gradient, hero draws own edge (media kit); keep hero `static`. `heroBehavior="parallax"`.
  - `sticky` (filter row pinned under header)
  - `footer={<LayoutFooter primary secondary tertiary top />}` (`secondary.variant` ghost|secondary; `tertiary` ghost), pinned above keyboard; `footerBehavior` divider|elevate|reveal|docked (reveal = floats over body, hidden until hero partly scrolled away; docked = always raised surface + hairline + lift, insets included)
  - `overlay` (FAB slot). Behaviours scroll-mode only. Safe-area edges + status bar auto (inside `HeroSheet` too). Logic `resolveLayout`, scroll motion `useHeaderMotion`.
- `ScreenHeader`: `variant` solid|brand|transparent · `backIcon` back|close (✕ on flow's first step) · `actions` ≤ 2 icons w/ `badge` (`glass` = glass tile on navy bars) · `leading` = start-aligned content instead of centred title (bar aligned to `xl` gutter, fades in w/ overlay header; Home/Profile pinned identity).

## Controls & building blocks

- `CustomButton` (`variant` incl. `onBrand` + `glass` for navy) · `CustomInput` (`suffix`, `showCount` = text area) · `PhoneInput` (libphonenumber, E.164) · `BottomSheet` (`onDismissed`: fires once gone; iOS: open native picker only then; `header` / `footer` = pinned white slots w/ hairlines around scrolling middle, pair w/ `bg={colors.layout.base}` for sunken body) · `SheetFrame` (**the default content sheet**: white header `title`/`body`/`action`/`headerAccessory` (chip `Rail bleed`), page-color scrolling body `gap`, white padded `footer` CTA, optional for pick-and-close pickers; build any new sheet on it, `BottomSheet` raw only for action menus / compact confirms) · `SelectionModal` · `DateRangePicker` (`range="past"` for statements) · `GalleryModal`.
- `SuperList` (`emptyDescription` / `emptyAction` for "Clear filters") · `MainTabBar`.
- `IconButton` `FAB` `SegmentedControl` (`scrollable`; option `badge` = amber count of what waits) `Tabs` · `Chip` (`variant` outline|tile|solid, tile = discovery shortcut pill, solid = one view of a list: chosen filled, rest bare; `count` quiet number, `attention` amber dot; `icon`, `dropdown`, `onClear` = filter chip) · `ChipRow` (filter row pinned under header, above `SuperList`) · `Rail` (all other sideways rows: `shadow` token → room inside + same amount off margins, so item shadows not clipped, layout no shift; `bleed` undoes parent `xl` gutter; `snapInterval`; `py` = layout room for leaning items). Never hand-roll horizontal `ScrollView` (clips shadows; default `flexGrow:1` floats it mid-screen). `FlatList`/`SuperList` rail → same math via `shadowBleed(shadows.x)` (`@/core/theme`) · `Switch` `Checkbox` `Radio`/`RadioGroup` `SearchBar`.
- `ListRow`/`ListGroup` (settings/menu rows; `selected` = single-choice row w/ radio mark) · `SectionHeader` `Divider` `KeyValueRow` (summaries, money emphasis).
- `Badge` (tone danger|warning|interactive|neutral) `StatusPill` (any `HueTone` via `resolveHue` from `@/core/theme`) `Tag` `ProgressBar` (`surface="brand"` on navy) `Accordion` `AvatarGroup`.
- `Notice` (in-flow banner) · `EmptyState`/`ErrorState` (full-area; SuperList uses them) · `InlineError`.

## Navy surfaces & live parts (rule 09 §3.1)

- `HeroBackdrop` + `GlassCard` (Skia, for navy backdrops; theme via `useGlassCardStyle()` outside `<Canvas>`).
- `GradientSurface`: `brand` navy hero gradient, no glass · `live` darker dashboard gradient · `premium` soft gold highlight card.
- `GlowOrbs` (Skia: 3 diffuse teal-family lights drift slowly, no outlines; fills parent; 1 frame clock redraws at 20 fps (drift few px/s, looks same, ⅓ GPU); `paused` freezes. `LayoutHeroBackdrop` pauses when screen blurred or hero scrolled away, since tab roots stay mounted + every redraw repaints canvas).
- `LiveDot` (pulsing dot, rests when screen blurred via `useScreenFocused`) · `LiveIsland` (blocker pill) · `AnimatedNumber` (digits roll once) · `MoneyFlow` (mint dots: money in transit) · `SmartBorder` (teal sheen, system suggestions only) · `StaggerIn` (sections rise once).

## Money & Sada parts

- `MoneyText` = only way to show amount (rule 09b): `size` sm|md|title|lg|hero|display (`display` 58 = wallet balance) · `animated` · `tone` money (money flow) | `onBrand` · `showSign` · `estimate` · `notation="compact"` (stats/tiles only) · `precision` · `rounding` (`down` for balances) · `currencyDisplay` · `splitFraction` · `hidden` · `strikethrough`.
- `AmountInput` (`Money` minor units, Arabic digits OK; helpers `parseAmountText`/`toAmountText` in `@/core/money`).
- `StatTile` · `Sparkline` (no axis, time flips in RTL; `tone` interactive|money) · `BarChart` (monthly bars, highlighted bar + value bubble, grow once; `tone` money|neutral).
- `Timeline` (`variant` vertical: stages + captions · `track`: horizontal stage track, draws once; current stage pulses) · `Countdown` (deadline pill on `useCountdown`).
- `MediaTile` (photo/video, upload + review states) · `RatingStars` (display or 1–5 input) · `FilePickerCard uploadProgress` + `useFilePicker` (files or photos, MIME + size checks, `pickFrom(source)`).
- `TierBadge` (`surface="media"` = frosted pill over photos) / `TierInfoSheet` (rule 08) · `BrandLogo` (logo only via this) · `SocialPlatformIcon` · `Skeleton`.
- `formatMoney(m, lang, options)` / `formatMoneyParts` (same options as `MoneyText`; SYP minor units = 0, own ل.س / SYP symbol).

## Screen chrome & multi-step

- `HeroSheet` (navy hero + rounded surface sheet) for auth/entry forms; Login = reference.
- Hero compact layout via `useHeroCompact()` (keyboard open or window height < `COMPACT_HERO_MAX_HEIGHT` 700); `WizardShell` + Login already use it.
- `WizardShell` (on `HeroSheet`: step pill + progress + title, optional `action` glass icon button every step; wrap native-stack so only sheet slides) + `useWizardHeader({step,title,subtitle,onBack})` per screen. Steps typed `WizardStepDef`. Refs: brand wizard (`constants/brandOnboarding.ts`), forgot-password (`PasswordResetNavigator`, `constants/passwordReset.ts`).
- `StepProgress` `FormSection` `ConfirmSheet` `OtpInput` (ref `shake()`).

## Lists (SuperList = FlashList v2)

No `estimatedItemSize`; `overrideItemLayout` supports `span` only; `key={layout}` when columns change; `scrollRestorationKey` persists offset in MMKV; inputs in `ListHeaderComponent` → pass `keyboardShouldPersistTaps="handled"` / `keyboardDismissMode="on-drag"` (optional props); w/ `Layout mode="static"` pass `useJSScrollHandler()` (`@/shared/context/ScrollContext`) to `onScroll` (`useScrollHandler()` = Animated scroll views only). Ref: `LayoutListStatesScreen`.

## Bottom bar

`MainTabBar` (both roles): docked in-flow, never over content, no hide-on-scroll; teal squircle on active icon + elastic rail (`TabRail`: leading edge darts, trailing follows; finger-down pre-stretch). `visible` from `isOnTabRoot` in `MainTabs` (inner screens hide it automatically, no per-screen hook); tab screens get bottom inset 0 while docked, so tab roots need no extra bottom padding. Hidden while Android keyboard is up.

## Theme

`useTheme()`, `useStyles()`, `useResponsiveValue()`; `moderateScale/fontScale` only for sizes w/o tokens. Font Tajawal. Colors: hue groups `{main,text,soft}` (`brand interactive money premium status.*`): `.text` text, `.main` fills/icons. Spacing `xs sm md lg xl 2xl … 7xl`. Typography `h1–h4 title body bodyMedium bodySmall caption button buttonSmall overline tabLabel tabLabelActive label`. Motion timings `motion` (`@/core/theme`). SVG via `react-native-svg-transformer` (import `.svg` as components).
- Motion tokens (`core/theme/tokens/motion`): `duration.unlock` / `unlockedHold` (a lock opening, the green «unlocked» hold) and `loop.parcelPulse` / `parcelTravel` (the return route's waiting pulse and travelling parcel). Loops always `useScreenFocused` + `useReducedMotion`.

## Not verified on device

- CustomInput/PhoneInput still hand-pick `row-reverse`/`textAlign` by `isRTL` (post Navy Trust migration).
- v4 visuals (radii, borderless cards, hero lights, tab rail, live parts) checked by typecheck/tests only. Unchecked: Android `card` shadow tint, Skia light cost, reduced motion.