You are working on the Sada backend (B2B influencer marketplace, escrow wallet, Syria-first, Arabic-first). The mobile app is building the brand top-up flow from an approved design: choose channel → amount (with SYP preview) → send the money to Sada + enter the transfer reference + upload the receipt → review → submitted. It also adds a top-up history list and a top-up detail screen (timeline, rejection reason, receipt).

The phase 1 wallet handoff (§6 Brand: top-ups) covers `POST /wallet/top-ups`, `GET /wallet/top-ups` and `GET /wallet/top-ups/{id}`. It doesn't cover everything the flow needs. The main gap: **the app has no way to know where the brand must send the money** (Sada's receiving account for each channel). Please add the endpoint and fields below without breaking phase 1. Additive changes only.

## Conventions (keep them)
- Envelope `{ success, message, data, error_code, errors, meta }`. On 422, `errors` is a field map.
- Every amount is a MoneyDto `{ amount, formatted, currency }`, with `amount` an integer in minor units (USD cents, SYP whole pounds). Never floats.
- Every `*_label` and every human-readable text is localized from `Accept-Language` (ar | en).
- The server computes all money. The client SYP preview (`floor(amount_syp * 100 / rate)` cents) is only an estimate, clearly labelled as one.
- Times are ISO 8601 UTC. Days and "today" use Asia/Damascus.
- Brand only. An influencer calling these endpoints gets 403.

## 1. New `GET /wallet/top-ups/channels`: channels + Sada's receiving accounts
Powers step 1 (choose channel), step 2 (currency + limits) and step 3 ("Send to" card with copy buttons).
```json
{
  "channels": [{
    "channel": "haram",
    "label": "الهرم",
    "group": "exchange_office",
    "group_label": "مكاتب الحوالات",
    "currencies": ["USD", "SYP"],
    "enabled": true,
    "disabled_reason": null,
    "disabled_label": null,
    "limits": {
      "USD": { "min": MoneyDto, "max": MoneyDto },
      "SYP": { "min": MoneyDto, "max": MoneyDto }
    },
    "accounts": [{
      "id": "01J...",
      "fields": [
        { "key": "recipient_name", "label": "اسم المستلم", "value": "شركة صدى للتسويق", "copyable": true },
        { "key": "phone", "label": "رقم الجوال", "value": "+963 9xx xxx xxx", "copyable": true },
        { "key": "city", "label": "المدينة", "value": "دمشق", "copyable": false }
      ]
    }],
    "instructions": "أرسل المبلغ نفسه تماماً، واحتفظ بإيصال الحوالة.",
    "processing_time_label": "عادةً خلال 24 ساعة عمل"
  }],
  "exchange_rate": { "rate": "14000.0000", "is_stale": false, "effective_at": "..." } | null
}
```
- `channel`: one of `haram`, `fouad`, `syriatel_cash`, `mtn_cash`, `bank` (same enum as the POST). Order the array in the order the app should show it.
- `group`: `exchange_office` | `e_wallet` | `bank`. The app groups by it, in the order it first appears.
- `currencies`: the currencies the channel accepts **right now**. When the rate is stale or missing, remove `SYP` (and set `enabled: false` with a reason on SYP-only channels: `syriatel_cash`, `mtn_cash`).
- `enabled` / `disabled_reason` / `disabled_label`: lets admins pause a channel (for example, Sada's account at that office is temporarily unavailable). Codes: `channel_paused`, `fx_rate_stale`, `fx_rate_unavailable`. The app shows the channel dimmed with `disabled_label`.
- `limits`: per accepted currency, as MoneyDto. USD = $10 – $10,000 today. SYP = the same range converted at the current rate. Today the limits are hardcoded in the app; this makes the server the source.
- `accounts`: admin-managed receiving accounts (at least one when `enabled`). `fields` is generic, so each channel type can send what it needs without new app releases:
  - exchange office: recipient name, phone, city / office
  - e-wallet: wallet number, account name
  - bank: bank name, account holder, account number, IBAN, SWIFT if any

  The app renders every field as a row (label + value + a copy button when `copyable`). If a channel has more than one account, the app shows them all; tell us if the brand should pick one instead.
- `instructions`: optional short localized line shown under the card (`null` if none).
- `processing_time_label`: optional localized review time ("usually within 24 working hours"), shown on the submitted screen. `null` if Sada can't promise one.
- `exchange_rate`: the same snapshot as `GET /finance/exchange-rate`, so step 2 needs one request only. `null` when no rate is set.
- Caching: the app refetches this when the flow opens. Plain no-cache is fine.

## 2. The top-up object (POST 201, list item, detail)
Phase 1 doesn't document the full shape. Please return this from all three endpoints (the list may leave out `receipt` and `rejection_reason` if that's heavy; tell us):
```json
{
  "id": "01J...",
  "status": "pending_review",
  "status_label": "قيد المراجعة",
  "channel": "haram",
  "channel_label": "الهرم",
  "amount": MoneyDto,
  "amount_usd": MoneyDto,
  "exchange_rate": "14000.0000" | null,
  "transfer_reference": "HR-2291045",
  "receipt": { "url": "https://...signed...", "mime_type": "image/jpeg", "size_bytes": 812345, "name": "receipt.jpg", "expires_at": "..." },
  "rejection_reason": "الإيصال غير واضح" | null,
  "reversal_reason": "..." | null,
  "transaction_reference": "TX-..." | null,
  "submitted_at": "...",
  "reviewed_at": "..." | null,
  "completed_at": "..." | null,
  "reversed_at": "..." | null
}
```
- `amount`: what the brand sent, in the sent currency. `amount_usd`: what is (or will be) credited to the wallet. `exchange_rate`: the rate used for SYP (`null` for USD).
- `receipt.url`: a short-lived signed URL that only the owner can open (the app shows images inline and opens PDFs). Never a public permanent URL.
- `rejection_reason` / `reversal_reason`: localized, human-readable, shown as-is.
- `transaction_reference`: the wallet ledger line once credited, so the app can open the receipt (`GET /wallet/transactions/{reference}`). `null` until then.
- The timestamps drive the detail timeline (sent → Sada review → added to wallet / rejected / reversed). Please set them on every status change.
- List (`GET /wallet/top-ups?status=&per_page=20&page=`): newest first, same pagination meta as `GET /wallet/transactions`. The `status` filter must accept all four values, and no value = all.

## 3. `POST /wallet/top-ups`: error details
- 422 field errors in `errors` with these keys, so the app can show them next to the right field: `channel`, `currency`, `amount`, `transfer_reference`, `receipt`.
- `top_up_amount_out_of_range`: please also add `meta.min` and `meta.max` as MoneyDto in the sent currency, so the app doesn't parse the message.
- New: a 409 `channel_paused` code when the channel was paused after the brand loaded the list.
- Duplicate transfer: does a reused `transfer_reference` on the same channel get rejected (`422 transfer_reference_duplicate`)? We'd like it to.
- Keep the idempotency rules from the handoff §3 unchanged. The app sends one key per wizard session and reuses it after a fixed 4xx.

## 4. Push
- Keep `wallet_top_up_completed` and `wallet_top_up_rejected` (`entity_id` = top-up id).
- Add `wallet_top_up_reversed` if reversal can happen after completion (see §5.3).
- Deep link: please send `sada://wallet/top-ups/{id}` for these pushes instead of `sada://wallet`, so a tap opens the top-up detail. The app validates the link against an allow-list.

## 5. Questions to answer in your reply
1. Rate lock: for SYP top-ups, is the rate fixed at submission or at approval? If at approval, `amount_usd` can change, and the app will keep showing it as an estimate until `completed`.
2. Review time: what can we promise the brand? This becomes `processing_time_label`.
3. `reversed`: when does it happen (after `completed`, for example a bounced bank transfer?) and is the money removed from the balance? We need the exact meaning to write the copy and choose the status color.
4. Payment matching: should the brand write a code in the transfer note (for example a per-brand "Sada code") so the finance team can match the payment? If yes, add it to `accounts[]` or as a top-level `payer_reference` and we'll show it with a copy button.
5. Is there a limit on open `pending_review` top-ups per brand? If yes, which error code?
6. Dev mock mode returns `completed` straight away. Does it also fill `transaction_reference` and the timestamps?

## Deliverables
- The endpoint and fields above, with feature tests: brand happy path, influencer 403, stale rate (SYP removed, SYP-only channels disabled), a paused channel, no rate set, the out-of-range meta, a duplicate reference, and the receipt URL being owner-only.
- An admin way (panel or seeder) to manage channel accounts, instructions and pause state.
- A short handoff delta in the same style as the phase 1 wallet handoff: JSON examples for each new field and endpoint, plus answers to §5.
