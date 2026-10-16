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

**Locked: colors (rule 08 palette + roles + contrast) + font (Tajawal, `<Text variant>`). Rest = creative call**: layout, composition, shape, radii, depth, glass, palette-hue gradients, illustration, motion, gestures, transitions, hero amount, card look. No mandatory layout template.

**Blank page, always.** Every design/redesign starts from zero. Existing screens, kit default look (cards, hero, header, tab bar, chips, rails), past approved designs, earlier previews = never reference or constraint for *look*. Don't match, don't "stay consistent", don't start from them. Only code plumbing (data, states, navigation, forms) carries over.

Goal: screen looks **modern, alive, premium**, on par with top consumer apps (Revolut, Airbnb, Instagram, Linear, Apple Wallet). Never plain stack of grey boxes. Dull = failed, even if all rules pass.

Non-design gates still apply: accessibility (below), required states (§4), forms (§5), code shape (§6), performance (rule 05), money/business rules (rule 06).

## 1. Concept first, code second

- Before screen code: **creative concept** + **HTML preview** (AR/RTL, real colors + Tajawal) + parts list → wait explicit OK. **One direction, one preview** (boldest good idea). 2+ directions only when user asks.
- Concept names: signature moment (one memorable thing), interactions (press, swipe, drag, pull, long-press, haptics), motion choreography (enter, state change, exit, between screens), depth/material (layers, glass, shadow, light).
- **HTML preview = local static file**, opened in browser (`/sada-screen` Phase 2). Never published: no Artifact tool / canvas / `quickstart` unless user explicitly asks in that message. ASCII only for small tweaks to existing screen.

## 2. Reference patterns (structure & code, not look)

Reuse **code plumbing** when fits; restyle/replace look freely. New layout needs no permission beyond concept OK.

| Pattern | Plumbing worth reusing | Reference |
|---|---|---|
| Auth / entry form | `HeroSheet` | `auth/screens/LoginScreen` |
| Wizard step | `WizardShell` around native-stack + `useWizardHeader` | `BrandOnboardingNavigator`, `PasswordResetNavigator` |
| Celebration | `HeroBackdrop` + Skia canvas + staggered entering | `BrandWelcomeScreen` |
| List | `Layout mode="static"` + `SuperList` + skeleton/empty/error | `LayoutListStatesScreen` |
| Detail | `Layout header` + `footer={<LayoutFooter />}` | — |
| Tab root | data hook + pull-to-refresh + tab-bar hide on scroll | `CreatorHomeScreen`, `BrandHomeScreen` |
| Money | rule 09b | `finance/screens/WalletScreen` |
| Money wizard | nested native-stack under one `FormProvider` + flow context; one `createIdempotentAction()` per wizard; discard guard on leave; last step = review w/ per-section Edit (`popTo`); success → `replace` w/ request detail | `finance/navigation/TopUpNavigator`; gallery `LayoutMoneyWizardScreen` |

Screens show **only real data** (no placeholder stats); sections w/o API stay out — data truth, not style.

## 3. Craft (how to make it not dull)

- **Hierarchy**: one focal point per screen + per region; rest steps back. Big confident type for key thing, muted support text.
- **Type contrast**: push size/weight apart — large extraBold figure/title beside small muted light/regular text = premium; similar sizes everywhere = flat.
- **Whitespace**: key elements breathe; generous spacing between regions beats packing. Cut before squeeze.
- **Content leads** where content = people: real photos, generous media, faces before numbers. Discovery screens never read like ledger.
- **Edge-to-edge media**: people/content screens → photos/covers bleed to screen edges where concept fits, not always boxed in padded cards.
- Guiding principles, not mandates — concept decides where each applies.
- **Depth & material**: layered surfaces, overlap, glass, soft palette gradients, light, shadow, blur, masks. Flat grey stacks = failure mode.
- **Interaction**: every tappable responds (press spring, haptics, state change). Gestures where natural (swipe cards, drag sheets, pull actions, long-press previews), shared-element/layout transitions between related screens, scroll-driven effects (parallax, collapsing, sticky morphs).
- **Motion**: purposeful, fluid — enter, state change, feedback, delight. Loops OK when carry meaning/ambience; pause off-screen/blurred. Don't re-run intro animations on refresh.
- **Variety**: screens feel one family via color + type only — never copy layouts or parts' look from other screens.
- **Illustration & iconography**: lucide default; custom SVG icons, illustrations, Lottie, Skia shapes allowed (palette colors).
- **Primary action**: main action obvious; avoid multiple competing filled buttons.
- **Creativity is the job.** Each screen own idea; boring, safe, "like other screens" = rework.

### 3.1 Existing animated parts (optional, never a default)

| Element | Kit part | Good for |
|---|---|---|
| Stage track | `Timeline variant="track"` (`DealProgress variant="track"`) | deal pipeline, profile strength |
| Live island | `LiveIsland` | blocker/live event in hero |
| Rolling numbers | `AnimatedNumber` | KPIs, balances, stat tiles |
| Money flow | `MoneyFlow` | money in transit, escrow |
| Smart border | `SmartBorder` | system suggestions (smart match, AI) |
| Hero lights | `GlowOrbs` | ambient light in navy areas |
| Liquid lens | `FloatingBottomBar` | active tab |
| Stagger rise | `StaggerIn` | sections on mount |
| Press spring | `Pressable scaleOnPress` (`Card onPress` default) | tappable surfaces |

### 3.2 Accessibility (gate)

Touch targets ≥ 44pt · `accessibilityRole` + i18n `accessibilityLabel` on pressables · contrast per rule 08 · status never color-only (text/icon too) · reduced motion → final state instantly, loops stop (kit parts handle; new animated parts must too) · RTL-correct, directional icons flip.

### 3.3 Review question (every screen)

Screenshot stand next to top-tier modern app w/o looking cheap? Signature moment? Reacts to touch? Any no → iterate before reporting.

## 4. Required states

loading (skeleton w/ reserved space when > 300ms, not spinner) · empty (message + action; designed, not bare text) · error (`InlineError` + retry) · submitting (button `loading`, double-submit guarded) · 422 (`applyServerFieldErrors`) · keyboard open (focused field visible) · offline (global snackbar, no duplicate).

## 5. Forms

- `react-hook-form` + yup factory in `domains/<x>/schemas/` (`createXSchema(t)`, `useMemo(..., [t])`), `mode: 'onTouched'`. Reuse `createPhoneFields`, `createNewPasswordFields`.
- Submit stays **enabled**; validate on press, errors beside fields. Never disable just because invalid.
- **Optional steps:** Skip in footer near primary, never at end of scroll body. **Choice step** (tap option = action): no primary, footer holds only Skip.
- Every input: label, placeholder, `returnKeyType` + `onSubmitEditing` chaining, correct `textContentType`/`autoComplete`/`keyboardType`.
- OTP: `useOtpCodeForm` + `OtpCodeField` (auto-submit, shake, timestamp cooldown). Countdowns `useCountdown(endsAt)`, never decrementing `setInterval`.
- Toasts report real outcome (success only after `unwrap()` resolves).

## 6. Code shape

```
screens/<Name>Screen/
  <Name>Screen.tsx          ← render only; ≤ ~200 lines, extract memo sub-components
  components/               ← screen-specific visual parts (optional)
  hooks/use<Name>Screen.ts  ← form, mutations, navigation, derived state
  index.ts
```

- No `useState`/API/navigation logic in `.tsx` (animation shared values / gesture handlers inside visual components fine). Hook callbacks `useCallback`; memo sub-components subscribe narrowly (`useWatch`).
- Flow order/titles in typed config (`constants/*.ts`, `satisfies Record<StepKey, WizardStepDef>`).
- Server decides transitions: write → re-read → navigate where server says.
- Nav types: native-stack (`NativeStackNavigationProp`, `*StackScreenProps` from `@/core/navigation`).

## 7. Banned (code)

- Hardcoded sizes w/o `moderateScale` (`circleSize={150}`), `align="right"`, `'SY'` literals (use `DEFAULT_PHONE_COUNTRY`).
- Logic in screen file; duplicated OTP/countdown/resend code.
- `@react-navigation/stack` types w/ native-stack.
- Success toast in path also running on failure.
- Unreachable screens/hooks left in tree.

## 8. Definition of done

Concept + HTML preview approved → parts → all §4 states → `npx tsc --noEmit && npm run lint && npm test` → `docs/mobile-architecture.md` + Change Log (rule 11) → self-review vs §3 + §3.3 → tell user what **not** verified on device (RTL, dark, small screen, reduced motion, animation smoothness).