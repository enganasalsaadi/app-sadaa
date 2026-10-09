# 09 — Screen Playbook (how every screen is designed and built)

Goal: every new screen looks like it came from the same designer and is built from the same parts. Full step-by-step procedure: `/sada-screen` skill. This file = the non-negotiables.

## 1. Mockup first, code second

Before writing any screen code: show the user a text mockup (ASCII layout, AR/RTL orientation) + the archetype + the shared components you'll use, and wait for an explicit OK. No exceptions for "small" screens.

A new screen or a visual redesign also gets a **visual preview** (added 2026-10-08: ASCII got structure approved but never the look): a Design canvas artboard per screen (390×844, AR/RTL, `dark` tweak) built from `.claude/skills/sada-screen/preview-kit.css` (the real Navy Trust tokens), with real copy and realistic data. The approved canvas is the visual target; the build must match it. Small changes to an existing screen (a field, a row) need ASCII only. Procedure: `/sada-screen` Phase 2.

## 2. Pick an archetype — never invent a layout

| Archetype | Chrome | Reference implementation |
|---|---|---|
| **Auth / entry form** | `HeroSheet` (navy hero: logo/title; surface sheet: form) | `domains/auth/screens/LoginScreen` |
| **Wizard step** (multi-step form) | `WizardShell` around a native-stack + `useWizardHeader` per step | brand wizard (`BrandOnboardingNavigator`), reset wizard (`PasswordResetNavigator`) |
| **Celebration / milestone** | `HeroBackdrop` + one Skia canvas + staggered `FadeInDown` + `CustomButton variant="onBrand"` | `BrandWelcomeScreen` |
| **List** | `Layout mode="static" header={…}` + `SuperList` + skeleton/empty/error | — (use `SuperList` docs) |
| **Detail** | `Layout header={…}` + `Card` sections + `footer={<LayoutFooter primary />}` | — |
| **Settings / menu** | `Layout` + `ScreenHeader` + grouped `Card` rows. Profile (tab root) uses the Dashboard chrome: same hero height/structure as Home (glass completion card in the KPI slot), `brandGlow`, header `leading` identity | `identity/screens/ProfileScreen` |
| **Dashboard** (tab root) | `Layout padding="none" headerBehavior="overlay" heroBackdrop="brandGlow" heroBehavior="parallax"` + transparent greeting `hero` (greeting beside the bell, identity block full width below, ≤ 1 `LiveIsland` = the highest-priority blocker, glass KPI strip with `AnimatedNumber`s, `useHeroCompact()`) + header `leading` pinning the identity once the hero scrolls away (no generic title) + ≤ 2 header icon actions + stacked sections in `StaggerIn` (`gap="2xl"`, `px="xl"`, rails edge to edge) + pull-to-refresh. The hero shows **only data the app really has** (no placeholder stats); sections without an API stay out. Each section owns its skeleton/error/retry | `marketplace/screens/CreatorHomeScreen` |
| **Money** (wallet home, amount entry, receipt) | Wallet home = Dashboard chrome, hero holds the balance (§2.1). Amount entry = `Layout header` (solid) + big amount + live quote `Card` + `LayoutFooter primary`. Receipt = `Layout header` + centred amount block + `KeyValueRow` cards + secondary footer | wallet tab: `finance/screens/WalletScreen` (visual target: Sada Wallet Tab canvas, from the v4 «Wallet4» board, approved 2026-10-09) |
| **Money wizard** (multi-step money request: top-up, later withdraw; approved 2026-10-09) | Solid `Layout header` (✕ `backIcon="close"` on step 1, ← after) + slim step bar in `sticky` (step title, "Step n of N", `StepProgress tone="surface"`) + body on `surface` + `LayoutFooter primary`. Nested native-stack under one `FormProvider` + flow context at navigator level; one `createIdempotentAction()` per wizard; discard guard on leave; last step = review with per-section Edit (`popTo`); success → `replace` with the request detail (submitted mode: ✕ + "Back to wallet"). **Not** `WizardShell` (no navy hero: money flows stay calm and on surface) | `finance/navigation/TopUpNavigator` + `components/TopUpStepLayout` (visual target: Step 4 boards of the Sada Wallet Tab canvas; gallery: `LayoutMoneyWizardScreen`) |

### 2.1 Money archetype — visual rules

- **Hero balance (wallet tab, approved 2026-10-09):** title row beside the header's glass eye action (`ScreenHeaderAction glass`) · label `onBrandMuted` with a **still** mint dot (`glass.iconMoney`, never pulsing: not one of the §3.1 loops) · `MoneyText size="display" tone="onBrand" splitFraction rounding="down" animated` (58, digits roll once) · month-in glass pill (mint `glass.iconMoney` text, compact amount) · two glass tiles for the secondary balances (compact `AnimatedNumber`, clock = waiting, lock = escrow) · the one blocker as a `LiveIsland` · role action row: one `onBrand` primary (Withdraw | Top up) + one glass secondary. Eye action hides every amount on the screen (`hidden`, remembered per device). The header's `leading` pins the balance (`size="title"`) once the hero scrolls away. **Hero budget exception:** the wallet hero may take ~50–60% of the screen expanded (blocker island included) because it collapses into the pinned header; compact layout = `size="hero"` balance, no month pill, island title only. Figures the server doesn't send stay out (no placeholders); actions to unbuilt screens stay out until those screens ship.
- **Ledger row:** 40px `md`-radius badge (`soft` bg + `main` icon: mint = money in, `surface.elevated` = money out, info = escrow hold, warning = pending) · title `bodyMedium` · meta line = status pill (only when not final-success) + date `caption` tertiary · amount end-aligned `MoneyText showSign`: credit `tone="money"`, debit `default`, cancelled/rejected `muted strikethrough`. SYP lines carry a `≈ USD` caption under the amount.
- **Exact vs compact:** ledger, receipt, quote and confirm screens show exact amounts. `notation="compact"` only in stat tiles, chips and KPI strips.
- **Amount entry:** amount `≥ 48px` extraBold, centred, caret teal; "available" line above (value in `money.text`); "use all" teal soft chip; quote card below updates live (debounced) with gross → fee → divider → net (`money.text`, `title`) → payout in target currency `estimate` + rate caption. The primary sits in `LayoutFooter` with a timing caption.
- **Receipt:** 56px soft-mint circle icon · description `bodySmall` · amount `h2`-size `MoneyText showSign` · status pill · then labelled `KeyValueRow` cards (Details: deal, date, copyable reference; Amount: original + FX rate when present, gross, fee, net). Footer: secondary only (view deal) + teal link (report a problem). No primary on a read-only receipt.
- **Money colors:** mint only for money flow (balances, credits, net). Fees and debits stay neutral, never danger red. Status pills follow rule 08 status colors.
- **Wallet tab body:** `StaggerIn` sections, `px="xl"`: stale-rate `Notice` (warning, replaces the rate row) · held money as `EscrowFlowCard` (payer → Sada escrow → payee, `MoneyFlow` while held; `explainer` variant when nothing is held) · monthly `BarChart` card (creator earnings `tone="money"`, brand spend `neutral`; `SegmentedControl` 6 months | year; hidden when empty) · `ExchangeRateRow` · latest lines grouped by day (`WalletTransactionRow` in one `Card` per day, `Divider`s between rows).

New archetype → propose it to the user, add it here, then build.

## 3. Composition rules

- Navy = identity surfaces only (hero, header). Forms/content always sit on `surface.main`. Glass only over navy (rule 08). One exception (approved 2026-10-07): a dashboard may have **one** navy highlight card in its body (`GradientSurface variant="brand"` + glass rows, no `GlowOrbs`: the decoration stays in the hero) for the action that matters most. Since v4, Home profile strength is a white `Card` with a stage track (`Timeline variant="track"`).
- Exactly **one primary** button per screen. Other actions: `secondary`, `ghost`, or teal text links (`interactive.text`, ≥ 44pt tall `Pressable`).
- Hierarchy: `h2` screen title → `body` secondary subtitle → `FormSection` groups (title `label`, fields `gap="lg"`). Sections `gap="2xl"`–`"3xl"`.
- Cards: `Card` defaults (borderless, soft navy shadow `card`, radius `lg` 22, rule 08). Never add a border back to look "safe"; group rows inside one card with `Divider`s.
- Hero budget: a navy hero takes **≤ ~25% of the screen** expanded (**≤ ~40% on dashboard / money tab roots**, v4 2026-10-08, because they shrink to the pinned header on scroll; the wallet tab is the one exception, §2.1), and must have a **compact** layout (one row + progress, no subtitle/tagline) driven by `useHeroCompact()` (keyboard open, or window height < `COMPACT_HERO_MAX_HEIGHT`). New hero headers call `useHeroCompact()` inside their own memo component; never trim the hero with `useKeyboardVisible()` directly.
- Screen padding: Layout default `{ x: 'xl', y: 'lg' }` (`padding` prop); the footer aligns to it. Spacing only from tokens; one-off sizes via `moderateScale` constants at file top.
- Icons: lucide only, sizes from `sizes.icon.*`, directional icons flip in RTL.
- Motion: timings from `motion`; springs for progress/press, `FadeIn`/`FadeInDown` for entering, `LinearTransition` for layout. Loops only as listed in §3.1; everything respects reduced motion.
- Status is never color-only (text + icon).

### 3.1 Live elements & motion (v4 "Navy Trust, live", approved 2026-10-08)

Life comes from elements that tell the state and from light motion with a meaning, never from new colors (rule 08). Visual target: the Sada Design v4 canvas.

| Element | Kit part | Use for | Motion |
|---|---|---|---|
| Stage track | `Timeline variant="track"` (`DealProgress variant="track"` for deals) | where a multi-stage thing is: deal pipeline, profile strength | line draws once; the current node pulses (in the vertical variant too) |
| Live island | `LiveIsland` | the one blocker / live event in a navy hero (glass pill, title + one line, optional tap) | dot pulses while visible |
| Rolling numbers | `AnimatedNumber` | KPI strip, balances, stat tiles | rolls up once on first show |
| Money flow | `MoneyFlow` | money on its way (escrow → wallet, pending payout); escrow held on a deal = `DealCard escrow` chip | mint dots flow |
| Smart border | `SmartBorder` | **only** a system suggestion (smart match, AI suggestion) | slow teal sheen around the edge |
| Hero lights | `GlowOrbs` (Layout `brandGlow`) | dashboard heroes | very slow drift |
| Liquid lens | `FloatingBottomBar` | active tab | springs on tab change |
| Stagger rise | `StaggerIn` | dashboard sections on first mount | once |
| Press spring | `Pressable scaleOnPress` (`Card` with `onPress` has it by default) | everything tappable that is a surface | on touch (`motion.pressScale` 0.96) |

- **Loops allowed: three, and only these:**
  - the hero lights
  - the status pulse (live island, current stage)
  - money flow

  The smart border's sheen counts as the status pulse of a suggestion. Nothing else loops (spinners and skeleton pulse excepted).
- Draw / roll / rise animations run **once** per mount, never again on re-render or refresh.
- Reduced motion (`useReducedMotion`) shows the final state at once and stops every loop. Each kit part handles it, so screens don't branch on it.

## 4. Required states (a screen isn't done without them)

loading (skeleton with reserved space, not a spinner, when > 300ms) · empty (message + action) · error (`InlineError` + retry) · submitting (button `loading`, double-submit guarded) · server 422 (mapped to fields via `applyServerFieldErrors`) · keyboard open (content scrolls, hero trims) · offline (global snackbar — don't duplicate).

## 5. Form rules

- `react-hook-form` + yup schema factory in `domains/<x>/schemas/` (`createXSchema(t)`, built with `useMemo(..., [t])`), `mode: 'onTouched'`. Reuse field builders (`createPhoneFields`, `createNewPasswordFields`).
- Submit button stays **enabled**; validation runs on press and shows errors next to fields. Never disable a button just because the form is invalid.
- Every input: label, placeholder, `returnKeyType` + `onSubmitEditing` chaining to the next field, correct `textContentType`/`autoComplete`/`keyboardType`.
- OTP steps: `useOtpCodeForm` + `OtpCodeField` (auto-submit, shake, timestamp cooldown). Countdowns via `useCountdown(endsAt)`, never a decrementing `setInterval`.
- Toasts report what really happened (success only after `unwrap()` resolves).

## 6. Code shape (see rule 01/05)

```
screens/<Name>Screen/
  <Name>Screen.tsx          ← render only; ≤ ~200 lines, extract memo sub-components
  hooks/use<Name>Screen.ts  ← form, mutations, navigation, derived state
  index.ts
```

- No `useState`/API/navigation logic in the `.tsx`. Callbacks from the hook are `useCallback`; memo sub-components subscribe narrowly (`useWatch`).
- Flow order/titles in a typed config (`constants/*.ts`, `satisfies Record<StepKey, WizardStepDef>`), never scattered literals.
- Server decides state transitions (rule 06): write → re-read → navigate where the server says.
- Navigation types: native-stack (`NativeStackNavigationProp`, `*StackScreenProps` from `@/core/navigation`).

## 7. Banned patterns (seen before, don't repeat)

- Centered icon-circle + title + inputs on plain `layout.base` as an "auth" design.
- Hardcoded sizes (`circleSize={150}`), `align="right"`, `'SY'` literals (use `DEFAULT_PHONE_COUNTRY`).
- Logic inside the screen file; duplicated OTP/countdown/resend code.
- `@react-navigation/stack` types with native-stack navigators.
- Success toast in a code path that also runs on failure.
- Unreachable screens or hooks left in the tree.

## 8. Definition of done

Mockup approved → built from shared parts → all states from §4 → `npx tsc --noEmit && npm run lint && npm test` → `docs/mobile-architecture.md` + Change Log updated (rule `11-mobile-docs.md`) → self-review against §3–§7 → tell the user what was **not** verified on device (RTL, dark, small screen, reduced motion).
