# Mobile Integration — Company Verification (Brands)

**Added:** 2026-10-10. **Updated:** 2026-10-10 — answers every open question from the first integration pass and documents the endpoints/fields added to close them.

## What changed

Brands already had one verification path: upload a commercial register / industrial register / trade license, **or** an owner's national ID / passport for businesses with no company paperwork (`KycController`, unchanged route, extended document types). Three more routes exist, all leading to the same `kyc_status = verified`. Build this as a **picker screen**: the brand picks whichever fits their business, and passing any one of them is enough. There is no "basic" tier before this — it's the only verification step. Once a brand is verified, every start endpoint below returns `kyc_already_verified` (409) instead of letting it restart a route.

| # | Route | Who it's for | How it works |
|---|---|---|---|
| 1 | Commercial registry / owner ID / owner passport | Registered companies, or home businesses/freelancers | Existing `POST /user/kyc` document upload. |
| 2 | Social page proof | Instagram/Facebook-only stores with no paperwork | Generate a code, DM it to Sada's official account, admin matches it manually. |
| 3 | Domain email | Tech/SaaS/digital companies with a real domain | Enter domain + email on it, click a link Sada emails. Fully automatic. |

All endpoints below sit under the existing brand auth group (`auth:sanctum`, active account, phone verified, `user.type:brand`) except the public verify link. All responses follow the existing `ApiResponse` envelope (`{"data": ...}` on success) and honor `Accept-Language` (`ar`/`en`) for every label/message. Validation failures are standard `422` with `errors.*` per-field arrays.

## Route 1 — Document / Owner ID (extended)

`kyc_document_type` for brands now accepts 5 values: `commercial_register`, `industrial_register`, `trade_license`, `owner_national_id`, `owner_passport`.

- `owner_national_id`: same shape as an influencer's — `id_front` + `id_back` (jpeg/png/webp/pdf ≤ 10MB each).
- Everything else (including `owner_passport`): single `kyc_document` field (jpeg/png/pdf ≤ 10MB), same as before.
- `GET /user/kyc` `document_type` returns whichever of the 5 values was submitted, with a localized `*_label`.
- Same `kyc-submit` throttle, same 409 `kyc_already_pending` / `kyc_already_verified` as before.
- Approving either owner-ID type sets the brand's verification method to `personal_id` (same bucket as a plain national ID) — admins don't need a separate review path for it.

## Route 2 — Social Page Proof

### Start / replace

```
POST /brand/verification/social-dm
```

Request body:

```json
{
  "platform": "instagram",
  "page_url": "https://instagram.com/mybrand"
}
```

- `platform`: `"instagram"` or `"facebook"` only — no other platform is valid here.
- `page_url`: required, valid URL, max 255 chars, **and its host must belong to the selected platform** (`instagram.com`/`www.instagram.com` for Instagram; `facebook.com`/`www.facebook.com`/`m.facebook.com`/`fb.com` for Facebook). A mismatched host is a normal `422` on the `page_url` field — show it inline the same as any other validation error.

Starting a new one **replaces** any still-pending one for the brand (only one active code at a time).

Response (`201`):

```json
{
  "data": {
    "id": "01J...",
    "platform": "instagram",
    "platform_label": "Instagram",
    "page_url": "https://instagram.com/mybrand",
    "code": "SADA-4821",
    "status": "pending",
    "status_label": "Pending",
    "rejection_reason": null,
    "deep_link": "https://instagram.com/sada.sy",
    "created_at": "2026-10-10T12:00:00Z",
    "reviewed_at": null
  }
}
```

- **`deep_link`** is built server-side from `config('social.official_accounts.*')` (Sada's real handle/page ID — ops still needs to set these, see Known Gaps in the product doc). It can be `null` if that config isn't set yet — handle that by falling back to a plain "open Instagram/Facebook and DM us" instruction instead of hiding the button and breaking the flow.
  - Instagram: `https://instagram.com/{handle}` — opens the official profile; the app can't deep-link straight into an Instagram DM compose.
  - Facebook: `https://m.me/{page_id}?text={urlencoded code}` — this one **opens Messenger with the code pre-filled**, so for Facebook the button can say "Send code" instead of "Open page".
- **UI copy must not promise instant verification for this route.** There's no public API Sada can use to read its own Instagram/Facebook DMs — an admin manually checks the inbox and matches the code. It's typically fast but show "pending admin review" copy, not a spinner implying auto-verify.
- Rate limit: **5 starts / hour / brand** (throttle `brand-social-proof`, separate from the document-upload limiter).
- **Pending codes never expire** — a code stays valid until the brand replaces it by starting a new one. There is no TTL on this route (unlike domain email).

### Check status

```
GET /brand/verification/social-dm
```

Returns the brand's latest proof (same shape as above), or `"data": null` if none has ever been submitted. Poll this (e.g. on screen focus, or every 30–60s while a proof is pending) to detect admin approval/rejection — there's no push notification trigger wired to this screen's polling; approval/rejection does send a push (see below) which can also trigger a refresh.

### Push notifications
- `BrandSocialProofApprovedNotification` / `BrandSocialProofRejectedNotification` — standard push + in-app inbox entry, deep link `sada://verification`. Route that deep link to this verification picker/status screen.
- Rejection **never blocks the other 3 routes** — if social proof is rejected, the brand can still submit a commercial register or try the domain route; don't disable the picker after a rejection.
- `kyc_approved` does **not** also fire when this route (or the domain route) verifies the brand — exactly one push per event, always the route-specific one.

## Route 3 — Domain Email

### Start / resend

```
POST /brand/verification/domain-email
```

Request body:

```json
{
  "domain": "mybrand.sy",
  "email": "admin@mybrand.sy"
}
```

- `domain`: required, string, max 255, must look like a real domain (`host.tld`), and **must not be a free webmail or disposable-email provider** (`gmail.com`, `yahoo.com`, `outlook.com`, `icloud.com`, `mailinator.com`, etc. — full list is server-side config, not something the app needs to mirror). Rejecting one of these is a normal `422` on the `domain` field: "Use your company's own domain, not a public email provider" — show it inline, same as any other validation error. No distinct `error_code` for this; it rides the standard `validation_failed` envelope.
- `email`: required, valid email, max 255, **and must end with `@{domain}`** — a cross-field check. If it doesn't, the error comes back on the `email` field (`422`), e.g. `errors.domain_verification_email_mismatch`.

Starting a new one while one is still pending **replaces it** (resend = call this again with the same or new body). Resending is gated two ways:
- **Rate limit:** 3 starts/resends per hour per brand (throttle `brand-domain-verification`) → standard `429 too_many_requests` with `meta.retry_after`.
- **Cooldown:** a resend within 60 seconds of the last one returns `429` with `error_code: domain_verification_cooldown` and `meta.retry_after` (seconds remaining). This is independent of the hourly limit and is what `resend_available_at` below is counting down to.

Response (`201`):

```json
{
  "data": {
    "id": "01J...",
    "domain": "mybrand.sy",
    "email": "admin@mybrand.sy",
    "status": "pending",
    "status_label": "بانتظار التأكيد",
    "expires_at": "2026-10-10T13:00:00Z",
    "verified_at": null,
    "can_resend": false,
    "resend_available_at": "2026-10-10T12:01:00Z"
  }
}
```

### Check status

```
GET /brand/verification/domain-email
```

Returns the brand's **latest attempt** (same shape as the `POST` response above, `status` one of `pending | verified | expired`), or `"data": null` if none has ever been started. This is the endpoint to restore the "check your inbox" state on app restart, and to know whether/when a resend button should be enabled:
- `can_resend: true` once the cooldown has passed and the brand isn't already verified; `false` (with `resend_available_at` set) while the cooldown is still counting down.
- `status: "expired"` once `expires_at` has passed without the link being clicked — the resend button should still work from this state (it starts a fresh attempt + cooldown).
- Poll this on screen focus; verification itself always resolves from the email link, outside the app, so there's no faster signal than polling (plus the push below, once it lands).

### The email link itself (not an app concern)

```
GET /brand/verification/domain-email/verify/{token}
```

This is a **public, unauthenticated, browser-rendered HTML page** (not JSON, not something the app calls). It's what the confirmation email links to. It renders a success/expired/invalid message and nothing else. Mobile doesn't need to handle this route at all — just know it exists so a universal/app link rule doesn't accidentally try to intercept `…/brand/verification/domain-email/verify/*` into the app (it should open in a normal browser).

### Push notification

Clicking the email link now also sends a push: `brand_domain_verified`, deep link `sada://verification`, entity id = the verification attempt's id. Route it the same as the social-proof pushes.

## Error codes (all 4 routes)

| `error_code` | HTTP | Meaning | Where it happens |
|---|---|---|---|
| `kyc_already_verified` | 409 | Brand already verified; this start endpoint can't be used again. | Any start endpoint (document, social-dm, domain-email) |
| `social_proof_not_pending` | 409 | Admin tried to approve/reject one that's already resolved — admin console concern, not mobile. | Admin approve/reject |
| `domain_verification_cooldown` | 429 | Resent within the 60-second cooldown. `meta.retry_after` has the seconds left. | `POST /brand/verification/domain-email` |
| `too_many_requests` | 429 | Hourly rate limit hit (5/hour social-dm, 3/hour domain-email, 5/hour document). `meta.retry_after` set. | Any start endpoint |
| `domain_verification_token_invalid` | — | Rendered as the "Invalid link" HTML page, not a JSON error the app sees. | Public verify link only |
| `domain_verification_expired` | — | Rendered as the "Link expired" HTML page. | Public verify link only |
| `forbidden_user_type` | 403 | Non-brand hit a brand-only verification endpoint. | Any route, wrong user type |
| standard `422` validation | 422 | Bad platform/url/domain/email, including the page-url-host and public-provider-domain checks above. | Start endpoints |

## `method` on the KYC surfaces

`GET /user/kyc` and `GET /user/me` (`data.kyc`) both now include:

```json
"method": "commercial_registry | social_dm_proof | personal_id | domain_email | null",
"method_label": "السجل التجاري / الترخيص"
```

- Once verified, `method` is whichever route got approved (updates if the brand later passes a stronger route).
- Before anything is approved, `method` reflects whichever route currently has a pending attempt (document pending → `commercial_registry`/`personal_id` by document type; social proof pending → `social_dm_proof`; domain email pending and not yet expired → `domain_email`).
- `null` when there's nothing pending and nothing approved. Use `method_label` for display; `method` is for icon/branch logic only — don't parse `message`.

## Admin-side (for reference only — admin console team's screens, not mobile)

- `GET /admin/brand-social-proofs` — paginated queue (`data.items`, `data.meta`), filters `status`/`platform`/`per_page`.
- `GET /admin/brand-social-proofs/{id}` — single proof with nested `brand.company_name` and `brand.user`.
- `POST /admin/brand-social-proofs/{id}/approve` — no body.
- `POST /admin/brand-social-proofs/{id}/reject` — body `{"reason": "..."}`, required.

## Resolved: interaction between routes

- **Already verified:** all 3 new-route and the document-upload start endpoints return `kyc_already_verified` (409) once the brand is verified.
- **Document upload pending → starting social or domain:** allowed. The 4 routes are fully parallel; a pending document submission never blocks starting another route.
- **`kyc_status` while only a social or domain attempt is pending:** stays `unverified` (or whatever it already was) — only an **approved** route flips it to `verified`. Use the new `method`/`method_label` fields above to show "verification in progress" copy instead of relying on `kyc_status`.
- **`page_url` host check:** now enforced server-side (see Route 2) — the app's own check is still worth keeping for instant feedback, but the server is the source of truth.
- **Brand onboarding step 3 / `is_skipped`:** if the brand starts social or domain from the new picker and the app sends step 3 with `is_skipped=1` to advance, `GET /onboarding/progress`'s `has_kyc_submission` now reports `true` as soon as *any* route (document, social, or domain) has an attempt on record — not just a document upload. The onboarding "KYC" step is considered taken either way.
- **"4 routes" vs "3 API routes":** confirmed — 3 API route groups (`/user/kyc`, `/brand/verification/social-dm`, `/brand/verification/domain-email`) back the 4 UI options, since the document route now covers both "commercial registry" and "owner ID/passport" picks via `kyc_document_type`.
- **Pending social codes:** confirmed — a pending code never expires and stays valid until the brand replaces it by starting a new one.

## Localization

New enum labels (`enums.company_verification_method_*`, `enums.kyc_document_owner_national_id`, `enums.kyc_document_owner_passport`, `enums.domain_verification_status_*`) and notification/error copy already exist in both `lang/ar/*` and `lang/en/*` — nothing new for mobile to translate, just read `*_label` fields from the API responses rather than hardcoding strings.
