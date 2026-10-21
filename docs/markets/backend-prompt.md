# Backend task: server-driven Markets (multi-market config + admin panel)

You are working on the **Sada (صدى)** Laravel backend: a B2B influencer marketplace (brands ↔ creators, escrow wallet, direct deals, public campaigns). The React Native app currently **hardcodes** market-specific data (Syria): phone rules, currencies, timezone, governorates, payment channels, couriers, top-up limits, support number. We are making the platform **multi-market**: every market-specific value comes from the API and is managed in the admin panel. Syria is the first active market; others (UAE, Jordan, Lebanon, …) are added later as **data, not code**.

Read `docs/mobile-contract.md` (§1 envelope, §15 registration, `/lookups`, `/config`) before you start. All responses keep the existing envelope `{ success, message, data, error_code, errors, meta }`.

---

## 0. Compliance rules (non-negotiable)

These exist because the app is going to the App Store and Google Play. Breaking them risks **termination of the developer accounts**.

1. **No reviewer detection.** Never branch any response on IP / ASN / geolocation, User-Agent, device model, store-review accounts, or "is this App Review". A reviewer and a real user with the same account data get the same response.
2. **App version is used only for** `min_version` / `latest_version` / `force_update`. Never to hide or reveal content or features.
3. **Remove `test_mode` and `test_replacements` from `GET /config`.** They rewrite on-screen text (e.g. one country name into another) and are exactly the kind of mechanism store review treats as deceptive. For one release, return `test_mode: false` and `test_replacements: []`, then drop the fields. Delete the admin UI for them.
4. Feature flags are allowed for: kill switches, gradual rollout (percentage / market / role), and staged launches. They are **not** allowed as a "review mode". Every flag change is audit-logged.
5. A user's market is decided by **the phone number's country code at registration** (with admin override). Never by IP.

---

## 1. Data model (migrations + models + factories)

Use the existing conventions (naming, soft deletes, `name_ar` / `name_en` columns like `/lookups`). If a table already exists (e.g. governorates), **add a `market_id` FK** instead of creating a duplicate.

### `markets`
| column | type | notes |
|---|---|---|
| id | pk | |
| code | string unique | slug, e.g. `sy`, `ae` (stable, used by the app) |
| country_code | char(2) | ISO 3166-1 alpha-2, `SY` |
| name_ar, name_en | string | |
| status | enum `active`, `coming_soon`, `disabled` | only `active` accepts sign-ups |
| calling_code | string | `+963` |
| mobile_pattern | string | PCRE for E.164 mobiles, e.g. `^\+9639\d{8}$`; validate it compiles on save |
| mobile_example | string | `+963944123456` (shown as placeholder) |
| timezone | string | IANA, `Asia/Damascus`; validate against `DateTimeZone::listIdentifiers()` |
| default_currency | string | FK-ish to `currencies.code` |
| is_default | bool | exactly one row true (default phone-input country before sign-up) |
| sort_order | int | |
| timestamps, soft deletes | | |

### `currencies`
`code` (ISO 4217, `USD`, `SYP`, `AED`), `minor_unit_digits` (int: USD 2, SYP 0 = whole pounds, as today), `name_ar`, `name_en`, `active`.

### `market_currency` (pivot)
`market_id`, `currency_code`, `top_up_min` (bigint, minor units), `top_up_max` (bigint, minor units), `withdraw_min`, `withdraw_max` (nullable), `sort_order`.
Seed SY: USD `top_up_min = 1000` (= $10), `top_up_max = 1000000` (= $10,000). SYP limits nullable (the app derives them from the live rate when absent; once set, the server value wins).

### `governorates` (existing) → add `market_id`
Backfill all current rows to SY. `/lookups` must filter by market (see §3).

### `payment_channels`
| column | type | notes |
|---|---|---|
| id | pk | |
| market_id | fk | |
| code | string | **keep existing codes**: `haram`, `fouad`, `syriatel_cash`, `mtn_cash`, `sham_cash`, `bank`. Unique per market |
| group | enum `exchange_office`, `e_wallet`, `bank` | |
| icon | enum `store`, `smartphone`, `landmark` | the app maps this to an icon; unknown → generic |
| name_ar, name_en | string | |
| currencies | json array | e.g. `["SYP"]` / `["USD","SYP"]` |
| supports_top_up, supports_payout | bool | |
| payout_phone_required | bool | e-wallets need a mobile of the same market |
| instructions_ar, instructions_en | text nullable | shown on the top-up / payout screen |
| active, sort_order | | |

Existing top-ups / payout methods / withdrawals must keep resolving their channel by `code`. Validate on write that the channel is `active`, belongs to the user's market, and supports the currency and direction.

### `couriers`
`market_id`, `code` (keep `alqadmous`, `aramex`, `syrian_post`, `direct`), `name_ar`, `name_en`, `active`, `sort_order`. "Other" (free text) stays as it is today.

### `market_support`
Per market: `whatsapp` (E.164), `phone`, `email`, all nullable. It replaces the support numbers that are hardcoded today. Global `/config.support` stays as the fallback.

### `users.market_id`
- New FK, required for new users.
- Backfill: every existing user → SY.
- On registration: resolve from the E.164 phone's country code (`giggsey/libphonenumber-for-php`). The market must be `active` and the phone must match `mobile_pattern`. Otherwise return 422 `error_code: "phone_market_unsupported"`, with `errors.phone`.
- Replaces the current "Syrian mobile only" rule for creators. Brands follow the same rule.

### Campaign / deal timezone
- Today campaign dates are read in `Asia/Damascus` (contract §1.3, analytics ranges §17).
- Add `timezone` (IANA) to campaigns and deals, set from the **brand's market** at creation. Backfill `Asia/Damascus`.
- Every server-side schedule or "day" computation (drops, windows, end-of-day caps, analytics ranges) uses that column instead of a hardcoded zone.
- Return `timezone` in campaign and deal payloads.

### `feature_flags`
- Columns: `key` (unique), `description`, `enabled` (bool), `rollout_percent` (0–100, nullable), `markets` (json array of market codes, nullable = all), `roles` (json, nullable = all), timestamps.
- Evaluate per authenticated user: stable hash of user id for percentage, AND market, AND role.
- Anonymous requests: only flags with no market/role/percent restriction.

---

## 2. Seeders

`MarketSeeder` creates **exactly what the app hardcodes today**, so behaviour does not change on day one:
- **Market SY:** `+963`, `^\+9639\d{8}$`, `Asia/Damascus`, default currency USD, `is_default = true`, `status = active`.
- **Currencies:** USD, SYP.
- **Payment channels:**

  | code | group | currencies |
  |---|---|---|
  | haram | exchange_office | USD, SYP |
  | fouad | exchange_office | USD, SYP |
  | syriatel_cash | e_wallet | SYP |
  | mtn_cash | e_wallet | SYP |
  | sham_cash | e_wallet | USD, SYP |
  | bank | bank | USD, SYP |

  Take names from the current app copy and existing backend enums.
- **Couriers:** alqadmous, aramex, syrian_post, direct.
- **Governorates:** existing ones linked to SY.
- **Support:** SY WhatsApp = current support number.

Optional: a second market row `ae` with `status = coming_soon` and no channels. It proves the multi-market path and is not visible as a sign-up option.

---

## 3. API

### `GET /config` (public, existing): extend, additive only
```json
{
  "app": { "min_version": "1.0.0", "latest_version": "1.0.0", "force_update": false },
  "support": { "email": "...", "phone": null, "whatsapp": "+963..." },
  "urls": { "privacy": "...", "terms": "..." },
  "default_market": "sy",
  "markets": [
    { "code": "sy", "country_code": "SY", "name": "سوريا", "status": "active",
      "calling_code": "+963", "mobile_example": "+963944123456",
      "default_currency": "USD", "timezone": "Asia/Damascus" }
  ],
  "features": { "public_campaigns": true }
}
```
- `name` is localized by `Accept-Language` (same as other server labels).
- `app` is per platform: read the `X-Platform: ios|android` header and store versions per platform in admin. Missing header → the stricter of the two.
- `features` contains only flags that apply to anonymous users. Per-user flags go in `/me`.
- Only `active` and `coming_soon` markets are listed. Disabled ones are hidden.
- Caching: `ETag` + `Cache-Control: public, max-age=300`. Bust the cache on any admin save of markets, channels or flags.
- Keep `maintenance_mode` / `maintenance_message` as they are. Neutralise `test_mode` / `test_replacements` (§0.3).

### `GET /markets/{code}` (public): full market detail
```json
{
  "code": "sy", "country_code": "SY", "name": "سوريا", "status": "active",
  "calling_code": "+963", "mobile_pattern": "^\\+9639\\d{8}$", "mobile_example": "+963944123456",
  "timezone": "Asia/Damascus",
  "currencies": [
    { "code": "USD", "minor_unit_digits": 2, "name": "دولار", "top_up": { "min": 1000, "max": 1000000 }, "withdraw": { "min": null, "max": null } },
    { "code": "SYP", "minor_unit_digits": 0, "name": "ليرة", "top_up": { "min": null, "max": null }, "withdraw": { "min": null, "max": null } }
  ],
  "default_currency": "USD",
  "governorates": [ { "id": "damascus", "name": "دمشق" } ],
  "payment_channels": [
    { "code": "syriatel_cash", "group": "e_wallet", "icon": "smartphone", "name": "سيريتل كاش",
      "currencies": ["SYP"], "supports_top_up": true, "supports_payout": true,
      "payout_phone_required": true, "instructions": null }
  ],
  "couriers": [ { "code": "alqadmous", "name": "القدموس" } ],
  "support": { "whatsapp": "+963...", "phone": null, "email": null }
}
```
- 404 `market_not_found` for unknown or disabled codes.
- Same ETag / cache rules as `/config`.
- Money amounts are always **integer minor units**. Never floats or formatted strings.

### `GET /me`: add
```json
"market": { "code": "sy", "timezone": "Asia/Damascus", "default_currency": "USD" },
"features": { "public_campaigns": true }
```
`features` = flags evaluated for this user (percent / market / role).

### `GET /lookups`
Accept an optional `?market=sy`. Default: the authenticated user's market, else `default_market`. `governorates` are filtered by market. Keep the response shape the same.

### Validation changes (server is the authority)
- **Registration / phone change:** §1 `users.market_id` rule. Error codes: `phone_market_unsupported`, `market_inactive`.
- **Payout methods / withdrawals:** the phone must match the **user's market** `mobile_pattern` (replaces the hardcoded Syrian rule). Channel and currency rules as in §1.
- **Top-up:** amount within the market-currency limits. On violation, return 422 with the existing error-code style.
- **Deal shipping:** courier `code` must be an active courier of the brand's market, or `other` + free text. The recipient phone follows the market `mobile_pattern`.
- **Governorate** on profile, campaign or shipping must belong to the user's market.

### Backward compatibility
Old app builds must keep working:
- All new fields are additive.
- Existing codes and enums are unchanged.
- Existing endpoints keep their shapes.

---

## 4. Admin panel

The admin panel is a **React SPA** on top of Laravel. Deliver both halves: admin REST endpoints (`/admin/markets`, `/admin/currencies`, `/admin/payment-channels`, `/admin/couriers`, `/admin/feature-flags`, `/admin/app-versions`; standard index/show/store/update/destroy, Form Request validation, same envelope) **and** the React screens that use them, following the panel's existing routing, table/form components and permission guards. Super-admin (or a new `markets.manage` permission) only.

1. **Markets:**
   - CRUD and status switch.
   - Timezone picker (IANA list).
   - Calling code, mobile pattern, and a "test a number" box that runs the pattern live.
   - Default currency; exactly one default market.
2. **Currencies & limits:** per market, with limits entered in major units (e.g. `10.00`) and stored as minor units. Show both.
3. **Governorates:** per market, with sort and active flags.
4. **Payment channels:** per market. Group, icon, names, currencies, top-up / payout switches, instructions, sort, active.
5. **Couriers:** per market, with sort and active flags.
6. **Support contacts:** per market.
7. **App versions:** per platform (`min_version`, `latest_version`, `force_update`).
8. **Feature flags:** key, description, enabled, rollout %, markets, roles.
9. **Remove** the `test_mode` / `test_replacements` screens.

Guards:
- **Disabling a market** with users, open deals, escrow, or pending withdrawals → show the counts and require typed confirmation. Never delete; use soft disable.
- **Deactivating a payment channel** with pending top-ups or withdrawals → warn with counts. In-flight operations still complete.
- **Changing a market's timezone** → warn that it applies to new campaigns and deals only.
- Every save is audit-logged (who, when, before/after), e.g. with `spatie/laravel-activitylog`.
- Every save busts the `/config` and `/markets/{code}` cache.

---

## 5. Tests (Pest / PHPUnit)

- Market resolution from phone:
  - SY mobile → SY.
  - Unknown country → `phone_market_unsupported`.
  - `coming_soon` market → `market_inactive`.
- `/config`: markets list, localization (ar/en), ETag 304, per-platform versions, `test_mode` neutralised.
- `/markets/{code}`: shape, disabled → 404, minor units are integers.
- Payout / withdraw / top-up validation against the market rules (channel, currency, direction, limits, phone pattern).
- Feature flag evaluation: percent stability, market filter, role filter.
- Campaign / deal timezone: created with the brand market's zone; schedule computations use it.
- Backfill migration: existing users → SY, governorates → SY, campaigns / deals → `Asia/Damascus`.

---

## 6. Deliverables

1. Migrations, models, seeders, API resources, form requests, admin resources, tests. All green.
2. Add a new section **"Markets & Config"** to `docs/mobile-contract.md`. Include:
   - full JSON examples for `/config`, `/markets/{code}`, the `/me` additions, and the `/lookups?market=`;
   - every new `error_code`;
   - the backward-compatibility notes.
3. A short changelog for the mobile team. List every field that is new, deprecated (`test_mode`, `test_replacements`), or changed in behaviour.

Do not change existing enum values, money formats, or the envelope. Ask before changing anything outside this scope.
