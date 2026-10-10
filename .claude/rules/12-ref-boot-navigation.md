---
paths:
  - "src/app/**"
  - "src/core/navigation/**"
  - "src/core/notification/**"
  - "src/core/linking/**"
  - "src/core/config/**"
  - "src/domains/*/navigation/**"
---

# 12 — Ref: Boot & Navigation

## Boot pipeline (`useAppBootstrap`, `src/app/bootstrap`)

Runs while native splash (symbol only) stays up:
1. `initSecureStorage()` awaited first.
2. Language.
3. `GET /config` (3s timeout, `extraOptions.silent`, cached MMKV).
4. `resolveBootGate`: maintenance from fresh config only · `min_version`/`force_update` → update required · newer `latest_version` → one-time soft-update toast.
5. Onboarding (`HAS_SEEN_ONBOARDING`, pre-auth only; logged-in skip).
6. Auth.

- **Fail-open:** config failure never blocks (server still answers 503).
- Statuses: `LOADING → MAINTENANCE | UPDATE_REQUIRED | CHOOSE_LANGUAGE | ONBOARDING | UNAUTHENTICATED | REGISTRATION_INCOMPLETE | SUSPENDED | AUTHENTICATED`. Gates win over auth; `SUSPENDED` wins over session branches.
- Suspension: persisted `auth.isSuspended`. Set by any 403 `account_suspended` (baseApi dispatches `auth/setAccountSuspended`, silent calls included, only with a token); synced from `/onboarding/progress` `status` / successful `/me`; cleared on login/logout.
- Boot > 1.5s → `BootScreen` (JS copy of splash + spinner).
- New boot checks → `resolveBootGate` + new `AppStatus`, never in screens.

## RootNavigator

- One branch per status: `Maintenance` | `ForceUpdate` | `ChooseLanguage` | `Onboarding` | `Auth` | `OnboardingResume` | `Suspended` | `Main`.
- `OnboardingScreen` finishes via `completeOnboarding` from `useAppBootstrap` (passed as prop).
- `Main` = bottom tabs (`app/navigation/MainTabs`; `FloatingBottomBar` reads `title`/`tabBarIcon` options), 5 per role:
  - brand: Explore · Campaigns · Messages · Wallet · Account
  - creator: Home · Deals · Messages · Wallet · Profile
- Real tabs: `HomeTab` (marketplace) · `WalletTab` (finance: `CreatorWalletNavigator` / `BrandWalletNavigator`, role picked here) · `SettingsTab` (identity). `DealsTab`/`MessagesTab` = `ComingSoonTabScreen` until built.
- Route param types: `src/core/navigation/types.ts`. Imperative nav: `navigate/replace/goBack` from `@/core/navigation`.

## App.tsx

- Applies `test_mode` from boot config.
- Notifications init (FCM token fetched without asking permission) + `usePushRefresh`: every received/tapped push invalidates `User`/`Kyc`/`Notification`; wallet pushes also tags from `walletPushTags` (finance).
- Push payloads → `parsePushPayload` (`core/notification`): known `type`s + allow-listed links only, never a raw screen name: `sada://kyc | verification | platforms/{id} | notifications | wallet | wallet/top-ups/{id} | wallet/withdrawals/{id} | wallet/payout-methods`.
- `usePushNavigation(status === AUTHENTICATED)` (notifications domain): taps → `resolveNotificationRoute` typed map → Settings tab with `initial: false`. Exceptions → Wallet tab: top-ups `TopUpDetail` (brand only), withdrawals `WithdrawalDetail` (creator only), payout-method alerts `PayoutMethods` (creator only). Launch tap buffered in `notificationManager.registerOpenHandler` 30 s.
- App links: `appLinkManager.start()` (`core/linking`). `parseAppLink` accepts only `https://<PUBLIC_WEB_HOST>/c/{slug}` and `sada://c/{slug}`; slug checked with §17.2 rule from `@/core/config`; launch link buffered 30 s.
- `useAppLinkNavigation` (identity; enabled in `AUTHENTICATED`/`UNAUTHENTICATED`) → `push('MediaKitPublic', { slug, source: 'link' })`: root-stack screen over Main or Auth (`PublicStackParamList`). Beacon §17.5 once per open; `canonical_slug` → cache upsert + `setParams`; 404 → "Profile not available".
- `useDeviceRegistration`: `POST /user/devices` on sign-in, token refresh, language change; skipped when unchanged; marker cleared by `authStorage.clearSession()`.
- Mounts `GlobalErrorModal`, `NetworkSnackbar`, `Toast` (inside `ThemeProvider` — keep it there).
