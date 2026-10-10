---
paths:
  - "src/**/*.tsx"
  - "src/**/screens/**"
  - "src/**/navigation/**"
  - ".claude/skills/sada-screen/**"
---

# 09 — Screen Playbook

Every screen looks like one designer, built from the same parts. Procedure: `/sada-screen` skill. This file = non-negotiables.

## 1. Mockup first, code second

- Before any screen code: ASCII mockup (AR/RTL) + archetype + shared components → wait for explicit OK. No exceptions for "small" screens.
- **Visual preview is opt-in only** (auto-publishing a canvas per screen burned tokens). ASCII is the default and enough. Never call the Artifact tool / publish a canvas / run `quickstart` unless the user explicitly asks in that message. When asked: `/sada-screen` Phase 2.

## 2. Archetypes — never invent a layout

| Archetype | Chrome | Reference |
|---|---|---|
| **Auth / entry form** | `HeroSheet` (navy hero: logo/title; surface sheet: form) | `auth/screens/LoginScreen` |
| **Wizard step** | `WizardShell` around a native-stack + `useWizardHeader` per step | `BrandOnboardingNavigator`, `PasswordResetNavigator` |
| **Celebration** | `HeroBackdrop` + one Skia canvas + staggered `FadeInDown` + `CustomButton variant="onBrand"` | `BrandWelcomeScreen` |
| **List** | `Layout mode="static" header` + `SuperList` + skeleton/empty/error | `SuperList` docs |
| **Detail** | `Layout header` + `Card` sections + `footer={<LayoutFooter primary />}` | — |
| **Settings / menu** | `Layout` + `ScreenHeader` + grouped `Card` rows. Profile (tab root) = Dashboard chrome (same hero as Home, glass completion card in KPI slot, `brandGlow`, header `leading` identity) | `identity/screens/ProfileScreen` |
| **Dashboard** (tab root) | see below | `marketplace/screens/CreatorHomeScreen` |
| **Discover home** (brand tab root, marketplace browsing) | see below | `marketplace/screens/BrandHomeScreen` |
| **Money** (wallet home, amount entry, receipt) | Wallet home = Dashboard chrome, hero holds balance. Amount entry = solid `Layout header` + big amount + live quote `Card` + `LayoutFooter primary`. Receipt = `Layout header` + centred amount + `KeyValueRow` cards + secondary footer. Visual rules: **09b** | `finance/screens/WalletScreen` |
| **Money wizard** (top-up, withdraw) | Solid `Layout header` (✕ `backIcon="close"` step 1, ← after) + slim step bar in `sticky` (title, "Step n of N", `StepProgress tone="surface"`) + body on `surface` + `LayoutFooter primary`. Nested native-stack under one `FormProvider` + flow context at navigator level; one `createIdempotentAction()` per wizard; discard guard on leave; last step = review with per-section Edit (`popTo`); success → `replace` with request detail (submitted mode: ✕ + "Back to wallet"). **Not** `WizardShell` (money flows stay calm, on surface) | `finance/navigation/TopUpNavigator` + `TopUpStepLayout`; gallery `LayoutMoneyWizardScreen` |

**Dashboard:** `Layout padding="none" headerBehavior="overlay" heroBackdrop="brandGlow" heroBehavior="parallax"` + transparent greeting `hero` (greeting beside bell, identity block full width below, ≤ 1 `LiveIsland` = highest-priority blocker, glass KPI strip with `AnimatedNumber`s, `useHeroCompact()`) + header `leading` pinning identity once hero scrolls away (no generic title) + ≤ 2 header icon actions + sections in `StaggerIn` (`gap="2xl"`, `px="xl"`, rails edge to edge) + pull-to-refresh. Hero shows **only real data** (no placeholder stats); sections without an API stay out. Each section owns skeleton/error/retry.

**Discover home** (approved 2026-10-11): Dashboard chrome (`brandGlow`, overlay header, parallax) but the hero is a **compact band ≤ ~25%** (≤ ~30% with the island): one row = identity (greeting + company name) beside ≤ 2 header icons · search field inside the band · optional slim `LiveIsland` (title only). No money in the band. Body: `Chip variant="tile"` category row (top pad ≥ `radii.xl` so tiles clear the sheet corners) → photo-first creator rails (4:5 cards; scroll content keeps bottom room for the `card` shadow) with the **wallet card after the first rail** (the body's one navy highlight card: `GradientSurface brand`, radius `lg`, "available" caption + mint dot + balance `MoneyText title onBrand` + eye + filled `+` top-up only when `/me` `capabilities.top_up_wallet.allowed`; no ≈ SYP line; above the skeleton / error / empty state while rails aren't there). No KPI strip, no big balance: content is the hero. Compact (`useHeroCompact()`): identity row only.

New archetype → propose to user, add here, then build.

## 3. Composition

- Navy = identity surfaces only (hero, header). Forms/content on `surface.main`. Glass only over navy. Exception: a dashboard may have **one** navy highlight card in body (`GradientSurface variant="brand"` + glass rows, no `GlowOrbs`). Home profile strength = white `Card` + `Timeline variant="track"`.
- Exactly **one primary** button per screen. Others: `secondary`, `ghost`, or teal text links (`interactive.text`, ≥ 44pt `Pressable`).
- Hierarchy: `h2` title → `body` secondary subtitle → `FormSection` groups (title `label`, fields `gap="lg"`). Sections `gap="2xl"`–`"3xl"`.
- Cards: `Card` defaults (borderless, shadow `card`, radius `lg`). Never add a border back; group rows in one card with `Divider`s.
- Hero budget: navy hero ≤ ~25% of screen expanded (≤ ~40% dashboard/money tab roots; wallet tab exception in 09b). Must have compact layout (one row + progress, no subtitle) via `useHeroCompact()` inside its own memo component; never trim with `useKeyboardVisible()` directly.
- Padding: Layout default `{ x: 'xl', y: 'lg' }`; footer aligns to it. Token spacing; one-off sizes via `moderateScale` constants at file top.
- Icons: lucide only, `sizes.icon.*`, directional icons flip in RTL.
- Motion: `motion` timings; springs for progress/press, `FadeIn`/`FadeInDown` entering, `LinearTransition` layout. Respect reduced motion.
- Status never color-only (text + icon).

### 3.1 Live elements & motion (v4 "Navy Trust, live")

Life from elements that tell state + meaningful light motion, never new colors.

| Element | Kit part | Use | Motion |
|---|---|---|---|
| Stage track | `Timeline variant="track"` (`DealProgress variant="track"`) | deal pipeline, profile strength | draws once; current node pulses (vertical too) |
| Live island | `LiveIsland` | one blocker/live event in navy hero | dot pulses |
| Rolling numbers | `AnimatedNumber` | KPI strip, balances, stat tiles | rolls once |
| Money flow | `MoneyFlow` | money on its way; escrow on a deal = `DealCard escrow` chip | mint dots flow |
| Smart border | `SmartBorder` | **only** system suggestions (smart match, AI) | slow teal sheen |
| Hero lights | `GlowOrbs` (`brandGlow`) | dashboard heroes | very slow drift |
| Liquid lens | `FloatingBottomBar` | active tab | springs on change |
| Stagger rise | `StaggerIn` | dashboard sections on mount | once |
| Press spring | `Pressable scaleOnPress` (`Card onPress` default) | tappable surfaces | on touch (`motion.pressScale` 0.96) |

- **Only three loops:** hero lights · status pulse (live island, current stage; smart-border sheen counts as this) · money flow. Spinners and skeleton pulse excepted. Nothing else loops.
- Draw/roll/rise run **once** per mount, never on re-render/refresh.
- Reduced motion → final state at once, loops stop. Kit parts handle it; screens don't branch.

### 3.2 Appeal bar (every screen, checked in review)

- **One focal point** per card and per screen region; everything else steps back (muted, smaller).
- **Media leads** where the content is people: creator photo ≥ 50% of a creator card's area.
- ≤ 2 badges per card; ≤ 3 text lines under media plus the price block; key number large + bold, secondary muted beneath.
- Generous breathing room (`lg`+ inside cards, `2xl` between sections); no dense meta rows on discovery cards.
- Discovery screens must not read like a ledger: money never the largest element outside money screens.

## 4. Required states

loading (skeleton with reserved space when > 300ms, not spinner) · empty (message + action) · error (`InlineError` + retry) · submitting (button `loading`, double-submit guarded) · 422 (`applyServerFieldErrors`) · keyboard open (content scrolls, hero trims) · offline (global snackbar, don't duplicate).

## 5. Forms

- `react-hook-form` + yup factory in `domains/<x>/schemas/` (`createXSchema(t)`, `useMemo(..., [t])`), `mode: 'onTouched'`. Reuse `createPhoneFields`, `createNewPasswordFields`.
- Submit stays **enabled**; validate on press, errors next to fields. Never disable just because invalid.
- **Optional steps:** Skip = `LayoutFooter` `secondary` (ghost) under primary, hint in footer `top`. Never Skip at end of scroll body. **Choice step** (tapping an option is the action, e.g. brand verification picker): no primary, footer holds only Skip.
- Every input: label, placeholder, `returnKeyType` + `onSubmitEditing` chaining, correct `textContentType`/`autoComplete`/`keyboardType`.
- OTP: `useOtpCodeForm` + `OtpCodeField` (auto-submit, shake, timestamp cooldown). Countdowns `useCountdown(endsAt)`, never decrementing `setInterval`.
- Toasts report what really happened (success only after `unwrap()` resolves).

## 6. Code shape

```
screens/<Name>Screen/
  <Name>Screen.tsx          ← render only; ≤ ~200 lines, extract memo sub-components
  hooks/use<Name>Screen.ts  ← form, mutations, navigation, derived state
  index.ts
```

- No `useState`/API/navigation logic in `.tsx`. Hook callbacks `useCallback`; memo sub-components subscribe narrowly (`useWatch`).
- Flow order/titles in typed config (`constants/*.ts`, `satisfies Record<StepKey, WizardStepDef>`).
- Server decides transitions: write → re-read → navigate where server says.
- Nav types: native-stack (`NativeStackNavigationProp`, `*StackScreenProps` from `@/core/navigation`).

## 7. Banned

- Centered icon-circle + title + inputs on plain `layout.base` as "auth" design.
- Hardcoded sizes (`circleSize={150}`), `align="right"`, `'SY'` literals (use `DEFAULT_PHONE_COUNTRY`).
- Logic in screen file; duplicated OTP/countdown/resend code.
- `@react-navigation/stack` types with native-stack.
- Success toast in a path that also runs on failure.
- Unreachable screens/hooks left in tree.

## 8. Definition of done

Mockup approved → shared parts → all §4 states → `npx tsc --noEmit && npm run lint && npm test` → `docs/mobile-architecture.md` + Change Log (rule 11) → self-review vs §3–§7 → tell user what was **not** verified on device (RTL, dark, small screen, reduced motion).
