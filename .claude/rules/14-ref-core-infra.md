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
- `AppApiError.code` / `retryAfter` / `reason` / `availableAt` from top-level `meta` (`availableAt` = `available_at`, else `next_available_at` of rate-cap 429s).
- `extraOptions.withMeta` → `WithMeta<T>` `{ data, meta }` for success meta (`canonical_slug`).
- `createIdempotentAction()`: one key per money intent, auto-retries only `409 idempotency_request_in_progress`. `IDEMPOTENCY_HEADER` = `Idempotency-Key` (rule 06).
- `retryRegistry`. Domains `injectEndpoints` with `overrideExisting: true`.

## Uploads (`@/core/upload`)

- 3-step deal uploads (contract §uploads): `uploadFile({ source, policy, requestSlot, onProgress, signal })` → `file_id`; rejects only `UploadError.failure` (`type size empty slot transfer canceled`, `cause` = API error, `maxBytes`). `isRetryableFailure`.
- `useFileUploads({ policy, requestSlot, limit })`: multi-file set, `entries` / `fileIds` / `add` (returns dropped) / `retry` (fresh slot) / `remove` / `move(key, toIndex)` (submit order) / `clear`, aborts on unmount.
- Core holds no limits: domain passes `UploadPolicy` (`DEAL_UPLOAD_POLICY[purpose]`, `DEAL_UPLOAD_LIMIT`) + a `requestSlot` wrapping its slot mutation (`transformResponse: mapUploadSlot`, `.unwrap()`). PUT streams from disk via `react-native-blob-util`; signed URL never logged/persisted. Tests: root `__mocks__/react-native-blob-util.ts` (`fakePuts`, `fakeStat`) + explicit `jest.mock('react-native-blob-util')`.

## Feedback UI

- Toasts: `toastService.success|error|warning|info` (`@/core/toast`) outside React; `useToast()` inside. `options.action { label, onPress }` = one inline button (Undo), hides the toast on press.
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

`Money`/`CurrencyCode` (`@/core/money`). Server decimal strings → `parseUsd("150.00")` / `parseUsdOrNull` / `parseDecimalMoney(text, currency)` (string math, throws on malformed; no amount in the error). `formatMoney` / `formatNumber` / `formatDate` (`@/core/i18n`, Western digits; Arabic months Levantine: كانون الثاني … كانون الأول).
