# CLAUDE.md

Guidance for Claude Code in this repo. **Rules in `.claude/rules/` are mandatory** — read the relevant file before touching that area.

**Graphify:** for orientation/navigation, use `graphify query "<question>"` before grepping or reading files. If `graphify-out/graph.json` stale, run `graphify update` first.

## Product — Sada (صدى)

B2B influencer marketplace (Creator Economy), Syria-first, Arabic-first. One platform replacing the email/WhatsApp/payment-app chaos between brands and creators. Full spec: `project-define.txt`.

- **Creators:** phone sign-up → link Creator/Business social accounts (Meta) → auto stats & audience → AI portfolio/bio → set prices, city, niche → apply to open campaigns or receive offers → upload drafts in-app → publish + submit proof link → escrow released to wallet → withdraw (local e-wallets, instant cash-out).
- **Brands:** phone sign-up → type (company/store), name, socials, industry → campaign brief builder (budget, niche, goal, do/don't) → smart matching + hyper-local filters (city) → compare up to 3 creators → pay into escrow → review drafts → analytics/ROI (views, engagement, affiliate links, discount codes, QR visits).
- **Ad types:** paid post/story/reel, barter (products for content), affiliate commission, visit-based (QR), UGC (content only), offline event booking.
- **Trust layer:** escrow wallet, auto-generated contracts & invoices, refund pipeline, dispute state, mutual multi-criteria ratings, badges & rankings.
- **Deal state machine:** `pending_approval → awaiting_payment → in_progress → under_review → ready_to_publish → published → completed` (+ `disputed`). See rule 06.

## Rules index

| File | Scope |
|---|---|
| `.claude/rules/01-domain-driven-architecture.md` | folders, layers, domain boundaries, navigation |
| `.claude/rules/02-strict-design-system.md` | UI kit, tokens, zero hardcoding |
| `.claude/rules/03-localization-rtl.md` | typed i18n, RTL-only layout props |
| `.claude/rules/04-data-layer.md` | RTK Query repositories, Redux, storage |
| `.claude/rules/05-quality-gates.md` | strict TS, performance, tests, style |
| `.claude/rules/06-business-state-and-money.md` | state machines, money, idempotency |
| `.claude/rules/07-security-and-privacy.md` | tokens, PII, uploads, deep links |
| `.claude/rules/08-brand-identity.md` | Navy Trust palette & color roles, status colors, mode, Tajawal font, 8–12 radius, logo, currency |
| `.claude/rules/09-screen-playbook.md` | screen archetypes, mockup-before-code, required states, form rules, banned patterns. Procedure: `/sada-screen` skill |
| `.claude/rules/10-component-reuse.md` | reuse-first, no one-offs, every kit export demoed in DevShowcase (registry test) |

Most rules are lint-enforced (`.eslintrc.js`). If a rule blocks you, stop and ask — never disable a lint rule inline to get past it.

## Stack

React Native **0.87 CLI** (bare, not Expo) · React 19 · TypeScript strict · React Navigation v7 (native-stack + bottom-tabs) · RTK Query + Redux Toolkit + redux-persist · MMKV · i18next · Reanimated 4 · FlashList v2 · react-hook-form + yup · Firebase Messaging + Notifee · react-native-config.

## Commands

```bash
npm run ios | npm run android
npx react-native start --reset-cache     # after moving/renaming files
npx tsc --noEmit                         # typecheck
npm run lint                             # architecture + style gates
npm test                                 # jest
cd ios && pod install                    # after adding a native package
ENVFILE=.env.staging npx react-native run-ios
```

`.env*` are baked in at native build time — changing them needs a rebuild, not just Metro reload.

## Layout (see rule 01)

```
src/
  app/        App.tsx, navigation/RootNavigator, store/, bootstrap/, screens/ (Boot, ChooseLanguage, Onboarding, Maintenance, ForceUpdate)
  core/       api/ config/ i18n/ theme/ storage/ store/ navigation/ toast/ notification/ permissions/ hooks/
  shared/     ui/ (UI kit) · context/ · utils/ · types/
  domains/    auth/ · identity/ · marketplace/ · finance/
  assets/     fonts/ images/ lottie/ locales/{ar,en}/common.json
```

`app → domains → shared → core`. Alias: `@/` → `src/`. Cross-domain imports only via `@/domains/<name>` (its `index.ts`).

## Boot & navigation

`useAppBootstrap` (`src/app/bootstrap`) runs the boot pipeline while the native splash (symbol only) stays up: language → `GET /config` (3s timeout, `extraOptions.silent`, cached in MMKV) → `resolveBootGate` (maintenance from fresh config only; `min_version`/`force_update` → update required; newer `latest_version` → one-time soft-update toast) → onboarding (`HAS_SEEN_ONBOARDING`, pre-auth only; logged-in users skip it) → auth. **Fail-open:** config failure never blocks (server still answers 503). Statuses: `LOADING → MAINTENANCE | UPDATE_REQUIRED | CHOOSE_LANGUAGE | ONBOARDING | UNAUTHENTICATED | AUTHENTICATED` (gates win over auth). Boot >1.5s → `BootScreen` (JS copy of the splash + spinner). `RootNavigator` renders exactly one branch per status (`Maintenance` | `ForceUpdate` | `ChooseLanguage` | `Onboarding` | `Auth` | `Main`); `OnboardingScreen` finishes via `completeOnboarding` from `useAppBootstrap` (passed down as a prop). New boot checks go in `resolveBootGate` + a new `AppStatus`, never in screens. `Main` = bottom tabs (`FloatingBottomBar`), currently `HomeTab` (marketplace) + `SettingsTab` (identity). Route param types: `src/core/navigation/types.ts`. Imperative nav: `navigate/replace/goBack` from `@/core/navigation`.

`App.tsx` also: applies `test_mode` from the boot config; initialises notifications (FCM token fetched without asking permission) + `useDeviceRegistration` (`POST /user/devices` on sign-in, token refresh, language change; skipped when unchanged, marker cleared by `authStorage.clearSession()`); mounts `GlobalErrorModal`, `NetworkSnackbar`, `Toast` (inside `ThemeProvider` — keep it there).

## Existing infrastructure (reuse, don't rebuild)

- **API:** `baseApi` with envelope unwrapping, pagination (`withPagination`), 401 → logout + `resetApiState`, centralised 403/5xx/offline handling (409/429/422 passed to the screen; `AppApiError.code`/`retryAfter`), `retryRegistry`. Domains `injectEndpoints` with `overrideExisting: true`.
- **Toasts:** `toastService.success|error|warning|info` (`@/core/toast`) outside React; `useToast()` inside.
- **Errors UI:** `GlobalErrorModal` (5xx), `NetworkSnackbar` (offline via `useNetworkMonitor`), `InlineError` (400/404/validation).
- **UI kit (`@/shared/ui`):** `Box Text Pressable Card Image` primitives, `Layout` (`mode` scroll|static, `surface`, `padding`, `header` config → `ScreenHeader`, `headerBehavior` fixed|hideOnScroll|collapse|overlay, `hero` (edge-to-edge, header fades in over it), `sticky` (filter row pinned under the header), `footer={<LayoutFooter primary secondary top />}` pinned above the keyboard + `footerBehavior` divider|elevate, `overlay` (FAB slot); behaviours scroll-mode only; safe-area edges + status bar derived automatically, inside `HeroSheet` too; logic in `resolveLayout`, scroll motion in `useHeaderMotion`), `ScreenHeader` (`variant` solid|brand|transparent, `actions` ≤ 2 icons with `badge`), `CustomButton`, `CustomInput`, `PhoneInput` (libphonenumber, E.164), `BottomSheet`, `SelectionModal`, `DateRangePicker`, `GalleryModal`, `SuperList`, `FloatingBottomBar`, `HeroBackdrop` + `GlassCard` (Skia, navy surfaces only; theme via `useGlassCardStyle()` outside `<Canvas>`, rule 08). Building blocks: `IconButton` `FAB` `SegmentedControl` `Tabs` · `Switch` `Checkbox` `Radio`/`RadioGroup` `SearchBar` (`CustomInput showCount` = text area) · `ListRow`/`ListGroup` (settings/menu rows) `SectionHeader` `Divider` `KeyValueRow` (summaries, money emphasis) · `Badge` `StatusPill` (any `HueTone`, via `resolveHue` from `@/core/theme`) `Tag` `ProgressBar` `Accordion` `AvatarGroup` · `Notice` (in-flow banner) `EmptyState`/`ErrorState` (full-area; SuperList uses them). Money & Sada parts: `MoneyText` (the only way to show an amount: `tone` money for money flow, `showSign`, `estimate`) `AmountInput` (`Money` in minor units, Arabic digits accepted; helpers `parseAmountText`/`toAmountText` in `@/core/money`) `StatTile` · `Timeline` (vertical stages; deal pipeline, audit log) `Countdown` (deadline pill on `useCountdown`) · `MediaTile` (photo/video, upload + review states) `RatingStars` (display or 1–5 input); `FilePickerCard uploadProgress`, `CustomInput suffix`, `formatMoney(m, lang, { signDisplay })`.
- **Screen chrome:** `HeroSheet` (navy hero + rounded surface sheet) for auth/entry forms — Login is the reference. Hero headers switch to a compact layout via `useHeroCompact()` (`@/shared/ui`; keyboard open or window height < `COMPACT_HERO_MAX_HEIGHT` 700) — `WizardShell` and Login already do.
- **Multi-step flows:** `WizardShell` (built on `HeroSheet`, adds step pill + progress + title; wrap a native-stack so only the sheet slides) + `useWizardHeader({step,title,subtitle,onBack})` per screen; `StepProgress`, `FormSection`, `ConfirmSheet`, `FilePickerCard`, `Skeleton`, `SocialPlatformIcon`, `OtpInput` (ref `shake()`). Reference impls: brand wizard (`constants/brandOnboarding.ts`) and forgot-password wizard (`PasswordResetNavigator`, `constants/passwordReset.ts`); step defs typed `WizardStepDef`. OTP steps: `useOtpCodeForm` + `OtpCodeField` (auth domain). Onboarding: `useOnboardingFlow` core (write → re-read `/onboarding/progress` → navigate where the server says; retry never repeats the write; wrong-step rejections `onboarding_step_out_of_order`/`kyc_already_*`/`phone_not_verified` re-read and reroute; resolvers route by `current_step`, contract §15.11), wired per role by `useBrandOnboardingFlow(step)` / `useInfluencerOnboardingFlow(step)`; phone OTP step shared via `usePhoneVerifyStep` + `PhoneVerifyStepView`; first-load gate `OnboardingProgressGate`.
- **Push permission:** never asked on launch. Automatic triggers (welcome CTAs) go through `usePushPrompt().promptThen(next)` + `PushPromptSheet` (auth): only while the OS can still ask, 48h after "Not now", max 3 per install (`core/notification/pushPrompt.ts`). Settings shows the live OS status via `usePushPermission()` (`@/core/hooks`, re-read on foreground).
- **Forms/data helpers:** schema field builders `createPhoneFields` / `createNewPasswordFields` (`domains/auth/schemas`), `DEFAULT_PHONE_COUNTRY` (`@/core/config`), `applyServerFieldErrors(err, fieldMap, setError)` (422 → fields), `useLookupItems(key)` (localized `/lookups`), `useCountdown(endsAt)` (`@/core/hooks`), `normalizeSocialUrl`/`isValidSocialUrl` (host allow-list), `openWhatsApp`, `formatFileSize` (`@/shared/utils`). Motion timings: `motion` from `@/core/theme`. Build yup schemas with `useMemo(() => createX(t), [t])`.
- **SuperList:** FlashList v2 — no `estimatedItemSize`; `overrideItemLayout` supports `span` only; `key={layout}` when columns change; `scrollRestorationKey` persists offset in MMKV; pass `useJSScrollHandler()` (`@/shared/context/ScrollContext`) to its `onScroll` when `Layout mode="static"` (`useScrollHandler()` is for Animated scroll views only). Reference: `LayoutListStatesScreen`.
- **DevShowcase (`app/screens/DevShowcaseScreen`, `__DEV__` row in Profile):** the kit catalog, one screen per category from `registry/showcaseRegistry.ts`, plus `layoutVariants/` for archetypes. Check it before building UI; every kit export must be demoed there (rule 10).
- **Deals & wallet (domain parts):** marketplace owns `DEAL_STATUS` + `Record<DealStatus,…>` maps (`constants/dealStatus.ts` label/tone, `constants/statusIcons.ts` icons, `DEAL_ALLOWED_ACTIONS` per role, `DEAL_PIPELINE`), `getDealActions` / `buildDealProgress` (`utils/`, tested), and `DealStatusPill` (`null` = unknown-status fallback) `DealProgress` `DealCard` `CreatorCard` `DraftReviewCard`. Finance owns `BalanceCard` (role → withdraw | deposit only) and `PaymentBreakdown` (`estimate` for client previews). Demoed in the DevShowcase `sada` category.
- **Bottom bar:** `useHideBottomBar()` on inner screens.
- **Theme:** `useTheme()`, `useStyles()`, `useResponsiveValue()`; `moderateScale/fontScale` only for sizes without tokens. Font: Tajawal (rule 08). Colors: hue groups `{main,text,soft}` (`brand interactive money premium status.*`) — `.text` for text, `.main` for fills/icons. Spacing `xs sm md lg xl 2xl … 7xl`; typography `h1–h4 title body bodyMedium bodySmall caption button buttonSmall overline label`.
- **Storage:** `appStorage` / `authStorage` / `StorageKeys` from `@/core/storage` (MMKV ids `sadaa-storage`, `sadaa-redux-persist`).
- **SVG:** `react-native-svg-transformer`, import `.svg` as components. Logo → `<BrandLogo>` only.
- **Money/format:** `Money`/`CurrencyCode` (`@/core/money`); `formatMoney` / `formatNumber` / `formatDate` (`@/core/i18n`, Western digits).

## Workflow for a new feature

1. Pick the owning domain (rule 01). New bounded context → ask before creating a domain.
2. Types in `types/`, endpoints in `api/` (tags added to `baseApi.tagTypes`).
3. Screen folder with `hooks/use<Name>Screen.ts`; UI only from `@/shared/ui`.
4. i18n keys in **both** `ar` and `en`.
5. Register route in `core/navigation/types.ts` + domain navigator; export from domain `index.ts` if others need it.
6. `npx tsc --noEmit && npm run lint && npm test`.

## Known gaps / TODO

- `react-native-fast-image` outdated (legacy-peer-deps + TS shim) — replace with `expo-image`/RN `Image` later (rule 08).
- Login is phone+password (`HeroSheet`); forgot password = 3-step wizard (phone → OTP → new password → back to Login prefilled). Registration wizards run under `AppStatus.REGISTRATION_INCOMPLETE`; `RootNavigator` picks the branch from the server `userType`. Brand: account → phone OTP → profile → optional KYC → welcome. Creator (`constants/influencerOnboarding.ts`, `resolveInfluencerOnboardingStep`): account → phone OTP → niches (max 3) + platforms (draft kept in MMKV `INFLUENCER_SOCIALS_DRAFT` until saved) → optional rates (`price_usd` via `toPriceUsd`) → optional ID KYC (step-4, front + back) → welcome. KYC steps share `useKycFilePicker` + `utils/kycSubmission` (skip = `is_skipped=1`; `kyc_already_*` on retry → `runStep` `resubmit` as skip). Follower tiers use the brand ladder `FOLLOWER_TIER_STYLE` (neutral → teal → navy → mustard for MEGA only).
- Firebase configs (`google-services.json`, `GoogleService-Info.plist`) belong to old project; Android package mismatch (`com.sanadk.app` vs `com.getsadaapp`); iOS bundle id mismatch (`com.getsadaapp` vs `com.Sadaa.app`).
- `API_BASE_URL` in `.env*` + `network_security_config.xml` still point to old domain.
- MMKV not encrypted (rule 07).
- Unverified on device after the Navy Trust migration: CustomInput/PhoneInput still hand-pick `row-reverse`/`textAlign` by `isRTL`; `Card` defaults to `shadow="md"` (rule 08 prefers flat + border).
- `IOS_APP_STORE_ID` (`.env*`) empty until first App Store release — force-update button opens the App Store home until set.
- `NotificationSettings` in `identity/api/accountApi.ts` still has booking-era fields — replace with Sada notification categories when backend is ready.

## Token discipline

- Output: no greetings, filler, or recaps. Don't explain RN/React basics unless asked (`--explain`). Show only changed code or diffs; never reprint unchanged code.
- Tier 2/3 work (hooks, slices, navigation, native bridges, Gradle/Xcode, Reanimated, perf): 2-bullet plan before code.
- Delegate mechanical work (finding files, extracting logs, reading `package.json`, adb/xcrun) to a fast subagent (`model: haiku` / cavecrew). Keep the main model for native, build, animation, and perf work.
- Context hygiene: never read `node_modules/ ios/Pods/ ios/build/ android/build/ android/.gradle/`. Large TSX: skim the skeleton (imports, props, hooks) first, then do a targeted read. Build logs: grep only (`grep -i "error:"`, `grep -A 15 -B 5 "FAILED"`). Metro: JS stack trace only.
- Zero-redo: production-ready code the first time — loading/error states, effect cleanup, strict types, no `TODO`s.
- Self-verify silently: run `npx tsc --noEmit` (+ lint) before reporting; fix errors before presenting.
- API contract: UI validation mirrors backend limits (`maxLength`, etc.).
