---
paths:
  - "src/core/**"
  - "src/**/api/**"
  - "src/**/hooks/**"
  - "src/**/schemas/**"
  - "src/**/store/**"
  - "src/**/utils/**"
---

# 14 — Ref: Core Infrastructure — reuse, don't rebuild

## API (`baseApi`)

- Envelope unwrapping · pagination (`withPagination`) · 401 → logout + `resetApiState` · centralised 403/5xx/offline (409/429/422 passed to screen).
- `AppApiError.code` / `retryAfter` / `reason` / `availableAt` from top-level `meta`.
- `extraOptions.withMeta` → `WithMeta<T>` `{ data, meta }` for success meta (`canonical_slug`).
- `createIdempotentAction()`: one key per money intent, auto-retries only `409 idempotency_request_in_progress`. `IDEMPOTENCY_HEADER` = `Idempotency-Key` (rule 06).
- `retryRegistry`. Domains `injectEndpoints` with `overrideExisting: true`.

## Feedback UI

- Toasts: `toastService.success|error|warning|info` (`@/core/toast`) outside React; `useToast()` inside.
- Errors: `GlobalErrorModal` (5xx) · `NetworkSnackbar` (offline via `useNetworkMonitor`) · `InlineError` (400/404/validation).

## Forms & data helpers

- Schema field builders `createPhoneFields` / `createNewPasswordFields` (`domains/auth/schemas`). `DEFAULT_PHONE_COUNTRY` (`@/core/config`).
- `applyServerFieldErrors(err, fieldMap, setError)` (422 → fields). `useLookupItems(key)` (localized `/lookups`).
- `useCountdown(endsAt)` + `useDiscardGuard(hasUnsavedChanges)` (`@/core/hooks`). Tests importing that barrel mock it to the file (it loads Notifee).
- `@/shared/utils`: `normalizeSocialUrl`/`isValidSocialUrl` (host allow-list) · `openWhatsApp` · `formatFileSize`.
- `useOpenSupport()` (`@/domains/auth`): WhatsApp support with prefilled message, config number first, fallback toast.
- yup schemas built with `useMemo(() => createX(t), [t])`.

## Storage

- `appStorage` / `authStorage` / `StorageKeys` from `@/core/storage`.
- MMKV ids: `sadaa-storage` (plain: preferences read before boot) · `sadaa-secure` + `sadaa-redux-persist` (AES-256, key from Keychain/Keystore via `initSecureStorage()`, awaited first in `useAppBootstrap` and by redux-persist; one-time upgrade migration behind `STORAGE_VERSION`; lost key → wipe → logged out).
- Keys in `SECURE_STORAGE_KEYS` route to the encrypted store automatically; reading them before init throws in dev.
- Auth `token` not persisted by redux-persist — `restoreToken` fills it from `authStorage` at boot.

## Money & format

`Money`/`CurrencyCode` (`@/core/money`). `formatMoney` / `formatNumber` / `formatDate` (`@/core/i18n`, Western digits; Arabic months Levantine: كانون الثاني … كانون الأول).
