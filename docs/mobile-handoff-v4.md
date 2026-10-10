# Wallet v4: Wallet Screen Insights, Mobile Handoff Delta

Status: **API ready on `main`** (2026-10-10). Postman: `14 - Wallet & Finance` → `Get Wallet`, `List Active Escrows`, `Wallet Earnings Chart`, `List Wallet Transactions`.
Base contract: [mobile-handoff.md](mobile-handoff.md) (phase 1) + [mobile-handoff-topup-v2.md](mobile-handoff-topup-v2.md). Everything below is **additive**. No existing field was removed or renamed.

Conventions are unchanged: the standard envelope, MoneyDto `{amount, formatted, currency}` in minor units (ledger = USD cents), every `*_label` localized from `Accept-Language` (`ar` default), ISO 8601 UTC times. **Months and "this month" use Asia/Damascus.** All endpoints are brand + influencer. Admins get `403`.

Role-only fields are `null` for the other role.

## 1. `GET /wallet`: new `summary`

```json
{
  "id": "01J...", "status": "active", "status_label": "نشطة", "currency": "USD",
  "available": {"amount": 150000, "formatted": "1,500.00", "currency": "USD"},
  "pending":   {"amount": 0, "formatted": "0.00", "currency": "USD"},
  "total":     {"amount": 150000, "formatted": "1,500.00", "currency": "USD"},
  "summary": {
    "month_in":        {"amount": 64000, "formatted": "640.00", "currency": "USD"},
    "escrow":          {"amount": 118750, "formatted": "1,187.50", "currency": "USD"},
    "pending_top_ups": null
  }
}
```

| Field | Creator | Brand |
|---|---|---|
| `month_in` | Credits this Damascus month: `escrow_release` (net) + creator share of `escrow_split` (dispute payout) + `promo_credit` | Credits this Damascus month: `top_up` (completed) + `promo_credit` |
| `escrow` | Sum of active holds (`held` + `disputed`) **net of commission**. Not in the balance. | Sum of active holds, **gross**. Equals `pending` today. |
| `pending_top_ups` | `null` | Sum of top-ups in `pending_review` (USD cents) |

`summary.escrow` always equals `GET /wallet/escrows` → `meta.total_amount`.

## 2. New: `GET /wallet/escrows?per_page=5`

Active escrow per deal (`held`, `disputed`). `per_page` 1–100, default 20.

```json
{
  "items": [
    {
      "id": "01JHOLD...",
      "deal_id": null,
      "deal_title": null,
      "counterparty": { "type": "brand", "id": "01J...", "name": "Zara Home", "avatar_url": "https://... | null" },
      "amount": {"amount": 112500, "formatted": "1,125.00", "currency": "USD"},
      "status": "held",
      "status_label": "محجوز",
      "release_hint": "تُحرَّر تلقائياً بعد تأكيد النشر",
      "held_at": "2026-10-08T18:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1, "last_page": 1, "total": 3,
    "total_amount": {"amount": 118750, "formatted": "1,187.50", "currency": "USD"}
  }
}
```

- `id` (additive): the escrow hold id. Use it as the list key.
- `amount`: creator = **net** to receive (gross − commission, rounded per hold); brand = **gross** held.
- `counterparty`: creator sees the brand (`type: "brand"`, company name); brand sees the creator (`type: "influencer"`). Brand side is `null` if no creator is assigned yet.
- `meta.total_amount`: sum across **all pages**, not only this page.
- **Order:** `held` before `disputed`, then the oldest hold first. Deals have no stage yet, so the oldest hold is the best "closest to release" signal we have. When deals ship, the order will follow the deal stage without changing the contract.
- `release_hint` today, per status:
  - `held`: ar "تُحرَّر تلقائياً بعد تأكيد النشر", en "Released automatically once the post is confirmed".
  - `disputed`: ar "مجمّدة حتى حلّ النزاع", en "On hold until the dispute is resolved".
  - When deals ship, each deal can give its own per-stage hint. It arrives in the same field.
- `deal_id` / `deal_title`: **`null` until deals ship.** Fall back to `counterparty.name` for the title.

## 3. New: `GET /wallet/earnings?period=6m|12m`

`period` defaults to `6m`. Any other value returns `422`.

```json
{
  "period": "6m",
  "total": {"amount": 158000, "formatted": "1,580.00", "currency": "USD"},
  "buckets": [
    { "month": "2026-05", "amount": {"amount": 90000, "formatted": "900.00", "currency": "USD"} },
    { "month": "2026-06", "amount": {"amount": 0, "formatted": "0.00", "currency": "USD"} },
    { "month": "2026-07", "amount": {"amount": 0, "formatted": "0.00", "currency": "USD"} },
    { "month": "2026-08", "amount": {"amount": 50000, "formatted": "500.00", "currency": "USD"} },
    { "month": "2026-09", "amount": {"amount": 0, "formatted": "0.00", "currency": "USD"} },
    { "month": "2026-10", "amount": {"amount": 18000, "formatted": "180.00", "currency": "USD"} }
  ],
  "current_month": "2026-10"
}
```

Exact definitions. A posting belongs to the Damascus calendar month of its timestamp, so 2026-09-30 22:30 UTC counts in **October**.

- **Creator bucket** = Σ wallet credits from `escrow_release` (net, after commission) + the creator share of `escrow_split` (dispute payout, no commission). Promo credits are **excluded**.
- **Brand bucket** = Σ `escrow_hold` that month − Σ `escrow_refund` that month − Σ the brand share of `escrow_split` that month. A month with large refunds can be **negative**, so render it below the axis or clamp it to 0 in the UI. `total` is the plain sum of buckets.
- Always exactly 6 or 12 buckets, oldest first. The last one is `current_month`, which is month-to-date.

## 4. `GET /wallet/transactions` and `GET /wallet/transactions/{reference}`: new fields per item

```json
{
  "reference": "TXN-...",
  "type": "escrow_release",
  "type_label": "تحرير دفعة الصفقة",
  "description": "Zara Home",
  "counterparty": { "type": "brand", "id": "01J...", "name": "Zara Home", "avatar_url": null },
  "status": null,
  "status_label": null,
  "affects_balance": true,
  "direction": "credit",
  "amount": {"amount": 36000, "formatted": "360.00", "currency": "USD"},
  "balance_after": {"amount": 36000, "formatted": "360.00", "currency": "USD"},
  "original": null,
  "exchange_rate": null,
  "source": { "type": "escrow_hold", "id": "01JHOLD..." },
  "details": { "gross_cents": 40000, "commission_cents": 4000, "rate_percent": 10 },
  "created_at": "2026-10-10T12:00:00Z"
}
```

`description` and `counterparty` by line:

| Line types | `description` | `counterparty.type` |
|---|---|---|
| `escrow_hold`, `escrow_release`, `escrow_refund`, `escrow_split` | deal title (once deals ship), else the other party's name | `brand` (creator wallet) or `influencer` (brand wallet); `null` if no creator |
| `withdrawal_request`, `withdrawal_cancel`, `withdrawal_reject`, `withdrawal_returned` | payout channel label (e.g. "شام كاش") | `payout_channel` (`id` = channel key) |
| `top_up` | top-up channel label (e.g. "حوالات الهرم") | `top_up_channel` (`id` = channel key) |
| `promo_credit`, `admin_adjustment`, `reversal`, others | `null` | `null` |

- Render `type_label · description`, and only `type_label` when `description` is `null`.
- `status` / `status_label` appear **only while the lifecycle is open**, otherwise `null`:
  - `withdrawal_request` → `"pending"` until the withdrawal is completed, rejected, cancelled or returned.
  - `escrow_hold` (brand) → `"held"` / `"disputed"` until it is released, refunded or settled.
- `affects_balance`: always `true` (see §5.2).
- **SYP withdrawals:** `original` (the SYP amount paid out) and `exchange_rate` are already filled on `withdrawal_request` lines, and were since phase 1, e.g. `"original": {"amount": 8320000, "formatted": "8,320,000", "currency": "SYP"}, "exchange_rate": "14000.0000"`. On USD payouts `original` carries the USD payout amount. Show "≈ … ل.س" only when `original.currency === "SYP"`.
- `source` on escrow lines is `{ "type": "escrow_hold", "id": <hold id> }`, **not** `deal`. The hold id equals `items[].id` in §2.

## 5. Answers

1. **Commission:** it is **not** its own ledger line. Commission stays inside the single `escrow_release` posting: the creator is credited the net, and Sada keeps the rest. To draw the design's "Sada commission · 10%, −40 $" sub-row, use `details` on the creator's `escrow_release` line: `gross_cents`, `commission_cents` and `rate_percent` (the rate snapshotted when the money was held, default 10). `+amount` is already net. Do not add the commission again. Dispute settlements (`escrow_split`) carry no commission.
2. **Creator escrow memo lines:** not emitted. The statement contains only real balance moves, so `affects_balance` is always `true` and `balance_after` is never `null`. Show escrow on the creator side through the §2 card only. The field is there so memo lines could be added later without a contract change.
3. **Payout methods before KYC:** **yes.** Creators can add, edit and delete payout methods at any time. Only **withdrawing** needs verified KYC: the quote and request return `kyc_required`.
4. **Deal detail endpoint:** **none yet.** Deals (Marketplace M2) are not built. Keep the "Deal" link hidden while `deal_id` is `null`. When deals ship, `deal_id`/`deal_title` fill in on `/wallet/escrows` with no app change needed for the card.

## Push

No new types. Refresh `/wallet`, `/wallet/escrows` and `/wallet/earnings` on any wallet push, as you planned.
