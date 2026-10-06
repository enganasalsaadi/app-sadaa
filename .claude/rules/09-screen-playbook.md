# 09 — Screen Playbook (how every screen is designed and built)

Goal: every new screen looks like it came from the same designer and is built from the same parts. Full step-by-step procedure: `/sada-screen` skill. This file = the non-negotiables.

## 1. Mockup first, code second

Before writing any screen code: show the user a text mockup (ASCII layout, AR/RTL orientation) + the archetype + the shared components you'll use, and wait for an explicit OK. No exceptions for "small" screens.

## 2. Pick an archetype — never invent a layout

| Archetype | Chrome | Reference implementation |
|---|---|---|
| **Auth / entry form** | `HeroSheet` (navy hero: logo/title; surface sheet: form) | `domains/auth/screens/LoginScreen` |
| **Wizard step** (multi-step form) | `WizardShell` around a native-stack + `useWizardHeader` per step | brand wizard (`BrandOnboardingNavigator`), reset wizard (`PasswordResetNavigator`) |
| **Celebration / milestone** | `HeroBackdrop` + one Skia canvas + staggered `FadeInDown` + `CustomButton variant="onBrand"` | `BrandWelcomeScreen` |
| **List** | `Layout mode="static" header={…}` + `SuperList` + skeleton/empty/error | — (use `SuperList` docs) |
| **Detail** | `Layout header={…}` + `Card` sections + `footer={<LayoutFooter primary />}` | — |
| **Settings / menu** | `Layout` + `ScreenHeader` + grouped `Card` rows | `identity/screens/ProfileScreen` |
| **Dashboard** (tab root) | `Layout padding="none" headerBehavior="overlay"` + compact navy greeting `hero` (`GradientSurface brand`, `useHeroCompact()`) + ≤ 2 header icon actions + stacked sections (`gap="2xl"`, `px="xl"`, rails edge to edge) + pull-to-refresh. ≤ 1 `Notice` (highest-priority blocker); each section owns its skeleton/error/retry | `marketplace/screens/CreatorHomeScreen` |

New archetype → propose it to the user, add it here, then build.

## 3. Composition rules

- Navy = identity surfaces only (hero, header). Forms/content always sit on `surface.main`. Glass only over navy (rule 08).
- Exactly **one primary** button per screen. Other actions: `secondary`, `ghost`, or teal text links (`interactive.text`, ≥ 44pt tall `Pressable`).
- Hierarchy: `h2` screen title → `body` secondary subtitle → `FormSection` groups (title `label`, fields `gap="lg"`). Sections `gap="2xl"`–`"3xl"`.
- Hero budget: a navy hero takes **≤ ~25% of the screen** expanded, and must have a **compact** layout (one row + progress, no subtitle/tagline) driven by `useHeroCompact()` (keyboard open, or window height < `COMPACT_HERO_MAX_HEIGHT`). New hero headers call `useHeroCompact()` inside their own memo component; never trim the hero with `useKeyboardVisible()` directly.
- Screen padding: Layout default `{ x: 'xl', y: 'lg' }` (`padding` prop); the footer aligns to it. Spacing only from tokens; one-off sizes via `moderateScale` constants at file top.
- Icons: lucide only, sizes from `sizes.icon.*`, directional icons flip in RTL.
- Motion: timings from `motion`; springs for progress/press, `FadeIn`/`FadeInDown` for entering, `LinearTransition` for layout. Nothing loops except on celebration screens; everything respects reduced motion.
- Status is never color-only (text + icon).

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
