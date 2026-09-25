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

`App.tsx` also: applies `test_mode` from the boot config; initialises notifications + FCM token; mounts `GlobalErrorModal`, `NetworkSnackbar`, `Toast` (inside `ThemeProvider` — keep it there).

## Existing infrastructure (reuse, don't rebuild)

- **API:** `baseApi` with envelope unwrapping, pagination (`withPagination`), 401 refresh, centralised 403/422/5xx/offline handling, `retryRegistry`. Domains `injectEndpoints` with `overrideExisting: true`.
- **Toasts:** `toastService.success|error|warning|info` (`@/core/toast`) outside React; `useToast()` inside.
- **Errors UI:** `GlobalErrorModal` (5xx), `NetworkSnackbar` (offline via `useNetworkMonitor`), `InlineError` (400/404/validation).
- **UI kit (`@/shared/ui`):** `Box Text Pressable Card Image` primitives, `Layout` (safe area, scroll, keyboard, `ctaButton` — use `alwaysSolid` on inner screens), `ScreenHeader` (`fillStatusBar` ⇒ Layout `edges={['left','right']}`), `CustomButton`, `CustomInput`, `PhoneInput` (libphonenumber, E.164), `BottomSheet`, `SelectionModal`, `DateRangePicker`, `GalleryModal`, `SuperList`, `FloatingBottomBar`, `HeroBackdrop` + `GlassCard` (Skia, navy surfaces only; theme via `useGlassCardStyle()` outside `<Canvas>`, rule 08).
- **SuperList:** FlashList v2 — no `estimatedItemSize`; `overrideItemLayout` supports `span` only; `key={layout}` when columns change; `scrollRestorationKey` persists offset in MMKV; pass `useScrollHandler()` to `onScroll` when `Layout withScroll={false}`.
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
- Auth is email/password today; spec requires **phone OTP** for both roles + role selection (creator/brand) → new `AppStatus` step.
- Firebase configs (`google-services.json`, `GoogleService-Info.plist`) belong to old project; Android package mismatch (`com.sanadk.app` vs `com.getsadaapp`); iOS bundle id mismatch (`com.getsadaapp` vs `com.Sadaa.app`).
- `API_BASE_URL` in `.env*` + `network_security_config.xml` still point to old domain.
- MMKV not encrypted (rule 07).
- Unverified on device after the Navy Trust migration: CustomInput/PhoneInput still hand-pick `row-reverse`/`textAlign` by `isRTL`; `Card` defaults to `shadow="md"` (rule 08 prefers flat + border).
- `IOS_APP_STORE_ID` (`.env*`) empty until first App Store release — force-update button opens the App Store home until set.
- `NotificationSettings` in `identity/api/accountApi.ts` still has booking-era fields — replace with Sada notification categories when backend is ready.
