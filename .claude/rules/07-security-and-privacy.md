# 07 — Security & Privacy

## Secrets & tokens

- Access/refresh tokens only via `authStorage` (`@/core/storage`).
- Encrypted at rest: `sadaa-secure` (`SECURE_STORAGE_KEYS`: tokens, PII drafts, device sync) + `sadaa-redux-persist` (user object), AES-256, key from `react-native-keychain` (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`, Android `AES_GCM_NO_AUTH`). `sadaa-storage` plain — non-identifying preferences only.
- New key that identifies the user or grants access → `SECURE_STORAGE_KEYS`. Moving an existing key → `STORAGE_VERSION` bump + migration in `secureStorage.ts`.
- Secure keys readable only after `initSecureStorage()`; never read from pre-boot code (background handlers, module scope).
- Never persist token in Redux (`restoreToken` hydrates from `authStorage`).
- No secrets in JS bundle; `.env` = public config only. AI/analytics keys called server-side. Never commit private `.env*` values; `.env.example` documents keys.

## Logging & PII

No `console.log` of tokens, headers, phones, wallet data, API bodies. Logs only behind `env.ENABLE_LOGS`, non-PII. Crash/analytics: IDs only, never names/phones/amounts tied to identity.

## Input & content

- Every form validated by yup schema; server re-validates.
- User URLs (social links, proof links) validated against host allow-list before `Linking`. `WebViewScreen` loads allow-listed hosts only.
- Uploads: MIME + size check client-side, upload via signed URL/endpoint from api layer. Original quality; no recompression of review drafts.
- Deep links / push payloads: parse → typed route + params → validate → `navigate`. Never a raw screen name from payload.

## Auth

- Phone OTP sign-up for both roles. Resend rate-limited in UI (countdown); backend enforces.
- Role from server user object, never local choice alone.
- 401 refresh failure → clear persisted user state + `baseApi.util.resetApiState()`.

## Permissions

Lazily at point of use via `@/core/permissions` with i18n rationale. Never on app start (except notifications after onboarding).
