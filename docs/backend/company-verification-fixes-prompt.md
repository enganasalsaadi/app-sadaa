You are working on the Sada backend (B2B influencer marketplace, escrow wallet, Syria-first, Arabic-first). The mobile app is building the brand verification picker from `docs/company-verification.md` (2026-10-10). Mobile shows **4 options**: commercial registry/license, owner national ID/passport, social DM proof, domain email. Options 1 and 2 both use `POST /user/kyc`, and 3 and 4 use the new `/brand/verification/*` endpoints. The handoff leaves a few gaps that block a reliable app flow. Please add the items below without breaking anything that works today. **Additive changes only.**

## Conventions (keep them)
- Envelope `{ success, message, data, error_code, errors, meta: { locale, retry_after? } }`. `errors` is a field map on 422 only, else `null`.
- Every `*_label` and message is localized from `Accept-Language` (ar | en).
- Branch-able failures carry a stable `error_code`. The app never parses `message`.
- 429 carries `meta.retry_after` in seconds.
- Timestamps are ISO 8601 UTC.

## 1. Owner national ID / passport for brands (`POST /user/kyc` + brand onboarding step 3)
Today the brand `kyc_document_type` only accepts `commercial_register | industrial_register | trade_license`. Home businesses and freelancers have no register, so they need the owner's identity instead.
- Add brand values `owner_national_id` and `owner_passport` (with `*_label`).
- `owner_national_id`: accept `id_front` + `id_back`, the same fields and rules the influencer uses (jpeg/png/pdf ≤ 10MB).
- `owner_passport`: `kyc_document` single file.
- `GET /user/kyc` `document_type` returns the new values.
- Same `kyc-submit` throttle and the same 409 `kyc_already_pending` / `kyc_already_verified`.
- If you prefer a different field shape, tell us and we'll follow it.

## 2. New `GET /brand/verification/domain-email`: latest attempt or `null`
Without it, the app loses the "check your inbox" state on restart and can't offer resend.
```json
{
  "id": "01J...",
  "domain": "mybrand.sy",
  "email": "admin@mybrand.sy",
  "status": "pending | verified | expired",
  "status_label": "بانتظار التأكيد",
  "expires_at": "2026-10-10T13:00:00Z",
  "verified_at": null,
  "can_resend": true,
  "resend_available_at": "2026-10-10T12:01:00Z | null"
}
```
- `status` is computed: `expired` once `expires_at` has passed without verification.
- Resend = a new `POST` with the same body. It invalidates the previous token and returns the new `expires_at`, the same "replace" rule as social DM. Please confirm.

## 3. Block free and disposable email providers (route 3)
Otherwise any brand verifies instantly with `x@gmail.com` on `gmail.com`.
- Reject `domain` values that belong to public or disposable providers: `gmail.com`, `googlemail.com`, `yahoo.com`, `hotmail.com`, `outlook.com`, `live.com`, `msn.com`, `icloud.com`, `me.com`, `aol.com`, `proton.me`, `protonmail.com`, `yandex.com`, `mail.ru`, `gmx.com`, plus a maintained disposable list (e.g. `mailinator.com`, `10minutemail.com`, …).
- 422 on the **`domain`** field, with a localized message ("Use your company's own domain, not a public email provider").
- Tell us the message key / code so the app can show it inline.

## 4. Exact push `type` strings
The handoff gives class names only. The app's push parser accepts known `type`s only, so we need the exact strings and payloads:

| Event | `type` (proposed) | `deep_link` | `entity_id` |
|---|---|---|---|
| Social proof approved | `brand_social_proof_approved` | `sada://verification` | proof id |
| Social proof rejected | `brand_social_proof_rejected` | `sada://verification` | proof id |
| Domain email verified (link clicked) | `brand_domain_verified` (**new**) | `sada://verification` | attempt id |

- Please confirm the strings, and whether `kyc_approved` also fires when route 3 or 4 verifies the brand. We'd prefer only one push per event.

## 5. Rate limits + 429
Both start endpoints are spammable: domain email sends mail, and social DM regenerates codes. Proposal:
- `POST /brand/verification/social-dm`: 5 / hour per user.
- `POST /brand/verification/domain-email`: 3 / hour per user + a 60 s cooldown between sends (reflected in `resend_available_at`).
- 429 `too_many_requests` with `meta.retry_after`.
- Tell us the real values and throttle names so we can document them in the contract §1 table.

## 6. Verified method in `/user/me`
Add to the `kyc` object (and `GET /user/kyc`):
```json
"kyc": {
  "status": "verified",
  "method": "document | social_dm | domain_email | null",
  "method_label": "بريد النطاق الرسمي",
  ...
}
```
- `method` = what verified the brand, or the method of the pending attempt. `null` when there's nothing.
- Lets Profile show "Verified via official domain email".

## 7. Please confirm (no change needed if already true)
- **Interaction between routes:**
  - Brand already `verified` → both new start endpoints return 409 `kyc_already_verified`?
  - Document upload `pending` → can the brand still start social or domain?
  - What `kyc_status` is while only a social proof is pending: `pending` or unchanged?
- **`page_url` host check:** the server validates `page_url` against the platform host (`instagram.com`, `www.instagram.com`, `facebook.com`, `www.facebook.com`, `m.facebook.com`, `fb.com`) → 422 `page_url`? The app checks too, but the server must not trust it.
- **Brand onboarding step 3:** the picker replaces this step. If the brand starts social or domain there, the app will send step 3 with `is_skipped=1` to advance. Then `/onboarding/progress` `has_kyc_submission`: true or false? And should the `kyc` profile step count a pending social or domain attempt?
- **Handoff wording:** it says "4 routes" and "nothing new to translate". Mobile treats it as 3 API routes / 4 UI options, and adds its own screen copy.
- **Pending codes:** a pending social code never expires and stays valid until the brand replaces it?
