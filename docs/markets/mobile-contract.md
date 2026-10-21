# Mobile Contract

Cross-cutting contract sections for the React Native app. Feature-specific mobile notes live in `docs/mobile/`.

---

## Markets & Config

**Added:** 2026-10-20. Source spec: `docs/market/backend-prompt.md`.

Country-specific data (phone rule, currencies, limits, payment channels, couriers, governorates, support contacts, timezone) is **server-driven**. Do not hardcode it. Syria (`sy`) is the first active market; `ae` exists as `coming_soon`.

### Store-policy rules (App Store / Play)

- The app **must behave identically for every user**. No reviewer detection by IP, geolocation, User-Agent, device or review accounts, on either side.
- The app version is sent only for the update gate (`min_version` / `latest_version` / `force_update`). Nothing else may branch on it.
- A user's market comes from their **phone country code** (admin can override). Never from IP or device locale.
- `features` flags are kill switches and staged rollout only. Do not use them to hide features from anyone.
- `test_mode` and `test_replacements` in `/config` are **deprecated and always neutral** (`false` / `[]`). Ignore them; they are removed next release.

### Money

Unchanged: money in market limits is **integer minor units** (`1000` USD = 10.00 USD, SYP has 0 digits). Use `minor_unit_digits` from the currency to format. Enum values, money formats and the response envelope did not change.

### `GET /config` (public)

Call on every cold start. Cacheable: `ETag` + `Cache-Control: public, max-age=…` (send `If-None-Match`). `Vary: Accept-Language, X-Platform`. Send `X-Platform: ios|android` so `app` shows your platform; without it the stricter of both platforms is returned.

```json
{
  "success": true,
  "message": "…",
  "data": {
    "app": { "min_version": "1.0.0", "latest_version": "1.0.0", "force_update": false },
    "support": { "email": "support@example.com", "phone": null, "whatsapp": "+963944123456" },
    "urls": { "privacy": "https://…/privacy", "terms": "https://…/terms" },
    "default_market": "sy",
    "markets": [
      {
        "code": "sy",
        "country_code": "SY",
        "name": "سوريا",
        "status": "active",
        "calling_code": "+963",
        "mobile_example": "+963944123456",
        "default_currency": "USD",
        "timezone": "Asia/Damascus"
      },
      {
        "code": "ae",
        "country_code": "AE",
        "name": "الإمارات",
        "status": "coming_soon",
        "calling_code": "+971",
        "mobile_example": "+971501234567",
        "default_currency": "AED",
        "timezone": "Asia/Dubai"
      }
    ],
    "features": { "public_campaigns": true },
    "maintenance_mode": false,
    "maintenance_message": null,
    "test_mode": false,
    "test_replacements": []
  },
  "meta": []
}
```

- `markets[]` lists `active` and `coming_soon` only (disabled ones are hidden). `coming_soon` may be shown in a country picker but **cannot sign up** (`market_inactive`).
- `features` here is the guest view: only flags with no market/role/rollout restriction. Per-user values come from `GET /me` → `features`.
- If `force_update` is true, or the installed version is below `min_version`, block with the update screen. `latest_version` is an optional "update available" nudge.

### `GET /markets/{code}` (public)

Full rules for one market (use for the active market's forms/limits). Same caching headers as `/config`. Inactive rows are omitted. Unknown or disabled code → `404 market_not_found`.

```json
{
  "success": true,
  "data": {
    "code": "sy",
    "country_code": "SY",
    "name": "سوريا",
    "status": "active",
    "calling_code": "+963",
    "mobile_pattern": "^\\+9639\\d{8}$",
    "mobile_example": "+963944123456",
    "timezone": "Asia/Damascus",
    "currencies": [
      {
        "code": "USD",
        "minor_unit_digits": 2,
        "name": "دولار أمريكي",
        "top_up": { "min": 1000, "max": 1000000 },
        "withdraw": { "min": null, "max": null }
      },
      {
        "code": "SYP",
        "minor_unit_digits": 0,
        "name": "ليرة سورية",
        "top_up": { "min": null, "max": null },
        "withdraw": { "min": null, "max": null }
      }
    ],
    "default_currency": "USD",
    "governorates": [{ "id": "damascus", "name": "دمشق" }],
    "payment_channels": [
      {
        "code": "syriatel_cash",
        "group": "e_wallet",
        "icon": "smartphone",
        "name": "سيريتل كاش",
        "currencies": ["SYP"],
        "supports_top_up": true,
        "supports_payout": true,
        "payout_phone_required": true,
        "instructions": null
      }
    ],
    "couriers": [{ "code": "aramex", "name": "أرامكس" }],
    "support": { "email": null, "phone": null, "whatsapp": "+963944123456" }
  },
  "meta": []
}
```

- `null` limit bound = no limit on that side. Limits are per currency and per direction.
- `payment_channels[].group` ∈ `exchange_office | e_wallet | bank`; `icon` ∈ `store | smartphone | landmark`.
- `mobile_pattern` is a PCRE regex over the **E.164** number. For client-side hints only; the server is the authority. `mobile_example` is the placeholder to show.
- Use `governorates[].id` as the value you send in forms (same ids as before for Syria).

### `GET /lookups?market={code}` (public)

`governorates` is now scoped to a market. Without `?market`, the logged-in user's market is used (guests: the default market). Shape of each governorate is unchanged: `{ id, name_ar, name_en }`. Unknown/disabled `market` → `404 market_not_found`.

### `GET /me`

New object (additive):

```json
"market": { "code": "sy", "timezone": "Asia/Damascus", "default_currency": "USD" }
```

`GET /me` also returns `features` (per-user flags). Use `market.code` to pick `GET /markets/{code}`. Users who signed up before markets existed resolve to the default market.

### Timezones on records

`campaign` (brand/creator views) and `deal` resources now include `"timezone": "Asia/Damascus"`: the market timezone **captured when the record was created**. Render deadlines in that zone. Changing a market's timezone later affects **new** records only.

### Login / sign-up phone

The hardcoded Syrian regex is gone. Send **any E.164** number (`+` and country code). The server finds the market by calling code + the market's `mobile_pattern`:

| Case | Response |
|---|---|
| No market matches the number | `422 phone_market_unsupported`, `errors.phone` |
| Market exists but is `coming_soon`/`disabled` | `422 market_inactive`, `errors.phone` |
| Match | Proceeds as before; the user's market is set from the number |

Do not pre-validate against `+9639…` any more. Validate against `mobile_pattern` of the picked market, or just let the server answer.

### Payments, withdrawals, couriers

- `GET /wallet/top-ups/channels` now returns only the **user's market's** active top-up channels.
- Top-up / withdraw / payout-method requests with a channel code that is missing, inactive, wrong direction, or wrong currency for the market → `422 channel_not_available` (`errors.channel` or `errors.payout_method_id`).
- Withdraw amount outside the market's limits → `422 withdrawal_amount_out_of_range`, `errors.amount_cents`, and `meta`: `{ "min": 1000, "max": null, "currency": "USD" }` (minor units, `null` = no max). USD limits apply to the gross amount in cents; SYP limits to the net SYP payout.
- `GET /wallet/withdrawals/quote` `reasons[]` may now include `channel_unavailable` and `outside_market_limits`. Treat unknown reasons generically.
- Shipping (`courier` on ship / return-shipment): offer `couriers[].code` from `/markets/{code}`. `courier: "other"` **requires** `courier_name` (free text). A code that is not in the catalog at all is still accepted as free text (old builds); new builds should send `other` + `courier_name`. A code that exists but is inactive or belongs to another market → `422 courier_not_available`.
- A governorate that is not active in the user's market fails the normal validation: `422` with `errors.governorate` (no special `error_code`). The `governorate_not_in_market` code is reserved and not emitted today.

### New error codes

Envelope is unchanged: `{ "success": false, "error_code": "…", "errors": {…}, "meta": {…} }`. Messages are localized by `Accept-Language`.

| `error_code` | HTTP | Where | Notes |
|---|---|---|---|
| `phone_market_unsupported` | 422 | auth (send OTP / login) | No market for this number. `errors.phone` |
| `market_inactive` | 422 | auth | Market is `coming_soon`/`disabled`. `errors.phone` |
| `market_not_found` | 404 | `GET /markets/{code}`, `GET /lookups?market=` | Unknown or disabled code |
| `channel_not_available` | 422 | top-up, withdrawal, payout methods | Channel not offered in the user's market for that direction/currency |
| `courier_not_available` | 422 | deal shipping, return shipment | Courier inactive/unknown for the market |
| `governorate_not_in_market` | 422 | reserved | Defined but not emitted yet; see governorate note above |
| `withdrawal_amount_out_of_range` | 422 | `POST /wallet/withdrawals` | `meta.min`, `meta.max`, `meta.currency` (minor units) |
| `market_confirmation_required` | 409 | admin only | Disabling a market without typed confirmation |
| `market_default_required` | 422 | admin only | Cannot disable/unset the default market |
| `confirmation_required` | 409 | admin only | Deactivating a channel with pending money |
| `config_in_use` | 409 | admin only | Deleting a used currency/channel |

The last four are admin-panel errors; the mobile app never sees them.

### Caching & headers

- `/config` and `/markets/{code}`: `ETag`, `Cache-Control: public, max-age=N`, `Vary: Accept-Language, X-Platform`. Send `If-None-Match`; handle `304`. Both are throttled (120/min).
- Server config cache is busted on every admin save, so changes appear within the `max-age` window on devices.

### Mobile-team changelog (2026-10-20)

**Additive (safe, no code change needed):**
- New public endpoints `GET /config`, `GET /markets/{code}`.
- `GET /lookups` accepts `?market=`.
- `GET /me` adds `market`.
- Campaign and deal resources add `timezone`.
- New optional `X-Platform` header on `/config`.

**Behavior changes (need mobile work):**
1. **Replace the hardcoded Syrian phone regex/placeholder** with `mobile_pattern` / `mobile_example` from the selected market (or just rely on server `422 phone_market_unsupported`). Login accepts any E.164 now.
2. **Stop using local lists** for governorates, payment channels, couriers, currencies, top-up/withdraw min/max and support contacts. Read them from `/markets/{code}` (cache with ETag).
3. **Handle the new 422/404 codes** above.
4. **Courier `other`**: send `courier: "other"` + `courier_name` for free-text couriers.
5. **Top-up channels** are market-filtered; do not assume the six Syrian channels.
6. **Drop any use of `test_mode` / `test_replacements`.** They are neutral now and removed next release.
7. **Update gate**: use `app.min_version` / `latest_version` / `force_update` from `/config` (per `X-Platform`).
8. Cache keys must include the language (responses `Vary: Accept-Language`).
