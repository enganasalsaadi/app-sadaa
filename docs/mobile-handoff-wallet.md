# Wallet & Finance: Mobile Handoff (phase 1)

Status: **API live on `main`** (2026-10-08). Postman folder: `14 - Wallet & Finance`.
Backend plan: [backend-plan.md](backend-plan.md).

> **Update 2026-10-09:** the brand top-up flow v2 (channels + receiving accounts, full top-up object, new error codes, top-up deep links) is in [mobile-handoff-topup-v2.md](mobile-handoff-topup-v2.md). It supersedes §6 and the deep link in §9 for top-up pushes.

All endpoints are under `/api/v1`, use the standard envelope `{success, message, data, meta}` / `{success:false, error_code, errors, meta}`, and honor `Accept-Language` (`ar` default).

## 1. Breaking change (ship with this release)

`DELETE /auth/account` can now return **422 `account_has_funds`**. This happens when the wallet has a balance, pending money, money in escrow, a top-up under review, or an open withdrawal. Show the localized `message` and point the user to:
- Wallet: creators withdraw their balance.
- Support: brands, or creators with funds stuck in escrow.

## 2. Money format

Every amount is an object:

```json
{ "amount": 12345, "formatted": "123.45", "currency": "USD" }
```

- `amount` is an integer in **minor units**: USD in cents, SYP in **whole pounds**.
- Display `formatted`. Never do float math on amounts.
- Signed amounts (statement lines) are negative for debits, for example `"-4.00"`.

## 3. Idempotency (required)

Every money POST needs a header `Idempotency-Key: <uuid v4>`:
- `POST /wallet/top-ups`
- `POST /wallet/withdrawals`
- `POST /wallet/withdrawals/{id}/cancel`

Rules:
- **Generate one key per user action** and **reuse it on retries** of that same action (timeouts, app resume). Generate a new key only when the user starts a new action.
- Missing or invalid key → `400 idempotency_key_required`.
- A replay with the same key and same body returns the original response with the header `Idempotent-Replayed: true`. Treat it as success.
- `409 idempotency_key_reused`: the same key was sent with a different body. This is a client bug; generate a new key.
- `409 idempotency_request_in_progress`: the first request is still running. Retry after ~2s.
- Failed requests (4xx) don't consume the key. The user can fix the input and resend with the same key.

## 4. Capabilities (from `GET /user/me`)

| Capability | User | Blocked reasons |
|---|---|---|
| `top_up_wallet` | brand | `account_suspended`, `onboarding_incomplete`, `kyc_required`, `kyc_pending`, `kyc_rejected`, `wallet_frozen` |
| `withdraw_funds` | influencer | same as above, plus `withdrawals_paused` |

Use these to enable or disable the Top-up and Withdraw buttons. The server re-checks every rule anyway.

## 5. Shared (brand + influencer)

### `GET /wallet`

```json
{
  "id": "01J...", "status": "active", "status_label": "نشطة", "currency": "USD",
  "available": {"amount": 9000, "formatted": "90.00", "currency": "USD"},
  "pending":   {"amount": 1000, "formatted": "10.00", "currency": "USD"},
  "total":     {"amount": 10000, "formatted": "100.00", "currency": "USD"}
}
```

- `status` is one of `active`, `frozen` or `closed`.
- `available` is 0 while the wallet is frozen.
- `pending` holds open withdrawals (creators) or escrow (brands).

### `GET /wallet/transactions?type=&from=YYYY-MM-DD&to=YYYY-MM-DD&per_page=20`

Paginated `{items, meta}`, newest first. Each item:

```json
{
  "reference": "TRX-202610-7K3M9Q", "type": "top_up", "type_label": "شحن المحفظة",
  "direction": "credit", "amount": {...}, "balance_after": {...},
  "original": {"amount": 700000, "formatted": "700,000", "currency": "SYP"},
  "exchange_rate": "14000.0000",
  "source": {"type": "top_up_request", "id": "01J..."},
  "details": {"channel": "haram", "transfer_reference": "HR-1"},
  "created_at": "2026-10-08T10:00:00Z"
}
```

`type` is one of:
- `top_up`
- `escrow_hold`, `escrow_release`, `escrow_refund`, `escrow_split`
- `withdrawal_request`, `withdrawal_cancel`, `withdrawal_reject`, `withdrawal_complete`, `withdrawal_returned`
- `provider_fee`
- `admin_adjustment`
- `promo_credit`
- `reversal`

Use `type_label` for display.

### `GET /wallet/transactions/{reference}`

Returns a receipt in the same shape. The reference is case-insensitive. Returns 404 if the reference isn't on the user's wallet.

### `GET /finance/exchange-rate`

```json
{ "rate": "14000.0000", "quote": "SYP", "base": "USD", "source": "manual", "is_stale": false, "locked_until": null, "effective_at": "..." }
```

- `data` is `null` when no rate has been set yet.
- When `is_stale` is true, disable SYP options and show a notice.

## 6. Brand: top-ups

### `POST /wallet/top-ups`

`multipart/form-data` fields:

| Field | Rule |
|---|---|
| `channel` | `haram`, `fouad`, `syriatel_cash`, `mtn_cash`, `sham_cash` or `bank` |
| `currency` | `USD` or `SYP`. `syriatel_cash` and `mtn_cash` accept **SYP only**; `sham_cash` accepts both. |
| `amount` | Integer in minor units of `currency`. USD-equivalent must be between $10 and $10,000. |
| `transfer_reference` | Required (≤100 characters) |
| `receipt` | Required. jpeg, png, webp or pdf, ≤10 MB. |

Response:
- **201** with the top-up. `status` is `pending_review` (production) or `completed` (dev mock mode).
- Show `amount_usd` as "You'll receive". To preview SYP before submitting, compute `floor(amount_syp * 100 / rate)` cents client-side; the server value is the truth.

Errors:

| Status | `error_code` |
|---|---|
| 403 | `kyc_required` |
| 422 | `currency_not_supported` |
| 422 | `top_up_amount_out_of_range` (message includes min and max) |
| 409 | `fx_rate_stale` |
| 409 | `fx_rate_unavailable` |
| 409 | `wallet_frozen` |
| 409 | `wallet_closed` |

### Listing and detail

- `GET /wallet/top-ups?status=` lists top-ups. `status` is one of `pending_review`, `completed`, `rejected` or `reversed`.
- `GET /wallet/top-ups/{id}` returns one top-up, including `rejection_reason` and `transaction_reference`.

## 7. Creator: payout methods

### `GET /wallet/payout-methods`

Returns a list. Each item:

```json
{ "id": "...", "channel": "haram", "channel_label": "حوالات الهرم", "label": "Home",
  "is_default": true,
  "details": {"holder_name": "...", "phone": "+963912345678", "governorate": "damascus", "city": "Mezzeh"},
  "currencies": ["USD", "SYP"] }
```

- The primary method (`is_default: true`) comes first, then newest first. Once any method exists, exactly one is primary.

### `POST /wallet/payout-methods`

Body: `{channel, label?, details}`. Fields required in `details` for each channel:

| Channel | Fields |
|---|---|
| `haram`, `fouad` | `holder_name`, `phone` (`+9639XXXXXXXX`), `governorate` (lookup value), `city`? |
| `syriatel_cash`, `mtn_cash` | `holder_name`, `phone` |
| `sham_cash` | `holder_name`, `phone`, `account_code` (the Sham Cash wallet account code, 4–64 letters, digits or dashes) |
| `bank` | `holder_name`, `bank_name`, `account_number`, `iban`? |

- Unknown keys are dropped.
- A creator can save at most 10 methods (`422 payout_method_limit`).
- The first method saved becomes primary. Later ones are saved with `is_default: false`.

### `PATCH /wallet/payout-methods/{id}`

- Send `label` and/or the full `details` object.
- `channel` can't change; to switch channel, delete the method and create a new one.
- Changing `details` sends the owner a `wallet_payout_method_changed` push. A label-only edit, or resending the same details, sends nothing.

### `DELETE /wallet/payout-methods/{id}`

Deletes the method. Pending withdrawals already sent keep their own copy of the destination.

- Response: `{"default_payout_method_id": "..." | null}`, the primary method after the delete.
- Deleting the primary promotes the **newest remaining** method (top of the list after the primary). The confirm sheet can name it ahead of time. `null` means no methods are left.

### `POST /wallet/payout-methods/{id}/default`

Makes this method primary and clears the flag on the others. No body. Returns the method (`is_default: true`). Calling it on the current primary is a no-op `200`. Another user's method returns `404`.

## 8. Creator: withdrawals

### `GET /wallet/withdrawals/quote?payout_method_id=&amount_cents=&payout_currency=USD|SYP`

Call this on every amount change (debounced). Response:

```json
{
  "allowed": false,
  "reasons": [{"code": "cooldown_active", "label": "يُسمح بسحب واحد كل 7 أيام"}],
  "next_allowed_at": "2026-10-15T09:00:00Z",
  "gross": {...}, "fee": {...}, "net": {...},
  "net_payout": {"amount": 1379000, "formatted": "1,379,000", "currency": "SYP"},
  "exchange_rate": "14000.0000"
}
```

Possible reason codes:

| Code | Meaning |
|---|---|
| `account_inactive` | The account is not active |
| `kyc_required` | KYC is not verified |
| `wallet_frozen` | The wallet is frozen |
| `withdrawals_paused` | Withdrawals are paused platform-wide |
| `below_minimum` | Below the $25 minimum |
| `daily_limit_exceeded` | Over $500 for the day |
| `open_request_exists` | The creator already has a pending withdrawal |
| `cooldown_active` | Less than 7 days since the last withdrawal; use `next_allowed_at` |
| `insufficient_funds` | Not enough balance |
| `fx_rate_stale` | The exchange rate is stale (SYP payouts only) |
| `currency_not_supported` | The payout method doesn't accept that currency |
| `amount_below_fee` | The fee is larger than the amount |

Show every `label`. Disable Confirm when `allowed` is false.

### `POST /wallet/withdrawals`

Body: `{payout_method_id, amount_cents, payout_currency}`. Requires `Idempotency-Key`.
- **201** returns the withdrawal with `status: "pending"`.
- **422 `withdrawal_not_allowed`** returns `meta.reasons` (codes) and `meta.next_allowed_at`.

### Listing, detail and cancel

- `GET /wallet/withdrawals?status=` lists withdrawals. `status` is one of `pending`, `completed`, `rejected`, `cancelled` or `returned`.
- `GET /wallet/withdrawals/{id}` returns one withdrawal: `gross`, `fee`, `net`, `net_payout`, `exchange_rate`, `destination_label`, `receipt_number`, `rejection_reason`, `return_reason`.
- `POST /wallet/withdrawals/{id}/cancel` works only while `pending`. It requires `Idempotency-Key`. Otherwise it returns `409 withdrawal_not_pending`.

## 9. Push notifications (`data.type`, deep link `sada://wallet`)

| Type | Sent to |
|---|---|
| `wallet_top_up_completed` | brand |
| `wallet_top_up_rejected` | brand |
| `wallet_withdrawal_completed` | creator |
| `wallet_withdrawal_rejected` | creator |
| `wallet_withdrawal_returned` | creator |
| `wallet_wallet_frozen` | wallet owner |
| `wallet_wallet_unfrozen` | wallet owner |
| `wallet_payout_method_added` | creator (security alert; deep link `sada://wallet/payout-methods`) |
| `wallet_payout_method_changed` | creator (security alert, sent only when `details` change; deep link `sada://wallet/payout-methods`) |

`entity_id` is the top-up id, the withdrawal id, the wallet id, or the payout method id.

On receipt, refresh `GET /wallet` and the relevant list.

## 10. Screens checklist

**Brand:**
- Wallet card (available / pending / total)
- Top-up form with receipt picker and SYP preview
- Top-up history
- Statement
- Receipt

**Creator:**
- Wallet card
- Payout methods: list and add/edit form per channel
- Withdraw flow (amount → live quote → confirm), history, cancel
- Statement
- Receipt

**Both:**
- Stale-rate banner when `is_stale`
- Frozen-wallet banner when `status = frozen`
