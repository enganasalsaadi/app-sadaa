# Mobile Contract — Profile, Account, Social Lookup, KYC, Push

Audience: Sadaa React Native app (`mobile/sadaa/src`).
Backend source of truth: `api/docs/plans/profile-account/backend-plan.md`.
Base URL: `/api/v1`. All requests send `Authorization: Bearer <token>` (except public ones) and `Accept-Language: ar|en`.
Status: LOCKED (2026-10-01), revised by the hardening pass (§0.1, backend-plan §16). Any change must be mirrored in `backend-plan.md`.
**§17 Media Kit is LOCKED (2026-10-06, implemented in the backend).** Source: `docs/mobile-handoff.md` Appendix.
**§6 Rate Cards v2 (2026-10-08, live).** Source: `docs/mobile-handoff-rate-cards.md`. Replaces `service_type` and the `/lookups` `service_types` list.
Wire order for mobile: §0.1 changelog → §1 errors → §15 Registration & Auth → §16 edge cases → rest.

---

## 0. Breaking changes summary (do these first)

| # | Change | Mobile files |
|---|--------|--------------|
| B1 | Every error now uses the envelope (see §1). 422 `errors` stays an object `{field: [msg]}`. New statuses the app must pass to the caller (not global handlers): **409**, **429**. | `core/api/baseApi.ts` (lines 176-182 add 409, 429), `core/api/errorHandler.ts` (read `error_code` into `AppApiError.code`, read `meta.retry_after`), `core/api/types.ts:27` (`errors` is object, add `error_code`) |
| B2 | IDs are ULID **strings**, not numbers. | `domains/auth/store/authTypes.ts:30` (`User.id: string`) |
| B3 | `GET /user/me` returns new `Me` shape (§3.1). Old travel template `User` fields gone. | `authTypes.ts`, `domains/auth/api/authApi.ts:75`, `ProfileScreen`, `HomeScreen` |
| B4 | Influencer step 2 body changed: `follower_tier` optional, `username` renamed `handle`, new `is_primary`. App must call `POST /social/lookup` first (§4). | `InfluencerSocialsScreen`, `PlatformAccountSheet.tsx`, `FollowerTierPicker.tsx`, `useInfluencerSocialsScreen.ts:151-165`, `utils/socialsDraft.ts` |
| B5 | Influencer step 3 no longer completes onboarding. New **step 4 = KYC** (skippable). | `InfluencerOnboardingNavigator.tsx`, `utils/resolveInfluencerOnboardingStep.ts`, new `InfluencerKycScreen` |
| B6 | Brand step 3 `kyc_document_type` is an enum now (`commercial_register` still valid). | none required; optional picker |
| B7 | User `status` loses `pending_kyc`. Values: `draft`, `active`, `suspended`. KYC state only in `kyc_status`. | anywhere checking `pending_kyc` |
| B8 | Template endpoints replaced: `/account/profile` and `/account/avatar` become the routes in §6. `/auth/fcm/register` becomes `POST /user/devices`. | `domains/identity/api/accountApi.ts`, `domains/auth/api/authApi.ts:50`, `core/notification/fcmTokenService.ts` |
| B9 | `/lookups` `social_platforms[]` gains `supports_lookup: boolean`; `follower_tiers` ranges come from server config. | `core/api/lookupsApi.ts:5-27` |

### 0.1 Changelog — hardening pass (act on every row)

| # | Area | Before | After |
|---|---|---|---|
| H1 | `phone.verified` guard | 403 `error_code: "PHONE_NOT_VERIFIED"` | 403 `error_code: "phone_not_verified"` (lowercase, like all codes). Any screen → route to OTP (§15.4). |
| H2 | `AuthResource` (login, brand/influencer step-1) | no `is_phone_verified`; `is_onboarding_complete = status != draft` | adds `is_phone_verified: boolean`; `is_onboarding_complete` = active, or suspended that already reached its final step. Use it directly to route after login (§15.11). |
| H3 | OTP | hardcoded 4 digits / `1234`, no attempt limit, no cooldown | Config-driven: **4 digits now** (may become 6 — build length-agnostic), TTL 15 min, resend cooldown 60 s, 5 wrong attempts → code dead, must resend. Dev/staging code is fixed `1234` until SMS is wired. |
| H4 | `POST /auth/resend-otp`, `POST /auth/forgot-password` | could reveal unknown phone | **always 200** with generic `messages.otp_sent_generic`, even for unknown phones. Within cooldown → **429 `otp_cooldown`** + `meta.retry_after` (s). |
| H5 | `POST /auth/verify-otp`, `POST /auth/reset-password` | — | unknown phone → 422 `errors.code` (identical to wrong code). |
| H6 | Rate limits | none on auth | login 5/min (phone+IP); verify-otp + reset-password share 5/min (phone+IP); resend-otp + forgot-password share 5 per 10 min per phone and 20/h per IP → 429 `too_many_requests` + `meta.retry_after`. |
| H7 | `POST /auth/reset-password` | kept sessions | revokes **all** tokens and all device tokens → go to Login. Do **not** call verify-otp before it (that consumes the code). |
| H8 | Onboarding steps 2–4 | only `auth` (+`phone.verified` on step 2) | `auth` + `account.active` + `phone.verified` + `user.type` on **all** of steps 2–4. Wrong type → 403 `forbidden_user_type`; suspended → 403 `account_suspended`. |
| H9 | Step order | any order | step N requires `current_step >= N-1` → else **409 `onboarding_step_out_of_order`**. Re-submitting an earlier step is allowed; `current_step` never decreases. |
| H10 | Onboarding responses | §5.2 said progress resource | Influencer step-2/3/4 return `InfluencerProfileResource`; brand step-2/3 return `BrandProfileResource` (§15.6–15.9). |
| H11 | `GET /onboarding/progress` | `has_uploaded_kyc`, `has_national_id` | **removed** → use `has_kyc_submission`. `is_kyc_approved` now = `kyc_status === verified`. |
| H12 | Brand step-3 | skip = no file | new optional `is_skipped` (boolean). `kyc_document_type` required when `kyc_document` sent; type sent without file and not skipped → 422 `kyc_document`. Files `jpeg,png,pdf` only (no webp). |
| H13 | Brand step-2 / `PATCH /brand/profile` | `social_links.*.platform` free text | must be a `platform` enum value; `url` valid URL ≤ 2048. |
| H14 | Influencer platforms | — | `platforms.*.is_available` (step-2) and `is_available` (`POST /influencer/platforms`) accepted (boolean, default `true`). |
| H15 | `PATCH /influencer/platforms/{id}/primary` | allowed on any | rejected platform → **409 `platform_not_eligible_for_primary`**. |
| H16 | Tier | all platforms | `influencer_tier` counts only available **and** non-rejected platforms (toggling availability can change tier). |
| H17 | Avatar | size only | also max 4096×4096 px → 422 `avatar`. |
| H18 | KYC rate limit | none | `kyc-submit` 5/h per user, **shared** by `POST /user/kyc`, brand step-3, influencer step-4 (every request counts, incl. skips and 422s) → 429. |
| H19 | `/user/*` | suspended could read | **all** `/user/*` → 403 `account_suspended` for suspended accounts. `POST /auth/logout` and `GET /onboarding/progress` still work. |
| H20 | Login when suspended | — | 422 `validation_failed`, `errors.phone = ["This account has been suspended"]` (not 403). Same error_code as wrong password — show `errors.phone[0]`. |
| H21 | Doc fixes (no backend change) | examples `"food"`, `"restaurant"` | invalid values → real enums `food_cooking`, `fnb`. `GET /lookups` now documented (§15.1). |

---

## 1. Envelope

Success:
```json
{ "success": true, "message": "تمت العملية بنجاح", "data": { }, "meta": { "locale": "ar" } }
```
Error:
```json
{ "success": false, "message": "localized text", "error_code": "kyc_already_pending", "errors": null, "meta": { "locale": "ar" } }
```
Validation (422):
```json
{ "success": false, "message": "...", "error_code": "validation_failed",
  "errors": { "platforms.0.handle": ["هذا الحساب مرتبط بحساب آخر"] }, "meta": { "locale": "ar" } }
```
Rate limit (429): `error_code: "too_many_requests"`, `meta.retry_after: 1800` (seconds).
OTP cooldown (429):
```json
{ "success": false, "message": "Please wait 42 seconds before requesting a new code", "error_code": "otp_cooldown",
  "errors": null, "meta": { "locale": "en", "retry_after": 42 } }
```
`errors` is `null` for every non-422 error. `message` is always localized — safe to show as-is.

### Error codes (complete — `app/Enums/ApiErrorCode.php`)
| HTTP | error_code | Thrown by | App action |
|---|---|---|---|
| 401 | `unauthenticated` | any `auth:sanctum` route, missing/revoked token (e.g. after reset-password) | clear token → Login |
| 403 | `forbidden` | authorization failures; `POST /user/notifications/test` when disabled | toast |
| 403 | `forbidden_user_type` | `user.type` guard: onboarding steps 2–4 of the other type, `/influencer/*`, `/social/*`, `/brand/*`, `/user/kyc`, `/user/avatar`, `/admin/*` | toast; indicates app routing bug |
| 403 | `account_suspended` | `account.active` guard: all `/user/*`, `/social/*`, `/influencer/*`, `/brand/*`, onboarding steps 2–4, `/admin/*` | suspended screen, block app (logout still works) |
| 403 | `phone_not_verified` | `phone.verified` guard: onboarding steps 2–4, `/social/*`, `/influencer/*`, `/brand/profile` | route to OTP screen (§15.4) |
| 404 | `not_found` | unknown ULID / route | toast / back |
| 409 | `onboarding_step_out_of_order` | onboarding step N when `current_step < N-1` | refetch `GET /onboarding/progress`, route (§15.11) |
| 409 | `kyc_already_pending` | `POST /user/kyc`, brand step-3 (with document), influencer step-4 (not skipped) | refetch progress / `/user/kyc`; show "under review" |
| 409 | `kyc_already_verified` | same as above | refetch; nothing to upload |
| 409 | `platform_already_exists` | `POST /influencer/platforms` (same platform) | field error |
| 409 | `last_platform` | `DELETE /influencer/platforms/{id}` (only one left) | toast |
| 409 | `platform_not_eligible_for_primary` | `PATCH /influencer/platforms/{id}/primary` on rejected platform; also step-2 if the `is_primary` row is an existing rejected platform | toast; edit the platform first |
| 409 | `social_lookup_unavailable` | `POST /influencer/platforms/{id}/refresh` | toast "try later" |
| 409 | `kyc_submission_not_pending`, `platform_not_pending_review` | admin API only | – |
| 422 | `validation_failed` | every FormRequest; also login wrong credentials / suspended (`errors.phone`), wrong/expired/exhausted OTP or unknown phone (`errors.code`) | `applyServerFieldErrors` |
| 429 | `too_many_requests` | named throttles (table below); social lookup quota | "try again in X" from `meta.retry_after` |
| 429 | `otp_cooldown` | `POST /auth/resend-otp`, `POST /auth/forgot-password` within 60 s of last send (per phone + OTP type) | start countdown = `meta.retry_after` |
| 500 | `server_error` | unexpected | generic toast |

Pass 409 / 429 to the calling screen (not global handlers). Map `error_code` → `AppApiError.code`, `meta.retry_after` → `AppApiError.retryAfter`.

### Rate limits (every request counts, including 422s)
| Limiter | Routes | Limit | Key |
|---|---|---|---|
| `auth-login` | `POST /auth/login` | 5 / min | phone + IP |
| `otp-verify` | `POST /auth/verify-otp`, `POST /auth/reset-password` (shared) | 5 / min | phone + IP |
| `otp-send` | `POST /auth/resend-otp`, `POST /auth/forgot-password` (shared) | 5 / 10 min per phone **and** 20 / h per IP | phone; IP |
| OTP cooldown | resend-otp, forgot-password (and started by step-1 register) | 1 send / 60 s → `otp_cooldown` | phone + OTP type |
| `kyc-submit` | `POST /user/kyc`, brand step-3, influencer step-4 (shared) | 5 / h | user |
| `avatar` | `POST /user/avatar` | 10 / h | user |
| `password-change` | `PUT /user/password` | 5 / min | user |
| `push-test` | `POST /user/notifications/test` | 10 / h | user |

---

## 2. Enums (values sent/received)

- `user_type`: `influencer`, `brand` (`admin` never used by app)
- `status`: `draft`, `active`, `suspended`
- `kyc_status`: `unverified`, `pending`, `verified`, `rejected`
- `follower_tier`: `NANO`, `MICRO`, `MID_TIER`, `MACRO`, `MEGA`
- `platform`: `instagram`, `facebook`, `tiktok`, `youtube`, `telegram`, `website`
- `tier_source`: `auto` (Bright Data), `manual` (user picked)
- `verification_status` (platform): `auto_verified`, `pending_review`, `approved`, `rejected`
- `kyc_document_type`: `national_id` (influencer, implicit), `commercial_register`, `industrial_register`, `trade_license` (brand)
- `service` (rate cards, §6): catalog keys `reel`, `story`, `feed_post`, `post`, `video`, `shorts`, `integrated_mention`, `dedicated_video`, `channel_post`, `article`, `on_site_visit`. Read the offer per platform from the catalog (§6.1), never hardcode it.

---

## 3. Me & Profile

### 3.1 `GET /user/me` — Home / app launch (lean)
Use for: Home header (name + avatar + primary tier), completion cards, capability gates, unread badge. Refetch after any profile/platform/KYC mutation (tag `User`).

Influencer:
```json
{
  "id": "01J9...",
  "user_type": "influencer",
  "status": "active",
  "kyc_status": "rejected",
  "current_step": 4,
  "is_onboarding_complete": true,
  "is_phone_verified": true,
  "phone": "+963962401604",
  "email": "a@b.com",
  "display_name": "Anas",
  "avatar_url": "https://.../avatars/01J9.../01JA....webp",
  "influencer_tier": "MICRO",
  "primary_platform": {
    "id": "01J9...", "platform": "instagram", "username": "anas",
    "follower_count": 45210, "follower_tier": "MICRO", "is_available": true,
    "verification_status": "auto_verified"
  },
  "platforms_review_status": "under_review",
  "kyc": { "status": "rejected", "rejection_reason": "الصورة غير واضحة", "submitted_at": "2026-10-01T10:00:00Z", "reviewed_at": "2026-10-02T09:00:00Z" },
  "profile_completion": {
    "percentage": 55, "earned_points": 55, "total_points": 100,
    "steps": [
      { "key": "account_created",    "points": 10, "completed": true,  "status": null },
      { "key": "basic_info",         "points": 10, "completed": false, "status": null },
      { "key": "avatar",             "points": 10, "completed": true,  "status": null },
      { "key": "email",              "points": 5,  "completed": true,  "status": null },
      { "key": "platforms",          "points": 15, "completed": true,  "status": null },
      { "key": "platforms_verified", "points": 10, "completed": false, "status": "under_review" },
      { "key": "rate_cards",         "points": 20, "completed": false, "status": null },
      { "key": "kyc",                "points": 20, "completed": false, "status": "rejected" }
    ]
  },
  "capabilities": {
    "apply_to_briefs":  { "allowed": true,  "reason": null },
    "receive_requests": { "allowed": false, "reason": "rate_card_required" },
    "accept_offers":    { "allowed": false, "reason": "kyc_rejected" }
  },
  "unread_notifications_count": 2
}
```
Brand differences: `display_name` = company name; `influencer_tier`, `primary_platform`, `platforms_review_status` are `null`; steps = `account_created` 10, `company_info` 15, `avatar` 15, `email` 10, `social_links` 15, `kyc` 35; capabilities = `create_campaigns`, `request_services`, `fund_deals` (KYC required).

`primary_platform` can be `null` (no platforms). `platforms_review_status`: `verified` | `under_review` | `action_required` (some rejected).

**Completion cards (Home):** render one card per step where `completed=false`, in array order. The app owns texts/icons/CTA per `key`:
| key | CTA screen |
|---|---|
| `basic_info` | Edit profile |
| `avatar` | Avatar picker |
| `email` | Edit profile |
| `platforms` | Platforms |
| `platforms_verified` | Platforms (show `status`) |
| `rate_cards` | Rate cards |
| `kyc` | KYC (`status`: `unverified` = upload, `pending` = "under review" no CTA, `rejected` = show `kyc.rejection_reason` + re-upload) |
| `company_info`, `social_links` | Brand edit profile |

**Capability reasons** (show blocker text / CTA): `account_suspended`, `onboarding_incomplete`, `kyc_required`, `kyc_pending`, `kyc_rejected`, `no_available_platform`, `rate_card_required`. Server always enforces too — these flags are for UI only.

### 3.2 `GET /user/profile` — edit screens (full)
Influencer:
```json
{
  "id": "01J9...", "user_type": "influencer", "phone": "+963...", "email": "a@b.com",
  "avatar_url": "https://...webp",
  "profile": {
    "full_name": "Anas", "governorate": "damascus", "governorate_label": "دمشق",
    "area": "المزة", "niches": ["fashion", "food_cooking"],
    "primary_platform_id": "01J9...", "primary_platform_locked": true,
    "platforms": [ /* PlatformResource §5.1 */ ],
    "rate_cards": [ /* RateCard §6.3 */ ]
  }
}
```
Brand `profile`: `company_name`, `governorate`, `governorate_label`, `business_type`, `business_type_label`, `social_links: [{platform, url}]`.

---

## 4. Social lookup (new) — `POST /social/lookup`

Auth required (works during onboarding after phone verify). Call when user finishes typing a handle (debounce, or on "Check" button). **Synchronous, may take up to 30s → show spinner, set fetch timeout ≥ 35s.**

Body:
```json
{ "platform": "instagram", "handle": "https://www.instagram.com/anas/?hl=en", "refresh": false }
```
`handle` accepts username, `@username` or full URL. `refresh: true` only from a "Refresh" button (max 2/hour → 429).

Response 200 (always 200 for lookup outcomes — branch on `data.status`):
```json
{
  "status": "found",
  "source": "cache",
  "manual_entry_allowed": false,
  "already_claimed": false,
  "profile": {
    "platform": "instagram", "username": "anas", "display_name": "Anas",
    "follower_count": 45210, "follower_tier": "MICRO", "is_verified_account": false,
    "profile_url": "https://instagram.com/anas", "avatar_url": "https://...", "fetched_at": "2026-10-01T10:00:00Z"
  }
}
```
| `status` | Meaning | UI |
|---|---|---|
| `found` | Data available. | Show card (avatar, name, followers, tier). Tier locked (no picker). |
| `not_found` | Account does not exist / private. | Error under field "account not found, check username" + allow manual tier picker. |
| `unavailable` | Provider down, timeout, or monthly credits exhausted. | Info "could not verify automatically" + manual tier picker. |
| `manual_required` | Platform has no lookup (`telegram`, `website`). | Show tier picker directly (skip lookup call: use `/lookups` `supports_lookup=false`). |

`profile` is `null` unless `found`. `already_claimed: true` → handle linked to another influencer, show error, block submit (one handle = one influencer).

Manual tier = platform saved as `pending_review` → admin reviews. Show badge "under review". A `pending_review` platform still counts for `apply_to_briefs` / `receive_requests`; brands see the tier with an "under review" badge. A `rejected` platform does not count (not primary, not searchable) until the influencer edits it (handle or tier change sends it back to `pending_review`).

Errors: 422 (`platform`, `handle`), 429 `too_many_requests`.

---

## 5. Platforms

### 5.1 PlatformResource
```json
{
  "id": "01J9...", "platform": "instagram", "platform_label": "إنستغرام",
  "username": "anas", "profile_url": "https://instagram.com/anas", "display_name": "Anas",
  "follower_count": 45210, "follower_tier": "MICRO", "follower_tier_label": "مايكرو",
  "tier_source": "auto", "verification_status": "auto_verified", "rejection_reason": null,
  "is_primary": true, "is_available": true, "supports_lookup": true,
  "last_synced_at": "2026-10-01T10:00:00Z"
}
```
`follower_count` is `null` for manual platforms.

### 5.2 Register step 2 (changed) — `POST /onboarding/influencer/step-2`
```json
{
  "niches": ["fashion", "food_cooking"],
  "platforms": [
    { "platform": "instagram", "handle": "anas", "is_primary": true },
    { "platform": "telegram",  "handle": "anas_channel", "follower_tier": "MICRO", "is_available": false }
  ]
}
```
Rules:
- Guards: `auth` + `account.active` + `phone.verified` + `user.type:influencer`; needs `current_step >= 1` (§15.6).
- `niches` 1–3 values of `/lookups` `niches[].id`.
- `platforms` min 1, `platform` distinct (one account per platform). `handle` string ≤ 255. `is_primary`, `is_available` optional booleans (`is_available` default `true`).
- Platform with a `found` lookup: send without `follower_tier` (server uses stored data; if sent it is ignored).
- Platform without lookup data: `follower_tier` required → 422 `platforms.N.follower_tier`.
- `is_primary` max one `true` (422 `platforms`). None → server picks highest tier.
- Server does **not** call Bright Data here; lookup must be done before.
- Response 200: **`InfluencerProfileResource`** (not the progress resource): `{ full_name, governorate, governorate_label, area, niches, has_kyc_id, platforms: PlatformResource[] }` — **no `rate_cards` key** in this response.

Errors 422: `niches`, `niches.N`, `platforms`, `platforms.N.platform`, `platforms.N.handle` (claimed / invalid), `platforms.N.follower_tier`, `platforms.N.is_primary`, `platforms.N.is_available`. 403 `phone_not_verified` / `forbidden_user_type` / `account_suspended`. 409 `onboarding_step_out_of_order`, `platform_not_eligible_for_primary`.

### 5.3 In-app platform management
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/influencer/platforms` | – | PlatformResource[] |
| POST | `/influencer/platforms` | `{platform, handle, follower_tier?, is_primary?, is_available?}` (booleans; `is_available` default `true`) | 201 PlatformResource |
| PATCH | `/influencer/platforms/{id}` | `{handle, follower_tier?}` (change handle — re-lookup first) | PlatformResource |
| DELETE | `/influencer/platforms/{id}` | – | 200 `null` (its rate cards are deleted too — warn user) |
| PATCH | `/influencer/platforms/{id}/primary` | – | PlatformResource[] (all, primary flags updated) |
| PATCH | `/influencer/platforms/{id}/availability` | `{is_available: false}` (required boolean) | PlatformResource[] (primary + `influencer_tier` recalculated — refetch `/me`) |
| POST | `/influencer/platforms/{id}/refresh` | – | PlatformResource (429 if >2/hour; `unavailable` → 409 `social_lookup_unavailable`) |

Errors: 409 `platform_already_exists` (POST same platform), 409 `last_platform` (delete only platform), 409 `platform_not_eligible_for_primary` (PATCH primary on a `rejected` platform — hide the "Make primary" action for rejected rows), 404, 422 as in 5.2. All routes: 403 `phone_not_verified` / `forbidden_user_type` / `account_suspended`.
Unavailable platform: stays visible on profile, brands cannot send requests on it. Primary may be unavailable. `influencer_tier` = highest tier among platforms that are **available and not rejected** (null if none).

---

## 6. Rate cards (v2)

Since the v2 release every old card was deleted and `has_rate_card` is `false` for every creator. Show "Set up your prices" while `capabilities.receive_requests.reason === "rate_card_required"` or the `rate_cards` completion step is open (§3.1); it clears as soon as one card is saved.

### 6.1 Catalog — `GET /lookups/rate-card-catalog` (public)
Localized by `Accept-Language`. `ETag` + `If-None-Match` → 304. The app keeps the last copy per language (MMKV), revalidates once per session and falls back to it offline.
```jsonc
{
  "catalog_version": "1",
  "price_bounds": { "min_usd": 5, "max_usd": 50000 },
  "platforms": [ { "key": "instagram", "label": "Instagram", "services": [ /* CatalogService */ ] } ],
  "platform_agnostic_services": [ /* on_site_visit */ ],
  "addons": [ { "type": "rush_delivery", "label": "Rush delivery",
                "pricing_modes": [ { "key": "fixed", "label": "Fixed amount", "min": 0.01, "max": 50000 } ],
                "options": [ { "key": "delivery_hours", "options": [ { "value": 24 }, { "value": 48 } ], "default": 48, "visible": true } ] } ],
  "contract_terms": { "version": "v1", "items": [ { "key": "organic_only", "text": "…" } ] }
}
```
`CatalogService`: `key`, `label`, `package` (`null` = one card per service; else `{ key, label, type: "options", options: [{value,label}], default }`), `criteria` (`delivery_days {label,min,max,default}`, `revisions {label,options,default}`, `retention {label,options,default,minimum} | null`), `attributes` (hide and never send `visible: false`, all of them in v1), `addons` (add-on types allowed).
Editor rules: services of the linked platforms + platform-free ones; package shown when not null; retention only when not null; rush only where the service lists `rush_delivery`, 24h needs `delivery_days ≥ 2`, 48h needs `≥ 3`. Labels always from the catalog.

### 6.2 Endpoints (influencer only)
| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/influencer/rate-cards` | — | 200 list |
| POST | `/influencer/rate-cards` | `RateCardInput` | 201 card |
| PATCH | `/influencer/rate-cards/{id}` | changed fields only | 200 card |
| DELETE | `/influencer/rate-cards/{id}` | — | 200, `data: null` |
| PUT | `/influencer/rate-cards` | `{ rate_cards: RateCardInput[] }` | 200 list (bulk upsert by slot, ids kept; not used by the app yet) |

`RateCardInput`: `platform` (`null` for `on_site_visit`), `service`, `package_value` (required when the service has a package), `price_usd` (5 – 50000, ≤ 2 decimals), optional `delivery_days`, `revisions`, `retention` (never for on-site), `addons: [{ type, pricing_mode, amount, options: { delivery_hours } }]`.
PATCH rejects `platform` and `service` (delete + create instead); `addons`, when sent, replaces the whole list (`[]` removes all). Another creator's card id → 404.

### 6.3 `RateCard` (editor and media kit share it)
```json
{ "id": "01k…", "slot_key": "instagram:reel:60", "platform": "instagram",
  "service": { "key": "reel", "label": "Reel" },
  "package": { "key": "duration_sec", "value": 60, "label": "Up to 60 seconds" },
  "price_usd": 120, "delivery_days": 5, "revisions": 1,
  "retention": { "key": "30d", "label": "30 days" },
  "attributes": [ { "key": "collab_post", "label": "Collab post", "value": false, "value_label": "Not included" } ],
  "addons": [ { "type": "rush_delivery", "label": "Rush delivery", "pricing_mode": "fixed", "amount": 30, "computed_price_usd": 30, "options": { "delivery_hours": 48 } } ],
  "includes": [ "Up to 60 seconds", "Delivered within 5 days", "1 revision round", "Stays live: 30 days" ] }
```
`platform`, `package`, `retention` can be `null`. `includes` is localized, ready to render.

### 6.4 Validation (422)
Keys: `platform`, `service` (also "slot already priced"), `package_value`, `price_usd`, `delivery_days`, `revisions`, `retention`, `attributes.{key}`, `addons.{n}.type|pricing_mode|amount|options.{key}` (rush not faster than delivery). PUT and step 3 prefix them with `rate_cards.{i}.`; bulk saves are all-or-nothing.

---

## 7. KYC

### 7.1 Influencer register step 4 (new) — `POST /onboarding/influencer/step-4` (multipart)
| Field | Rule |
|---|---|
| `is_skipped` | optional boolean — multipart `"1"` / `"0"` (string `"true"` is rejected by the `boolean` rule) |
| `id_front` | file jpeg/png/webp/pdf ≤ 10MB, required unless skipped |
| `id_back` | same |
Both outcomes finish onboarding (`is_onboarding_complete: true`, `status: active`, `current_step: 4`). Requires `current_step >= 3` (else 409 `onboarding_step_out_of_order`). Throttle `kyc-submit` (5/h, shared, §1) → 429.
Response 200: `InfluencerProfileResource` with **both** `platforms` and `rate_cards`, plus `has_kyc_id` (true when a KYC submission exists).
Errors: 422 `id_front`, `id_back`, `is_skipped`; 409 `kyc_already_pending` / `kyc_already_verified` (only when not skipped — on retry-after-timeout refetch progress; if complete, continue); 403 guards as §1; 429.

Step resolver: replaced by §15.11 (route by `current_step`, not by data presence).

### 7.2 Brand register step 3 — `POST /onboarding/brand/step-3` (multipart)
| Field | Rule |
|---|---|
| `is_skipped` | optional boolean (`"1"`/`"0"`) — **new** |
| `kyc_document_type` | `commercial_register` \| `industrial_register` \| `trade_license`; required when `kyc_document` is sent |
| `kyc_document` | file **jpeg/png/pdf** (no webp) ≤ 10MB; required when `kyc_document_type` is sent and not skipped |
Skip = send nothing, or `is_skipped=1` (then do not send a file). Both outcomes finish onboarding (`status: active`, `current_step: 3`). Requires `current_step >= 2`.
Response 200: `BrandProfileResource` (§15.9). Errors: 422 `kyc_document_type`, `kyc_document`, `is_skipped`; 409 `kyc_already_pending` / `kyc_already_verified` (when a document is sent); 409 `onboarding_step_out_of_order`; 403 guards; 429 `kyc-submit`.

### 7.3 In-app — `GET /user/kyc`
```json
{ "status": "rejected", "document_type": "national_id", "rejection_reason": "الصورة غير واضحة",
  "submitted_at": "2026-10-01T10:00:00Z", "reviewed_at": "2026-10-02T09:00:00Z",
  "can_submit": true }
```
`status` = `unverified` when never submitted (other fields null). `can_submit` = status is `unverified` or `rejected`.

### 7.4 In-app — `POST /user/kyc` (multipart)
Influencer: `id_front`, `id_back` (both required, jpeg/png/webp/pdf ≤ 10MB). Brand: `kyc_document_type` (brand enum), `kyc_document` (both required, **jpeg/png/pdf** ≤ 10MB). Response 201 = §7.3 with `status: pending`.
Errors: 409 `kyc_already_pending`, 409 `kyc_already_verified`, 422 file fields, 429 `too_many_requests` (`kyc-submit` 5/h shared with onboarding KYC steps), 403 `account_suspended`.
Result arrives by push (`kyc_approved` / `kyc_rejected`).

---

## 8. Profile edit

### 8.1 `PATCH /influencer/profile` (partial — send only changed fields)
```json
{ "full_name": "Anas", "email": "a@b.com", "governorate": "damascus", "area": "المزة", "niches": ["fashion"] }
```
Rules: `full_name` string ≤255; `email` nullable email unique; `governorate` enum; `area` nullable string ≤255; `niches` 1–3 enum. Response: §3.2.

### 8.2 `PATCH /brand/profile`
```json
{ "company_name": "Sada Co", "email": "info@sada.sy", "governorate": "aleppo", "business_type": "fnb",
  "social_links": [ { "platform": "instagram", "url": "https://instagram.com/sada" } ] }
```
`business_type` ∈ `/lookups` `business_types[].id` (`retail_ecommerce`, `fnb`, `fashion_beauty`, `tech_software`, `services`, `health_wellness`, `education`, `real_estate`, `automotive`, `other`). `social_links` is a full replace; `social_links.*.platform` required `platform` enum value, `social_links.*.url` required valid URL ≤ 2048. Response: §3.2.

Email change applies immediately (no verification).

---

## 9. Avatar / logo

- `POST /user/avatar` multipart field `avatar`: jpeg/png/webp ≤ 5MB, **max 4096×4096 px** (downscale on device before upload). Server crops center 1:1 → 500×500 WebP. Response `{ "avatar_url": "https://..." }`. 422 `avatar`. 429 (10/h).
- `DELETE /user/avatar` → `{ "avatar_url": null }`.
- Same for brand (logo). Optional: crop on device before upload so user sees exact result.

---

## 10. Password & logout

- `PUT /user/password` `{ current_password, password, password_confirmation }` (min 8, must differ). 200. All **other** devices are logged out; current token stays valid. 422 `current_password` wrong.
- `POST /auth/logout` `{ fcm_token?: string }` (nullable, ≤ 512) → revokes current token, removes that device token. Then clear local storage. Works for suspended accounts too (§15.13).
- Forgot / reset password: §15.12.

---

## 11. Push notifications

### 11.1 Device token
- `POST /user/devices` `{ "token": "<fcm>", "platform": "ios|android", "device_id": "optional", "app_version": "1.0.0" }` → 201. Call after login/register (token exists), on `onTokenRefresh`, and when language changes (server stores `Accept-Language` as push language).
- `DELETE /user/devices` `{ "token": "<fcm>" }` → 200.

### 11.2 Payload (FCM `data`, all strings)
```json
{ "type": "kyc_rejected", "entity_id": "01J9...", "deep_link": "sada://kyc" }
```
`notification.title/body` already localized. Types now: `kyc_approved`, `kyc_rejected`, `platform_approved`, `platform_rejected`, `test`. On receive (any): invalidate `User` tag (refetch `/me`).
| type | deep_link | screen |
|---|---|---|
| `kyc_approved` / `kyc_rejected` | `sada://kyc` | KYC status |
| `platform_approved` / `platform_rejected` | `sada://platforms/{entity_id}` | Platforms |
| `test` | `sada://notifications` | Notifications list |

### 11.3 Notification list
- `GET /user/notifications?page=1` → `{ items: [{ id, type, title, body, data, read_at, created_at }], meta: { current_page, last_page, total } }`
- `POST /user/notifications/{id}/read`, `POST /user/notifications/read-all`
- Unread count is in `/me` (`unread_notifications_count`).

### 11.4 Test push (dev/staging only)
`POST /user/notifications/test` → sends to all your devices now:
```json
{ "sent": 1, "failed": 0, "devices": [ { "platform": "android", "token_suffix": "...a9F2", "ok": true, "error": null } ] }
```
403 `forbidden` when disabled in production.

---

## 12. Admin (reference only — not in app)
`/v1/admin/kyc-submissions`, `/v1/admin/platform-reviews` (list/show/approve/reject). Results reach the app via push + `/me`.

Auth: `auth:sanctum` + `account.active` + `user.type:admin` (403 `forbidden_user_type` / `account_suspended`). Admin created by `php artisan sada:create-admin {phone} {name}`, logs in via `/v1/auth/login`.

| Method | Path | Body / query | Notes |
|---|---|---|---|
| GET | `/admin/kyc-submissions` | `status` (`pending` default \| `approved` \| `rejected`), `user_type` (`influencer`\|`brand`), `per_page` 1–100 (20) | pending oldest first, others newest first |
| GET | `/admin/kyc-submissions/{id}` | – | adds `documents[]` `{id, side, mime, size, url}` (signed, 10 min) |
| POST | `/admin/kyc-submissions/{id}/approve` | – | user `kyc_status=verified`, push `kyc_approved` |
| POST | `/admin/kyc-submissions/{id}/reject` | `reason` required 3–1000 | user `kyc_status=rejected`, push `kyc_rejected` |
| GET | `/admin/platform-reviews` | `status` (`pending_review` default \| `approved` \| `rejected`), `platform`, `per_page` | pending oldest-updated first |
| GET | `/admin/platform-reviews/{id}` | – | |
| POST | `/admin/platform-reviews/{id}/approve` | `follower_tier?`, `follower_count?` (count alone → tier from `social.tiers`) | recalculates tier + primary, push `platform_approved` |
| POST | `/admin/platform-reviews/{id}/reject` | `reason` required 3–1000 | rejected locked primary is dropped (auto re-resolve), push `platform_rejected` |

List shape: `data: { items: [...], meta: { current_page, last_page, total } }`.
KYC item: `id, status, status_label, document_type, document_type_label, rejection_reason, submitted_at, reviewed_at, reviewer {id,name}|null, user {id,name,phone,email,user_type,status,kyc_status,avatar_url}`.
Platform item: `id, platform, platform_label, username, profile_url, display_name, follower_count, follower_tier, follower_tier_label, tier_source, verification_status, rejection_reason, is_primary, is_available, supports_lookup, created_at, updated_at, reviewed_at, reviewer, influencer {profile_id, full_name, user {...}}`.
Errors: 409 `kyc_submission_not_pending` (not pending or not the user's latest submission), 409 `platform_not_pending_review`, 404 `not_found`, 422 `validation_failed`.

---

## 13. Suggested mobile TypeScript types
```ts
export type FollowerTierId = 'NANO' | 'MICRO' | 'MID_TIER' | 'MACRO' | 'MEGA';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type PlatformId = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'telegram' | 'website';

export interface Capability { allowed: boolean; reason: string | null; }
export interface CompletionStep { key: string; points: number; completed: boolean; status: string | null; }

export interface Platform {
  id: string; platform: PlatformId; platform_label: string; username: string;
  profile_url: string | null; display_name: string | null;
  follower_count: number | null; follower_tier: FollowerTierId | null; follower_tier_label: string | null;
  tier_source: 'auto' | 'manual';
  verification_status: 'auto_verified' | 'pending_review' | 'approved' | 'rejected';
  rejection_reason: string | null; is_primary: boolean; is_available: boolean;
  supports_lookup: boolean; last_synced_at: string | null;
}

export interface Me {
  id: string; user_type: 'influencer' | 'brand';
  status: 'draft' | 'active' | 'suspended'; kyc_status: KycStatus;
  current_step: number; is_onboarding_complete: boolean; is_phone_verified: boolean;
  phone: string; email: string | null; display_name: string; avatar_url: string | null;
  influencer_tier: FollowerTierId | null;
  primary_platform: Pick<Platform, 'id' | 'platform' | 'username' | 'follower_count' | 'follower_tier' | 'is_available' | 'verification_status'> | null;
  platforms_review_status: 'verified' | 'under_review' | 'action_required' | null;
  kyc: { status: KycStatus; rejection_reason: string | null; submitted_at: string | null; reviewed_at: string | null };
  profile_completion: { percentage: number; earned_points: number; total_points: number; steps: CompletionStep[] };
  capabilities: Record<string, Capability>;
  unread_notifications_count: number;
}

export interface SocialLookupResult {
  status: 'found' | 'not_found' | 'unavailable' | 'manual_required';
  source: 'cache' | 'live' | null;
  manual_entry_allowed: boolean; already_claimed: boolean;
  profile: {
    platform: PlatformId; username: string; display_name: string | null;
    follower_count: number | null; follower_tier: FollowerTierId | null; is_verified_account: boolean;
    profile_url: string | null; avatar_url: string | null; fetched_at: string;
  } | null;
}

export interface InfluencerStep2Platform {
  platform: PlatformId; handle: string; follower_tier?: FollowerTierId; is_primary?: boolean; is_available?: boolean;
}
export type AddPlatformBody = InfluencerStep2Platform; // POST /influencer/platforms

export type ApiErrorCode =
  | 'validation_failed' | 'unauthenticated' | 'forbidden' | 'forbidden_user_type' | 'account_suspended'
  | 'not_found' | 'too_many_requests' | 'otp_cooldown' | 'server_error'
  | 'platform_already_exists' | 'last_platform' | 'social_lookup_unavailable'
  | 'kyc_already_pending' | 'kyc_already_verified' | 'kyc_submission_not_pending' | 'platform_not_pending_review'
  | 'phone_not_verified' | 'onboarding_step_out_of_order' | 'platform_not_eligible_for_primary';

export interface ApiErrorBody {
  success: false; message: string; error_code: ApiErrorCode | null;
  errors: Record<string, string[]> | null;          // object only on 422
  meta: { locale: 'ar' | 'en'; retry_after?: number }; // retry_after (seconds) on 429
}

export type UserType = 'influencer' | 'brand';
export type UserStatus = 'draft' | 'active' | 'suspended';
export type OtpType = 'phone_verification' | 'password_reset';

/** POST /auth/login (200), POST /onboarding/{type}/step-1 (201) */
export interface AuthResult {
  token: string; token_type: 'Bearer'; user_id: string;
  user_type: UserType | 'admin'; status: UserStatus; current_step: number;
  is_phone_verified: boolean;      // NEW
  is_onboarding_complete: boolean; // = User::isOnboardingComplete()
}

export interface LookupItem { id: string; name_ar: string; name_en: string; }
export interface Lookups {
  governorates: LookupItem[]; business_types: LookupItem[]; niches: LookupItem[];
  social_platforms: (LookupItem & { id: PlatformId; supports_lookup: boolean })[];
  follower_tiers: Record<FollowerTierId, { label_ar: string; label_en: string; range: string; min: number; max: number | null }>;
}

/** Rate Cards v2 — full shape in §6.3; app types in `domains/auth/store/rateCardTypes.ts`. */
export type RateService = 'reel' | 'story' | 'feed_post' | 'post' | 'video' | 'shorts' | 'integrated_mention' | 'dedicated_video' | 'channel_post' | 'article' | 'on_site_visit';
export type Retention = '24h' | '30d' | '90d' | '180d' | 'permanent';
export interface RateCardAddon { type: 'rush_delivery' | 'whitelisting' | 'exclusivity' | 'pin' | 'on_site'; label: string; pricing_mode: 'fixed' | 'percent_of_base'; amount: number; computed_price_usd: number; options: Record<string, string | number | boolean>; }
export interface RateCard { id: string; slot_key: string; platform: PlatformId | null; service: { key: RateService; label: string }; package: { key: string; value: string | number; label: string } | null; price_usd: number; delivery_days: number; revisions: number; retention: { key: Retention; label: string } | null; attributes: { key: string; label: string; value: string | number | boolean; value_label: string }[]; addons: RateCardAddon[]; includes: string[]; }

/** influencer step-2/3/4 response + progress.profile (influencer). platforms/rate_cards present only when loaded (see §15). */
export interface InfluencerProfileData {
  full_name: string; governorate: string | null; governorate_label: string | null; area: string | null;
  niches: string[]; has_kyc_id: boolean; platforms?: Platform[]; rate_cards?: RateCard[];
}
/** brand step-2/3 response + progress.profile (brand) */
export interface BrandProfileData {
  company_name: string; governorate: string | null; governorate_label: string | null;
  business_type: string | null; business_type_label: string | null;
  social_links: { platform: PlatformId; url: string }[] | null;
  kyc_document_type: 'commercial_register' | 'industrial_register' | 'trade_license' | null;
  has_kyc_document: boolean;
}

/** GET /onboarding/progress */
export interface OnboardingProgress {
  user_id: string; phone: string; email: string | null; user_type: UserType; status: UserStatus;
  current_step: number; is_phone_verified: boolean;
  is_kyc_approved: boolean; has_kyc_submission: boolean; // has_uploaded_kyc / has_national_id REMOVED
  kyc_status: KycStatus; is_verified: boolean; has_pending_verification: boolean;
  has_rate_card: boolean; calculated_influencer_tier: FollowerTierId | null;
  is_onboarding_complete: boolean;
  profile: InfluencerProfileData | BrandProfileData | null;
}

export interface BrandStep3Body { is_skipped?: '1' | '0'; kyc_document_type?: BrandProfileData['kyc_document_type']; kyc_document?: File; }
export interface InfluencerStep4Body { is_skipped?: '1' | '0'; id_front?: File; id_back?: File; }
```

---

## 14. Register screen behaviour (influencer step 2) — all cases
1. User picks platform. `supports_lookup=false` → show handle + tier picker (manual). Done.
2. Else user types handle → call lookup (spinner, ≤30s).
3. `found` + `already_claimed=false` → show profile card, tier read-only, no picker.
4. `found` + `already_claimed=true` → error, cannot add.
5. `not_found` → field error + "Choose tier manually" option (picker).
6. `unavailable` → info banner + picker.
7. 429 → "Too many lookups, try in X min" + picker allowed.
8. Primary toggle on each platform row (one at most). Hint: "If none chosen we pick your biggest account".
9. Submit step 2 with `handle` (+ `follower_tier` only for manual rows).
10. Manual rows show badge "Under review" after save.

---

## 15. Registration & Auth (wire this first)

Conventions: JSON bodies unless marked multipart. Phone always E.164 `+9639XXXXXXXX` (regex `^\+9639\d{8}$`; local `09…` → 422 `phone`). Booleans in multipart: `"1"` / `"0"` only. Success envelope §1; examples below show `data` only unless noted.

### 15.0 Flow overview
```
Influencer: step-1 (register, OTP auto-sent) → OTP screen = POST /auth/verify-otp → step-2 socials → step-3 rates → step-4 KYC → Home
Brand:      step-1 (register, OTP auto-sent) → OTP screen = POST /auth/verify-otp → step-2 business → step-3 KYC   → Home
```
**There is no onboarding endpoint for OTP.** The "verify phone" screen calls `POST /auth/verify-otp`; `current_step` stays `1`. Onboarding step-2 is business data and requires a verified phone (else 403 `phone_not_verified`).

### 15.1 `GET /lookups` — public, no auth
Labels in both languages (ignores `Accept-Language`). Cache per app session. `supports_lookup` is server-driven (depends on social driver) — never hardcode.
```json
{
  "governorates":    [ { "id": "damascus", "name_ar": "دمشق", "name_en": "Damascus" } ],
  "business_types":  [ { "id": "fnb", "name_ar": "المطاعم والأغذية", "name_en": "Food & Beverage" } ],
  "niches":          [ { "id": "food_cooking", "name_ar": "الطهي والطعام", "name_en": "Food & Cooking" } ],
  "social_platforms":[ { "id": "instagram", "name_ar": "إنستغرام", "name_en": "Instagram", "supports_lookup": true },
                       { "id": "telegram",  "name_ar": "تيليغرام", "name_en": "Telegram",  "supports_lookup": false } ],
  "follower_tiers": {
    "NANO": { "label_ar": "نانو (Nano)", "label_en": "Nano", "range": "1,000 - 10,000", "min": 1000, "max": 10000 },
    "MEGA": { "label_ar": "ميجا (Mega)", "label_en": "Mega", "range": "+1,000,000", "min": 1000000, "max": null }
  }
}
```
Full id sets: governorates `damascus, rif_dimashq, aleppo, homs, hama, lattakia, tartus, idlib, deir_ezzor, raqqa, hasakah, daraa, sweida, quneitra`; niches `beauty_lifestyle, fashion, food_cooking, tech_gaming, fitness_health, travel_tourism, business_finance, education`; business types §8.2; platforms §2; rate card services come from the catalog (§6.1), not `/lookups`; tiers `NANO, MICRO, MID_TIER, MACRO, MEGA` (object keyed by id, not array).

### 15.2 `POST /onboarding/influencer/step-1` — public
| Field | Rule |
|---|---|
| `full_name` | required string ≤ 255 |
| `phone` | required E.164, unique |
| `email` | optional email ≤ 255, unique |
| `password` | required string min 8 (**no** `password_confirmation` required for influencer — confirm on device) |
| `governorate` | required governorate id |

### 15.3 `POST /onboarding/brand/step-1` — public
| Field | Rule |
|---|---|
| `company_name` | required string ≤ 255 |
| `phone` | required E.164, unique |
| `email` | optional email ≤ 255, unique |
| `password` | required string min 8, **`password_confirmation` required** (`confirmed`) |

Both step-1 → **201** `AuthResult`, message `messages.resource_created`:
```json
{ "token": "1|abc...", "token_type": "Bearer", "user_id": "01J9...", "user_type": "influencer",
  "status": "draft", "current_step": 1, "is_phone_verified": false, "is_onboarding_complete": false }
```
Server already sent the phone OTP **and started the 60 s resend cooldown**. Store the token immediately (before navigating), go to OTP screen, start the countdown locally at 60 s — do **not** call resend on entry.
Errors: 422 field errors. `phone` "already taken" → offer "Login instead" (§16). No throttle on step-1.

### 15.4 OTP screen — `POST /auth/verify-otp` — public (no token needed)
Body: `{ "phone": "+963962401604", "code": "1234", "type": "phone_verification" }` — `type` optional (default `phone_verification`; `password_reset` exists but see §15.12). `code` required string of exactly `otp.length` digits (**4 now**).
Response 200: `data: null`, message `messages.otp_verified`. Then set local `is_phone_verified = true` (or refetch progress) and go to step-2.
Errors: 422 `errors.code` — one generic message (`messages.otp_invalid`) for wrong, expired (15 min), already used, exhausted (5 wrong tries) and unknown phone. 422 `errors.code` also for wrong length. 429 `too_many_requests` (5/min, shared with reset-password).

**Screen spec**
- Input length = 4 today; build it length-agnostic (single config constant / server-driven later; may become 6). Numeric keyboard, autofill (`textContentType="oneTimeCode"` / SMS retriever), auto-submit when full.
- Countdown "Resend in 0:SS": starts at 60 after step-1 or after a successful resend; on any 429 `otp_cooldown` restart it from `meta.retry_after`.
- Resend button → `POST /auth/resend-otp` (§15.5). Success shows the generic message.
- After 5 wrong codes the code is dead: every further try returns the same 422. Count 422 `code` responses locally; at 5 → clear input, show "Code expired, request a new one", enable Resend (respect countdown).
- On 429 `too_many_requests` disable submit for `meta.retry_after` s.
- Dev/staging: code is always `1234` (no SMS sent) until the SMS gateway ships.

### 15.5 `POST /auth/resend-otp` — public
Body: `{ "phone": "+963...", "type": "phone_verification" | "password_reset" }` (both required).
Response **always 200** `data: null`, message `messages.otp_sent_generic` ("If this phone number is registered, a verification code has been sent") — even for unknown phones. A new send invalidates the previous unused code of that type.
Errors: 422 `phone`, `type`; 429 `otp_cooldown` (`meta.retry_after` = remaining cooldown s, per phone + type); 429 `too_many_requests` (5 per 10 min per phone, 20/h per IP, shared with forgot-password).

### 15.6 `POST /onboarding/influencer/step-2` — socials
Guards: `auth:sanctum` + `account.active` + `phone.verified` + `user.type:influencer`; needs `current_step >= 1`. Body, rules, errors: §5.2. Response 200 (message `messages.resource_updated`):
```json
{ "full_name": "Anas", "governorate": "damascus", "governorate_label": "دمشق", "area": null,
  "niches": ["fashion", "food_cooking"], "has_kyc_id": false,
  "platforms": [ /* PlatformResource §5.1 */ ] }
```
→ `current_step = max(current_step, 2)`.

### 15.7 `POST /onboarding/brand/step-2` — business info
Guards: same with `user.type:brand`; needs `current_step >= 1`.
```json
{ "governorate": "damascus", "business_type": "fnb",
  "social_links": [ { "platform": "instagram", "url": "https://instagram.com/sada" } ] }
```
Rules: `governorate` required id; `business_type` required id; `social_links` optional array (full replace), each `platform` required platform enum, `url` required URL ≤ 2048.
Response 200 = `BrandProfileResource` (§15.9). → `current_step = max(current_step, 2)`.
Errors: 422 `governorate`, `business_type`, `social_links`, `social_links.N.platform`, `social_links.N.url`; 403 guards; 409 `onboarding_step_out_of_order`.

### 15.8 `POST /onboarding/influencer/step-3` — rate cards
Guards: influencer; needs `current_step >= 2`.
```json
{ "is_skipped": false,
  "rate_cards": [ { "platform": "instagram", "service": "story", "package_value": 3, "price_usd": 40 },
                  { "platform": null, "service": "on_site_visit", "package_value": 4, "price_usd": 200 } ] }
```
or skip `{ "is_skipped": true }`. Only `platform, service, package_value, price_usd, delivery_days` are read; everything else takes the server defaults. Same upsert semantics as the bulk PUT (§6.2). The app sends one package per service and leaves `delivery_days` to the default.
Response 200 = `InfluencerProfileResource` with `rate_cards` (no `platforms` key). → `current_step = max(current_step, 3)`; account still `draft`.
Errors: 422 `rate_cards`, `rate_cards.N.*`; 403 guards; 409 `onboarding_step_out_of_order`.

### 15.9 KYC steps — influencer step-4 §7.1, brand step-3 §7.2
Both finish onboarding → `status: active`, `is_onboarding_complete: true`. Brand step-2/3 response (`BrandProfileResource`):
```json
{ "company_name": "Sada Co", "governorate": "damascus", "governorate_label": "دمشق",
  "business_type": "fnb", "business_type_label": "المطاعم والأغذية",
  "social_links": [ { "platform": "instagram", "url": "https://instagram.com/sada" } ],
  "kyc_document_type": "commercial_register", "has_kyc_document": true }
```
After the final step: register device token (§11.1), then refetch `/user/me` → Home.

### 15.10 `GET /onboarding/progress` — `auth:sanctum` only (works while draft, unverified **and** suspended)
```json
{
  "user_id": "01J9...", "phone": "+963962401604", "email": null,
  "user_type": "influencer", "status": "draft", "current_step": 2,
  "is_phone_verified": true,
  "is_kyc_approved": false, "has_kyc_submission": false, "kyc_status": "unverified",
  "is_verified": false, "has_pending_verification": false,
  "has_rate_card": false, "calculated_influencer_tier": "MICRO",
  "is_onboarding_complete": false,
  "profile": { "full_name": "Anas", "governorate": "damascus", "governorate_label": "دمشق", "area": null,
               "niches": ["fashion"], "has_kyc_id": false, "platforms": [ ], "rate_cards": [ ] }
}
```
Brand: `profile` = `BrandProfileResource`, `has_rate_card: false`, `calculated_influencer_tier: null`. `has_uploaded_kyc` / `has_national_id` no longer exist — use `has_kyc_submission`.

### 15.11 Resume resolver (single function, used on launch, after login, after 409 out-of-order)
Input: `AuthResult` (after login/step-1) or `OnboardingProgress` (launch with stored token). Same field names.
```ts
function resolveRoute(u: { status; user_type; current_step; is_phone_verified; is_onboarding_complete }) {
  if (u.status === 'suspended') return 'Suspended';            // only logout allowed
  if (u.is_onboarding_complete) return 'Home';
  if (!u.is_phone_verified) return 'Otp';                        // call resend-otp on entry (see below)
  if (u.user_type === 'brand')
    return u.current_step <= 1 ? 'BrandBusinessInfo' : 'BrandKyc';           // final = 3
  return u.current_step <= 1 ? 'InfluencerSocials'
       : u.current_step === 2 ? 'InfluencerRates' : 'InfluencerKyc';         // final = 4
}
```
- **Launch with stored token** → `GET /onboarding/progress` → `resolveRoute`. 401 → clear token → Login. Network error → retry screen (do not log out).
- **After login** → use the `AuthResult` directly (no extra call).
- **Entering OTP from login/launch** (not from step-1): no code was sent by login → call `POST /auth/resend-otp {type: "phone_verification"}` on entry; 429 `otp_cooldown` = a code is already out → just start the countdown from `meta.retry_after`.
- Back navigation inside onboarding is fine (earlier steps can be re-submitted); `current_step` never decreases.

### 15.12 Login / forgot / reset
**`POST /auth/login`** — public. Body `{ "phone": "+963...", "password": "..." }` (both required). 200 `AuthResult` (token name differs from onboarding but works the same). Then register device token (§11.1) and `resolveRoute`.
Errors: 422 `errors.phone` = "The phone number or password is incorrect" **or** "This account has been suspended" (both `validation_failed`; show `errors.phone[0]`); 429 `too_many_requests` (5/min per phone+IP).
Unverified phone **can** log in (gets `is_phone_verified: false` → OTP screen).

**Forgot password** (2 screens, 2 calls — never call verify-otp in this flow, it consumes the code):
1. `POST /auth/forgot-password` `{ "phone": "+963..." }` → **always 200** generic `messages.otp_sent_generic`. Errors: 422 `phone`, 429 `otp_cooldown` (`meta.retry_after`), 429 `too_many_requests` (shared with resend-otp). Resend from the next screen = call forgot-password again (or resend-otp with `type: "password_reset"`; same cooldown key).
2. Screen with code + new password + confirm → `POST /auth/reset-password` `{ "phone", "code", "password", "password_confirmation" }`. `code` exactly 4 digits now; `password` min 8, `confirmed`. 200 `data: null`, `messages.password_reset_success`.
   Errors: 422 `code` (wrong / expired / 5 tries / unknown phone — same message), 422 `password`; 429 `too_many_requests` (5/min shared with verify-otp).
   Effect: **all** Sanctum tokens and all device tokens of the account are deleted → clear local token, go to Login (pre-fill phone).

### 15.13 `POST /auth/logout` — `auth:sanctum` (no `account.active`, works when suspended)
Body optional `{ "fcm_token": "<current FCM token>" }` (nullable string ≤ 512) — send it so this device stops receiving pushes. 200 `data: null`, `messages.logged_out`. Clear local storage even if the call fails (401 / network).

---

## 16. Mobile edge-case checklist
- [ ] **App killed after step-1**: token persisted before navigation → on launch `GET /onboarding/progress` → resolver (OTP screen; call resend-otp on entry).
- [ ] **App killed after step-1 before token persisted / reinstall**: re-register → 422 `phone` taken → show "Account exists — Login" → login → `AuthResult` → resolver.
- [ ] **App killed mid-onboarding (step 2+)**: launch → progress → resolver resumes at the right step; prefill from `progress.profile`.
- [ ] **Resend cooldown**: never compute cooldown only locally; always resync from `meta.retry_after` on 429 `otp_cooldown`.
- [ ] **Wrong / expired OTP**: 422 `code` generic message; after 5 wrong → force resend. Expired (15 min) looks identical → offer resend.
- [ ] **403 `phone_not_verified` anywhere** → OTP screen (with resend on entry), then return to resolver.
- [ ] **409 `onboarding_step_out_of_order`** → refetch progress → resolver (do not retry blindly).
- [ ] **Timeout on KYC step / `POST /user/kyc`, then retry → 409 `kyc_already_pending`**: first request succeeded. Refetch progress (onboarding) or `GET /user/kyc` (in-app) and continue; on step-4/brand step-3 if not complete, resubmit with `is_skipped=1`.
- [ ] **Timeout on other steps**: safe to resend the same step (idempotent upserts).
- [ ] **429 `too_many_requests` on KYC** (5/h shared incl. skips): show retry time; don't auto-retry.
- [ ] **Multipart booleans** (`is_skipped`, step-2 rows sent as form) → `"1"` / `"0"` only; JSON → `true` / `false`. String `"true"` = 422.
- [ ] **Files**: influencer ID jpeg/png/webp/pdf ≤ 10MB; brand doc jpeg/png/pdf ≤ 10MB (no webp — convert); avatar jpeg/png/webp ≤ 5MB and ≤ 4096×4096.
- [ ] **Suspended**: login → 422 `errors.phone` message; any authed call → 403 `account_suspended` → Suspended screen; logout still works; progress still readable.
- [ ] **401 anywhere** (incl. after reset-password on another device) → clear token → Login.
- [ ] **Forgot password**: forgot-password → reset-password (no verify-otp in between) → Login. Generic 200 even for unknown phone — don't tell the user the phone isn't registered.
- [ ] **Device token**: `POST /user/devices` after step-1 (token exists), after login, on `onTokenRefresh`, on language change. Allowed while draft/unverified.
- [ ] **Logout**: send `fcm_token`, clear storage regardless of result.
- [ ] **Rejected platform**: hide "make primary"; 409 `platform_not_eligible_for_primary` → toast.
- [ ] **Error codes are lowercase** — update any `PHONE_NOT_VERIFIED` checks.

---

## 17. Media Kit — LOCKED (2026-10-06, implemented)

The creator's public profile: what brands see, shared as a link, with view stats on the creator Home.
Backend plan: `api/docs/plans/media-kit/backend-plan.md` (§2 lists every change from the mobile proposal, C1–C10).

Guards for `/influencer/media-kit*`: `auth` + `account.active` + `phone.verified` + `user.type:influencer` (same 403s as §5.3). Public routes (§17.4, §17.5) need no auth; a bearer token is optional and never fails the request.

**Changes from the 2026-10-05 proposal (mobile must follow these):**
| # | Proposal | Final |
|---|---|---|
| C1 | `GET /public/creators/{slug}` counts a view | GET is **read-only**. Count with `POST /public/creators/{slug}/views { src }` (§17.5) when the screen opens |
| C2 | Old slug → 301 | API returns **200** with the canonical body + `meta.canonical_slug`. Only the web page 301s |
| C3 | Cooldown → 429 | **409 `slug_change_cooldown`** + `meta.retry_after` (seconds) + `meta.available_at` |
| C4 | Range ends today 00:00 | Range ends **now** (today counts) |
| C5 | `src=search` feeds `search_impressions` | Server-side only; `search_impressions` is `null` until search ships |
| C6 | Kit created lazily | Created when onboarding completes; lazy creation is only a backfill |
| C7 | — | **New** `GET /influencer/media-kit/slug-check` |
| C8 | — | Going back to your own previous slug (within 30 days) is allowed even during the cooldown |
| C9 | — | `platforms[].follower_count_verified` |
| C10 | — | Share while private → **409 `media_kit_private`** |
| — | Share channels `copy \| share_sheet`, 200 `null` | Channels `whatsapp \| telegram \| copy_link \| other`; 201 first time / 200 on retry, body `{ channel, occurred_at }` |
| — | `influencer_tier`, `governorate`, niches as `{id,label}` | `tier` + `tier_label`; no `governorate`; `niches` = string keys (same as profile) |

### 17.1 `GET /influencer/media-kit` — own media kit
```json
{
  "id": "01J…", "slug": "anas", "public_url": "https://<PUBLIC_WEB_URL>/c/anas", "is_public": true,
  "slug_changed_at": null, "can_change_slug_at": null,
  "created_at": "2026-10-05T09:00:00+00:00", "updated_at": "2026-10-05T09:00:00+00:00",
  "preview": PublicMediaKit
}
```
- `preview` is exactly what §17.4 returns to the public ("Preview as brand"). One shape.
- `can_change_slug_at`: `null` = can change now; otherwise ISO time when the cooldown ends. Use it to disable the slug field in advance.
- `public_url` is on the public web host (`PUBLIC_WEB_URL`), not the API host. Share this URL + `?src=link`.

### 17.2 `PATCH /influencer/media-kit` — partial
Body `{ "slug"?: "anas.style", "is_public"?: false }` → 200 same shape as §17.1. Throttle 10/h → 429.
- Slug is lowercased. Rules: 3–30 chars, `^[a-z0-9][a-z0-9._]*[a-z0-9]$`, no `..`, not ULID-shaped, not reserved (`admin`, `api`, `app`, `c`, `help`, `support`, `www`, `login`, `brand`, `influencer`, …, and anything starting with `sada`), not taken.

| Error | Status | `meta` |
|---|---|---|
| `slug_unavailable` (invalid length / format / reserved) | 422 | `reason`: `invalid_length` \| `invalid_format` \| `reserved` |
| `slug_unavailable` (taken, incl. held by someone for 30 days) | 409 | `reason`: `taken` |
| `slug_change_cooldown` (1 change per 30 days) | 409 | `retry_after` (seconds), `available_at` (ISO) |

- After a change the old slug keeps resolving to you for 30 days (API: 200 + `canonical_slug`; web: 301), and nobody else can claim it.
- `is_public=false`: every public route returns 404 `not_found` (never reveals the creator exists). Shares → 409 `media_kit_private`.

### 17.3 `GET /influencer/media-kit/slug-check?slug=` — live availability
→ 200 `{ "available": true, "reason": null }` or `{ "available": false, "reason": "taken" }`. Reasons as in §17.2. Your own current/held slug counts as available. Throttle 30/min → 429. Debounce input (~400 ms).

### 17.4 Public — `GET /public/creators/{slug}` (no auth; bearer optional)
```json
{
  "slug": "anas", "display_name": "Anas Style", "avatar_url": "https://…",
  "tier": "MICRO", "tier_label": "مايكرو", "is_verified": true,
  "niches": ["fashion", "beauty"],
  "platforms": [ { "platform": "instagram", "platform_label": "إنستغرام", "username": "anas",
                   "profile_url": "https://instagram.com/anas", "display_name": "Anas Style",
                   "follower_count": 45210, "follower_count_verified": true,
                   "follower_tier": "MICRO", "follower_tier_label": "مايكرو", "is_primary": true } ],
  "rate_cards": [ /* RateCard §6.3 */ ],
  "price_from_usd": 30.0,
  "contract_terms": { "version": "v1", "items": [ { "key": "organic_only", "text": "…" } ] },
  "bio": null, "top_portfolio_items": [], "offers_from_profile": null
}
```
- **Read-only** — opening it does not count a view (call §17.5).
- `display_name` = primary platform `display_name`, else the user's name. `avatar_url` `null` → show initials.
- `is_verified` = KYC verified. `platforms` exclude `rejected`, primary first then followers desc. `follower_count_verified` = auto-verified or admin-approved (self-declared counts are `false`).
- `rate_cards`: on-site visit cards always; platform cards only for available, non-rejected platforms; `price_from_usd` = their min or `null`. `contract_terms` = the catalog's terms (§6.1). `bio` `null` until AI bio ships.
- **Never returned:** phone, email, `full_name`, `area`, KYC data, `rejection_reason`, user `id`.
- Old slug (≤ 30 days) → **200** with the new `slug` in the body + `meta.canonical_slug`. Replace the stored slug if `meta.canonical_slug` is present.
- Unknown / private / suspended / deleted → 404 `not_found`. Rate limit 60/min per IP. `ETag` + `Cache-Control: public, max-age=60` (`If-None-Match` → 304).

### 17.5 `POST /public/creators/{slug}/views` — count a view
Body `{ "src": "app" | "link" | "search" | "web" }` → 202 `null`. Send once when the creator screen opens, with the bearer token if logged in.
- Not counted (still 202): the creator's own views, admins, bots / empty user agents, and repeats by the same viewer within 30 min.
- A logged-in brand also counts toward `unique_brand_views` (once per day).
- Unknown / hidden slug → 404. Invalid `src` → 422. Rate limit 30/min per IP.

### 17.6 `POST /influencer/media-kit/share`
Body `{ "channel": "whatsapp" | "telegram" | "copy_link" | "other" }`, header **`X-Idempotency-Key: <uuid per tap>`** (required, UUID → else 422).
- 201 `{ "channel": "whatsapp", "occurred_at": "…" }` first time; **200** same body on a retry with the same key (counted once).
- Kit private → 409 `media_kit_private`. Rate limit 30/h per user → 429. Bumps the stats cache, so the Home tile updates immediately.

### 17.7 `GET /influencer/media-kit/stats?period=7d|30d|90d` (default `30d`)
```json
{
  "period": "30d",
  "range": { "from": "2026-09-07T00:00:00+03:00", "to": "2026-10-06T11:40:00+03:00" },
  "generated_at": "2026-10-06T08:40:00Z",
  "profile_views":      { "value": 1240, "previous": 1107, "change_pct": 12.0,
                          "series": [ { "date": "2026-09-07", "value": 31 } ] },
  "unique_brand_views": { "value": 38, "previous": 30, "change_pct": 26.7 },
  "link_opens":         { "value": 96, "previous": 0,  "change_pct": null },
  "shares":             { "value": 14, "previous": 9,  "change_pct": 55.6 },
  "search_impressions": null,
  "offers_from_profile": null,
  "top_portfolio_items": [],
  "brand_locations": [
    { "key": "damascus", "label": "دمشق", "count": 21, "share_pct": 55.3 },
    { "key": "other",    "label": "أخرى", "count": 8,  "share_pct": 21.0 }
  ]
}
```
- Range: from start of day (today − N + 1) **to now**, in `Asia/Damascus`. Previous period = same length shifted back.
- `change_pct` = `null` when `previous = 0`, 1 decimal. A metric that is **`null`** = feature not live → hide the tile (not 0).
- `profile_views.series`: one point per Damascus day in the range (zeros included) — for a sparkline.
- `brand_locations`: by brand governorate, top 5 + `other`, count desc, `share_pct` sums to 100. Buckets with < 3 brands merge into `other`; `[]` when `unique_brand_views < 3`. Brand identities are never returned.
- Cached up to 10 min (`generated_at` = when computed); a share refreshes it. Invalid `period` → 422.

### 17.8 Web page & universal links
- `https://<PUBLIC_WEB_URL>/c/{slug}` — server-rendered page from the same data as §17.4: OpenGraph/Twitter tags (avatar, name, tier) for link previews, Arabic RTL by default (`?lang=en` or an English browser → English), `noindex`.
- The page counts its own view via JS (`src` from `?src=`; anything other than `link|search|web` → `web`), so link-preview bots never count.
- Old slug / different case → **301** to the canonical URL (query kept). Hidden / unknown → friendly 404 page.
- App links: `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` match `/c/*`. Values come from backend env — **mobile must send us:** iOS Team ID + bundle IDs, App Store ID, Android package + SHA-256 signing fingerprints (debug + release), and the custom URL scheme (for the page's "Open in app" button).
- App setup: iOS associated domain `applinks:<host>` (`?mode=developer` while on a tunnel); Android `autoVerify` intent filter for `https://<host>/c/*`. Use a **stable** tunnel hostname (named Cloudflare Tunnel), not rotating ngrok URLs.
- App parses `/c/{slug}` into a typed route `{ slug }` (validate with the §17.2 regex, case-insensitive) — never navigate to a raw path. Then `GET` §17.4 + `POST` §17.5 with `src=link`.

### 17.9 TS types
```ts
type StatMetric = { value: number; previous: number; change_pct: number | null };
type StatsPeriod = '7d' | '30d' | '90d';
type ViewSource = 'app' | 'link' | 'search' | 'web';
type ShareChannel = 'whatsapp' | 'telegram' | 'copy_link' | 'other';
type SlugReason = 'invalid_length' | 'invalid_format' | 'reserved' | 'taken';
interface PublicMediaKit {
  slug: string; display_name: string | null; avatar_url: string | null;
  tier: FollowerTier | null; tier_label: string | null; is_verified: boolean;
  niches: string[];
  platforms: { platform: Platform; platform_label: string; username: string; profile_url: string | null;
               display_name: string | null; follower_count: number; follower_count_verified: boolean;
               follower_tier: FollowerTier | null; follower_tier_label: string | null; is_primary: boolean }[];
  rate_cards: RateCard[]; // §6.3
  price_from_usd: number | null;
  contract_terms: { version: string; items: { key: string; text: string }[] };
  bio: null; top_portfolio_items: []; offers_from_profile: null;
}
interface MediaKit {
  id: string; slug: string; public_url: string; is_public: boolean;
  slug_changed_at: string | null; can_change_slug_at: string | null;
  created_at: string; updated_at: string;
  preview: PublicMediaKit;
}
interface SlugCheck { available: boolean; reason: SlugReason | null }
interface MediaKitStats {
  period: StatsPeriod; range: { from: string; to: string }; generated_at: string;
  profile_views: StatMetric & { series: { date: string; value: number }[] };
  unique_brand_views: StatMetric; link_opens: StatMetric; shares: StatMetric;
  search_impressions: StatMetric | null; offers_from_profile: StatMetric | null;
  top_portfolio_items: { id: string; title: string; thumbnail_url: string; clicks: number }[];
  brand_locations: { key: string; label: string; count: number; share_pct: number }[];
}
```

### 17.10 Media Kit edge-case checklist
- [ ] **Slug field**: debounce slug-check; on PATCH 409 `slug_change_cooldown` show `meta.available_at`; disable the field while `can_change_slug_at` is in the future (except reverting to the previous slug).
- [ ] **409 `slug_unavailable` / `taken`** after a green slug-check (race) → show the error, re-check.
- [ ] **Deep link with an old slug** → GET returns `meta.canonical_slug`; use it for the share sheet and cache keys.
- [ ] **Share**: new UUID per tap, same UUID on retry; private kit → 409 → prompt "make public".
- [ ] **View beacon**: fire-and-forget, never block the UI, ignore errors; don't re-send on re-render (backend dedups 30 min anyway).
- [ ] **Stats tiles**: `null` metric → hide; `change_pct: null` → show "new" / no arrow; `brand_locations: []` → hide the chart.
