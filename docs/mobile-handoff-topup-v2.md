# Wallet: Top-up Flow v2, Mobile Handoff Delta

Status: **API ready on `main`** (2026-10-09). Postman: `14 - Wallet & Finance` → `List Top-up Channels`, `Download Top-up Receipt (signed)`. Admin: `12 - Admin / Finance - Admin` → `*Top-up Channel*`, `*Receiving Account*`.
Base contract: [mobile-handoff.md](mobile-handoff.md) (phase 1). Everything below is **additive**. No phase 1 field was removed or renamed.

Conventions are unchanged: the standard envelope, MoneyDto `{amount, formatted, currency}` in minor units, every `*_label` localized from `Accept-Language` (`ar` default), ISO 8601 UTC times, and brand only (an influencer gets `403 forbidden_user_type`).

## 1. New: `GET /wallet/top-ups/channels`

Brand only. Send `Cache-Control: no-store`, and refetch each time the flow opens.

```json
{
  "channels": [
    {
      "channel": "haram",
      "label": "حوالات الهرم",
      "group": "exchange_office",
      "group_label": "مكاتب الحوالات",
      "currencies": ["USD", "SYP"],
      "enabled": true,
      "disabled_reason": null,
      "disabled_label": null,
      "limits": {
        "USD": { "min": {"amount": 1000, "formatted": "10.00", "currency": "USD"},
                 "max": {"amount": 1000000, "formatted": "10,000.00", "currency": "USD"} },
        "SYP": { "min": {"amount": 140000, "formatted": "140,000", "currency": "SYP"},
                 "max": {"amount": 140000000, "formatted": "140,000,000", "currency": "SYP"} }
      },
      "accounts": [
        {
          "id": "01JB...",
          "fields": [
            { "key": "recipient_name", "label": "اسم المستلم", "value": "شركة صدى للتسويق", "copyable": true },
            { "key": "phone", "label": "رقم الجوال", "value": "+963 9xx xxx xxx", "copyable": true },
            { "key": "city", "label": "المدينة", "value": "دمشق", "copyable": false }
          ]
        }
      ],
      "instructions": "أرسل المبلغ نفسه تماماً، واحتفظ بإيصال الحوالة.",
      "processing_time_label": "عادةً خلال 24 ساعة عمل"
    },
    {
      "channel": "syriatel_cash",
      "label": "سيريتل كاش",
      "group": "e_wallet",
      "group_label": "المحافظ الإلكترونية",
      "currencies": [],
      "enabled": false,
      "disabled_reason": "fx_rate_stale",
      "disabled_label": "سعر الصرف قيد التحديث، حاول لاحقاً",
      "limits": {},
      "accounts": [],
      "instructions": null,
      "processing_time_label": null
    }
  ],
  "exchange_rate": { "id": "01J...", "base": "USD", "quote": "SYP", "rate": "14000.0000", "source": "manual",
                     "is_stale": false, "locked_until": null, "effective_at": "2026-10-09T07:00:00Z" },
  "payer_reference": "SD-7K3M9QXA"
}
```

Rules:
- **Order:** show `channels[]` in the order sent (admins control it). Group by `group` in the order each group first appears. The default order is haram, fouad, syriatel_cash, mtn_cash, bank.
- **`group`:** `exchange_office` | `e_wallet` | `bank`.
- **`currencies`:** what the channel accepts **right now**. When the rate is stale or missing, `SYP` is removed. The SYP-only channels (`syriatel_cash`, `mtn_cash`) then become `enabled: false`.
- **`disabled_reason`:** one of
  - `channel_paused`: an admin paused the channel, or Sada has no active receiving account on it.
  - `fx_rate_stale`: the rate is stale (SYP-only channels).
  - `fx_rate_unavailable`: no rate has been set (SYP-only channels).

  Show the channel dimmed with `disabled_label`.
- **Disabled channels** always return `accounts: []` and `limits: {}` when no currency is left. Never show a stale account.
- **`limits`:** one entry per currency in `currencies`, as MoneyDto. SYP is the USD range ($10 – $10,000) converted at the current rate. The minimum is rounded up and the maximum rounded down, so **any amount inside the advertised range is accepted** by the server. Remove the hardcoded limits from the app.
- **`accounts[].fields[]`:** render one row per field (`label`, `value`, plus a copy button when `copyable`). Possible `key` values are `recipient_name`, `phone`, `city`, `office`, `wallet_number`, `account_name`, `bank_name`, `account_holder`, `account_number`, `iban`, `swift` and `note`. Treat `key` as informational and render unknown keys the same way. `value` can differ per language (for example `دمشق` / `Damascus`).
- **More than one account:** show them all. The brand does **not** pick one. Finance matches payments by `payer_reference` + `transfer_reference` + amount, so the POST needs no account id.
- **`instructions` / `processing_time_label`:** localized, or `null`. Hide the line when `null`.
- **`exchange_rate`:** the same object as `GET /finance/exchange-rate`, or `null`.
- **`payer_reference`:** a stable per-brand code. Show it in the "Send to" card with a copy button and the copy: "اكتب هذا الرمز في ملاحظة الحوالة". It's optional for the brand, but it speeds up matching.

## 2. Top-up object (POST 201, list items, detail)

All three endpoints now return the same full shape. The list **includes** `receipt` and `rejection_reason` (they're cheap).

```json
{
  "id": "01JB...",
  "status": "pending_review",
  "status_label": "قيد المراجعة",
  "channel": "haram",
  "channel_label": "حوالات الهرم",
  "amount":     {"amount": 1400000, "formatted": "1,400,000", "currency": "SYP"},
  "amount_usd": {"amount": 10000, "formatted": "100.00", "currency": "USD"},
  "exchange_rate": "14000.0000",
  "transfer_reference": "HR-2291045",
  "has_receipt": true,
  "receipt": {
    "url": "https://api.sada.sy/api/v1/wallet/top-ups/01JB.../receipt?expires=1760000600&signature=...",
    "mime_type": "image/jpeg",
    "size_bytes": 812345,
    "name": "receipt.jpg",
    "expires_at": "2026-10-09T10:10:00Z"
  },
  "rejection_reason": null,
  "reversal_reason": null,
  "transaction_reference": null,
  "submitted_at": "2026-10-09T10:00:00Z",
  "created_at": "2026-10-09T10:00:00Z",
  "reviewed_at": null,
  "completed_at": null,
  "reversed_at": null
}
```

- **`amount`** is what the brand sent, in the sent currency. **`amount_usd`** is what is or will be credited. **`exchange_rate`** is the rate locked at submission (`null` for USD).
- **`receipt`** is `null` when there is no file (dev mock mode).
  - `url` is a signed link that expires after **10 minutes**. It needs no auth header, so images load inline and PDFs open in the browser.
  - The link is only issued to the owner. A request that carries another user's bearer token gets 403, and so does a tampered or expired link.
  - Re-fetch the detail to get a fresh link after `expires_at`.
  - `size_bytes` may be `null` for top-ups created before this release.
- **`rejection_reason` / `reversal_reason`:** text written by the Sada finance team. Show it as-is. It isn't machine-localized: finance writes in Arabic.
- **`transaction_reference`:** set once the wallet is credited. Open `GET /wallet/transactions/{reference}` with it. It stays set after a reversal (the reversal is a separate ledger line).
- **Timeline:**

  | Step | Field |
  |---|---|
  | Sent | `submitted_at` |
  | Sada review | `reviewed_at`, set on approval and on rejection |
  | Added to wallet | `completed_at` |
  | Reversed | `reversed_at` (and `completed_at` stays) |

- `has_receipt` and `created_at` are kept for phase 1 builds. Use `receipt` and `submitted_at` from now on.
- **List:** `GET /wallet/top-ups?status=&per_page=20&page=` returns newest first, with the same `{items, meta: {current_page, last_page, total}}` as `GET /wallet/transactions`. `status` takes `pending_review`, `completed`, `rejected` or `reversed`. Omit it for all statuses.

## 3. `POST /wallet/top-ups` errors

Request fields are unchanged. All 422s now carry `errors` keyed by field (`channel`, `currency`, `amount`, `transfer_reference`, `receipt`), including the business-rule ones:

| Status | `error_code` | `errors` key | Extra |
|---|---|---|---|
| 422 | `validation_failed` | any field | Laravel field map |
| 422 | `currency_not_supported` | `currency` | |
| 422 | `top_up_amount_out_of_range` | `amount` | `meta.min`, `meta.max` (MoneyDto in the **sent** currency) |
| 422 | **new** `transfer_reference_duplicate` | `transfer_reference` | |
| 409 | **new** `channel_paused` | — | refetch channels |
| 409 | **new** `top_up_pending_limit` | — | `meta.max_pending` (5) |
| 409 | `fx_rate_stale`, `fx_rate_unavailable`, `wallet_frozen`, `wallet_closed` | — | unchanged |
| 403 | `kyc_required` | — | unchanged |

```json
{
  "success": false,
  "message": "يجب أن يكون مبلغ الشحن بين 140,000 SYP و 140,000,000 SYP",
  "error_code": "top_up_amount_out_of_range",
  "errors": { "amount": ["يجب أن يكون مبلغ الشحن بين 140,000 SYP و 140,000,000 SYP"] },
  "meta": {
    "locale": "ar",
    "min": {"amount": 140000, "formatted": "140,000", "currency": "SYP"},
    "max": {"amount": 140000000, "formatted": "140,000,000", "currency": "SYP"}
  }
}
```

- **Duplicate reference:** a `transfer_reference` already used on the **same channel** by any brand is rejected.
  - The comparison ignores case, spaces and punctuation, so `hr 2291-045` = `HR2291045`.
  - A **rejected** top-up frees its reference, so the brand can resubmit the same transfer with a clearer receipt.
  - The same reference on a different channel is allowed.
- **`channel_paused`:** the channel was paused after the list was loaded. Refetch `/wallet/top-ups/channels` and send the brand back to step 1. The message tells them to contact support if they already sent the money.
- **Idempotency:** unchanged from handoff §3. A fixed 4xx doesn't consume the key, so reusing it after the fix is correct.

## 4. Push

| Type | When | `entity_id` | `deep_link` |
|---|---|---|---|
| `wallet_top_up_completed` | approved / credited | top-up id | `sada://wallet/top-ups/{id}` (**changed**) |
| `wallet_top_up_rejected` | rejected | top-up id | `sada://wallet/top-ups/{id}` (**changed**) |
| **new** `wallet_top_up_reversed` | reversed after completion | top-up id | `sada://wallet/top-ups/{id}` |

Other wallet pushes keep `sada://wallet`. Add `sada://wallet/top-ups/{ulid}` to the allow-list before this backend ships, or older builds will drop the tap.

## 5. Answers

1. **Rate lock:** the rate is locked **at submission**. `amount_usd` and `exchange_rate` on the 201 are final, and approval credits exactly that amount. You can show `amount_usd` as the final "You'll receive" value after submission. Before submission, the client preview is still an estimate.
2. **Review time:** this is set per channel by the finance team (`processing_time_label`, ar/en) and is `null` until they set it. **Open item:** the business still has to confirm the promise (the proposed default is "usually within 24 working hours"). The app must handle `null`.
3. **`reversed`:** this happens only **after `completed`**. Finance reverses the credit when the transfer bounces, turns out to be fraudulent, or was credited by mistake.
   - The money **is removed** from the wallet balance, through a separate `reversal` ledger line.
   - `reversal_reason` and `reversed_at` are set, and the `wallet_top_up_reversed` push is sent.
   - If the brand has already spent the money, the reversal is refused (`insufficient_funds`) and finance handles it manually, so `reversed` always means the money was actually taken back.
   - Use a negative/red status color. Suggested copy: "تم عكس الشحن وخصم المبلغ من محفظتك".
4. **Payment matching:** yes. Use the top-level `payer_reference` (`SD-XXXXXXXX`, stable per brand). Show it with a copy button and ask the brand to put it in the transfer note. Finance also sees it on the admin review screen.
5. **Open top-up limit:** yes, at most **5** `pending_review` top-ups per brand. Over the limit returns `409 top_up_pending_limit` with `meta.max_pending`.
6. **Dev mock mode:** the 201 already has `status: completed` with `transaction_reference`, `reviewed_at` and `completed_at` filled in, and `receipt: null`. A push is sent as in production.

## 6. Screens checklist (delta)

- Step 1: channel list grouped by `group`, with dimmed rows that show `disabled_label`.
- Step 2: currency chips from `currencies`, and min/max from `limits` (no hardcoded values).
- Step 3: "Send to" card for each account, with copyable rows, the `payer_reference` row, and `instructions`.
- Step 3: field errors from `errors.*`, and the range hint from `meta.min` / `meta.max`.
- Submitted: show `processing_time_label` (hidden when `null`).
- History: status filter tabs (all / 4 statuses), with pagination like the statement.
- Detail: timeline from the stamps, the rejection or reversal reason, the receipt viewer (signed URL, refreshed after `expires_at`), and a link to the ledger receipt.
- Deep link `sada://wallet/top-ups/{id}` → top-up detail.
