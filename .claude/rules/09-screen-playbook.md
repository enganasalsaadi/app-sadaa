---
paths:
  - "src/**/*.tsx"
  - "src/**/screens/**"
  - "src/**/navigation/**"
  - ".claude/skills/sada-screen/**"
---

# 09 — Screen Playbook

Procedure: `/sada-screen` skill.

## 0. Design freedom (read first)

**Locked: colors (rule 08 palette + roles + contrast) and font (Tajawal, `<Text variant>`). Everything else is a creative decision**: layout, composition, shape, radii, depth, glass, gradients from palette hues, illustration, motion, gestures, transitions, how much hero, how cards look. No layout template is mandatory.

**Blank page, always.** Every design or redesign starts from zero: no existing screen, kit default look (cards, hero, header, tab bar, chips, rails), past approved design or earlier preview is a reference or a constraint for the *look*. Don't match them, don't "stay consistent" with them, don't start from them. Only their code plumbing (data, states, navigation, forms) carries over.

Goal every time: a screen that looks **modern, alive and premium**, on par with top consumer apps (Revolut, Airbnb, Instagram, Linear, Apple Wallet), never a plain stack of grey boxes. Dull = failed, even if every rule passes.

Non-design gates that still apply: accessibility (below), required states (§4), forms (§5), code shape (§6), performance (rule 05), money/business rules (rule 06).

## 1. Concept first, code second

- Before screen code: **creative concept** + **HTML preview** (AR/RTL, real colors + Tajawal) + parts list → wait for explicit OK. New screen or redesign → offer **2 distinct directions** (one bolder) when the choice is real.
- Concept names: the signature moment (the one thing people remember), interactions (press, swipe, drag, pull, long-press, haptics), motion choreography (enter, state change, exit, between screens), depth/material (layers, glass, shadow, light).
- **HTML preview = local static file**, opened in the browser (`/sada-screen` Phase 2). Never published: no Artifact tool / canvas / `quickstart` unless the user explicitly asks in that message. ASCII only for small tweaks to an existing screen.

## 2. Reference patterns (structure & code, not look)

Reuse their **code plumbing** when it fits; restyle or replace the look freely. A new layout needs no permission beyond the concept OK.

| Pattern | Plumbing worth reusing | Reference |
|---|---|---|
| Auth / entry form | `HeroSheet` | `auth/screens/LoginScreen` |
| Wizard step | `WizardShell` around a native-stack + `useWizardHeader` | `BrandOnboardingNavigator`, `PasswordResetNavigator` |
| Celebration | `HeroBackdrop` + Skia canvas + staggered entering | `BrandWelcomeScreen` |
| List | `Layout mode="static"` + `SuperList` + skeleton/empty/error | `LayoutListStatesScreen` |
| Detail | `Layout header` + `footer={<LayoutFooter />}` | — |
| Tab root | data hook + pull-to-refresh + tab-bar hide on scroll | `CreatorHomeScreen`, `BrandHomeScreen` |
| Money | rule 09b | `finance/screens/WalletScreen` |
| Money wizard | nested native-stack under one `FormProvider` + flow context; one `createIdempotentAction()` per wizard; discard guard on leave; last step = review with per-section Edit (`popTo`); success → `replace` with request detail | `finance/navigation/TopUpNavigator`; gallery `LayoutMoneyWizardScreen` |

Screens show **only real data** (no placeholder stats); sections without an API stay out — data truth, not style.

## 3. Craft (how to make it not dull)

- **Hierarchy**: one clear focal point per screen and per region; everything else steps back. Big confident type for the key thing, muted support text.
- **Type contrast**: push size and weight apart — a large extraBold figure or title beside small, muted light/regular text reads premium; similar sizes everywhere read flat.
- **Whitespace**: give key elements room to breathe; generous spacing between regions beats packing more in. Cut before you squeeze.
- **Content leads** where content is people: real photos, generous media, faces before numbers. Discovery screens never read like a ledger.
- **Edge-to-edge media**: on people/content screens, let photos and covers bleed to the screen edges where it suits the concept, instead of always boxing them in padded cards.
- These are guiding principles, not mandates — the concept decides where each applies.
- **Depth & material**: layered surfaces, overlapping elements, glass, soft palette gradients, light, shadow, blur, masks. Flat grey stacks are the failure mode.
- **Interaction**: every tappable thing responds (press spring, haptics, state change). Use gestures where natural (swipe cards, drag sheets, pull actions, long-press previews), shared-element / layout transitions between related screens, scroll-driven effects (parallax, collapsing, sticky morphs).
- **Motion**: purposeful and fluid — enter, state change, feedback, delight. Loops are fine when they carry meaning or ambience; pause them when off-screen/blurred. Avoid re-running intro animations on refresh.
- **Variety**: screens feel like one family through color and type only — never by copying layouts or parts' look from other screens.
- **Illustration & iconography**: lucide is the default set; custom SVG icons, illustrations, Lottie, Skia shapes allowed (palette colors).
- **Primary action**: make the main action obvious; avoid several competing filled buttons.
- **Creativity is the job.** Each screen gets its own idea; boring, safe or "like the other screens" = rework.

### 3.1 Existing animated parts (optional, never a default)

| Element | Kit part | Good for |
|---|---|---|
| Stage track | `Timeline variant="track"` (`DealProgress variant="track"`) | deal pipeline, profile strength |
| Live island | `LiveIsland` | a blocker/live event in a hero |
| Rolling numbers | `AnimatedNumber` | KPIs, balances, stat tiles |
| Money flow | `MoneyFlow` | money on its way, escrow |
| Smart border | `SmartBorder` | system suggestions (smart match, AI) |
| Hero lights | `GlowOrbs` | ambient light in navy areas |
| Liquid lens | `FloatingBottomBar` | active tab |
| Stagger rise | `StaggerIn` | sections on mount |
| Press spring | `Pressable scaleOnPress` (`Card onPress` default) | tappable surfaces |

### 3.2 Accessibility (gate)

Touch targets ≥ 44pt · `accessibilityRole` + i18n `accessibilityLabel` on pressables · contrast per rule 08 · status never color-only (text or icon too) · reduced motion → final state at once, loops stop (kit parts handle it; new animated parts must too) · RTL-correct, directional icons flip.

### 3.3 Review question (every screen)

Would this screenshot stand next to a top-tier modern app without looking cheap? Is there a signature moment? Does it react to touch? If any answer is no → iterate before reporting.

## 4. Required states

loading (skeleton with reserved space when > 300ms, not spinner) · empty (message + action; make it designed, not bare text) · error (`InlineError` + retry) · submitting (button `loading`, double-submit guarded) · 422 (`applyServerFieldErrors`) · keyboard open (focused field stays visible) · offline (global snackbar, don't duplicate).

## 5. Forms

- `react-hook-form` + yup factory in `domains/<x>/schemas/` (`createXSchema(t)`, `useMemo(..., [t])`), `mode: 'onTouched'`. Reuse `createPhoneFields`, `createNewPasswordFields`.
- Submit stays **enabled**; validate on press, errors next to fields. Never disable just because invalid.
- **Optional steps:** Skip lives in the footer near the primary, never at the end of the scroll body. **Choice step** (tapping an option is the action): no primary, footer holds only Skip.
- Every input: label, placeholder, `returnKeyType` + `onSubmitEditing` chaining, correct `textContentType`/`autoComplete`/`keyboardType`.
- OTP: `useOtpCodeForm` + `OtpCodeField` (auto-submit, shake, timestamp cooldown). Countdowns `useCountdown(endsAt)`, never decrementing `setInterval`.
- Toasts report what really happened (success only after `unwrap()` resolves).

## 6. Code shape

```
screens/<Name>Screen/
  <Name>Screen.tsx          ← render only; ≤ ~200 lines, extract memo sub-components
  components/               ← screen-specific visual parts (optional)
  hooks/use<Name>Screen.ts  ← form, mutations, navigation, derived state
  index.ts
```

- No `useState`/API/navigation logic in `.tsx` (animation shared values / gesture handlers inside visual components are fine). Hook callbacks `useCallback`; memo sub-components subscribe narrowly (`useWatch`).
- Flow order/titles in typed config (`constants/*.ts`, `satisfies Record<StepKey, WizardStepDef>`).
- Server decides transitions: write → re-read → navigate where server says.
- Nav types: native-stack (`NativeStackNavigationProp`, `*StackScreenProps` from `@/core/navigation`).

## 7. Banned (code)

- Hardcoded sizes without `moderateScale` (`circleSize={150}`), `align="right"`, `'SY'` literals (use `DEFAULT_PHONE_COUNTRY`).
- Logic in screen file; duplicated OTP/countdown/resend code.
- `@react-navigation/stack` types with native-stack.
- Success toast in a path that also runs on failure.
- Unreachable screens/hooks left in tree.

## 8. Definition of done

Concept + HTML preview approved → parts → all §4 states → `npx tsc --noEmit && npm run lint && npm test` → `docs/mobile-architecture.md` + Change Log (rule 11) → self-review vs §3 + §3.3 → tell user what was **not** verified on device (RTL, dark, small screen, reduced motion, animation smoothness).
