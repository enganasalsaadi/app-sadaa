# 07 — Security & Privacy

## Secrets & tokens

- Access/refresh tokens go through `authStorage` only (`@/core/storage`). Never read/write tokens elsewhere.
- Encrypted at rest: `sadaa-secure` (keys in `SECURE_STORAGE_KEYS`: tokens, PII drafts, device sync) and `sadaa-redux-persist` (user object) use AES-256 with a key from `react-native-keychain` (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`, Android `AES_GCM_NO_AUTH`). `sadaa-storage` stays plain — only non-identifying preferences go there.
- A new key that identifies the user or grants access → add it to `SECURE_STORAGE_KEYS`. Moving an existing key needs a `STORAGE_VERSION` bump + migration in `secureStorage.ts`.
- Secure keys are readable only after `initSecureStorage()` (boot awaits it). Never read them from code that can run before boot (background handlers, module scope).
- Never persist the token in Redux (`restoreToken` hydrates it from `authStorage`).
- No secrets in the JS bundle. `.env` holds only public config (API URL, flags). API keys for AI/analytics are called server-side.
- Never commit `.env*` values that are private; `.env.example` documents keys.

## Logging & PII

- No `console.log` of tokens, headers, phone numbers, wallet data, or API bodies. Logs only behind `env.ENABLE_LOGS`, and only non-PII.
- Crash/analytics events: IDs only, never names/phones/amounts tied to identity.

## Input & content

- Validate every form with a schema (yup) client-side; server re-validates.
- URLs from users (social profile links, proof-of-publish links) are validated against an allow-list of hosts before opening; open with `Linking` only after validation. `WebViewScreen` only loads allow-listed hosts.
- Uploads (drafts, avatars, documents): check MIME + size client-side, upload via signed URL/endpoint from the api layer. Show original quality; no WhatsApp-style recompression of review drafts.
- Deep links / push payloads: parse into typed route + params, validate, then `navigate`. Never navigate to a screen name taken raw from a payload.

## Auth

- Phone-number OTP is the target sign-up flow for both roles (spec). Rate-limit resend in UI (countdown), backend enforces.
- Role (creator | brand) comes from the server user object, never from local choice alone.
- On 401 refresh failure → clear all persisted user state + RTK Query cache (`baseApi.util.resetApiState()`).

## Permissions

Request lazily at point of use through `@/core/permissions` with a rationale string from i18n. Never request on app start (except notifications after onboarding).
