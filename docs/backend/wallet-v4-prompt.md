You are working on the Sada backend (B2B influencer marketplace, escrow wallet, Syria-first, Arabic-first). The mobile app is building the Wallet tab from an approved design. The current wallet API (phase 1 handoff: GET /wallet, GET /wallet/transactions, GET /wallet/transactions/{reference}, GET /finance/exchange-rate, top-ups, payout methods, withdrawals) does not return everything the design shows. Please add the fields and endpoints below without breaking phase 1. Additive changes only.

## Conventions (keep them)
- Envelope `{ success, message, data, error_code, errors, meta }`.
- Every amount is a MoneyDto `{ amount, formatted, currency }`, with `amount` an integer in minor units (USD cents, SYP whole pounds). Never floats.
- Every `*_label` is localized from `Accept-Language` (ar | en).
- The server computes all money. The app never sums or derives amounts.
- Months and "today" use Asia/Damascus.
- Role: `brand` or `influencer` (creator). Fields that apply to one role only are `null` for the other.

## 1. `GET /wallet`: add `summary`
```json
"summary": {
  "month_in": MoneyDto,
  "escrow": MoneyDto,
  "pending_top_ups": MoneyDto | null
}
```
- `month_in`: credits that entered the wallet this calendar month.
  - Creator: escrow releases (net) + promo credits.
  - Brand: completed top-ups.
  - Shown as "▲ 640 $ came in this month".
- `escrow`:
  - Creator: total held in escrow for the creator on active deals, as the NET amount they will receive after commission. This is NOT in their balance yet. Today `pending` for a creator is open withdrawals only, so this number is missing.
  - Brand: the same value as `pending` (held from the wallet).
- `pending_top_ups`: brand only, the sum of top-ups in `pending_review`. `null` for creators.

## 2. New `GET /wallet/escrows?per_page=5`: active escrow per deal (both roles)
Powers the "money on its way to you" card (creator: brand → Sada escrow → your wallet) and "your money in escrow" (brand: your wallet → Sada escrow → creator).
```json
{
  "items": [{
    "deal_id": "01J...",
    "deal_title": "حملة الصيف",
    "counterparty": { "type": "brand|influencer", "id": "01J...", "name": "Zara Home", "avatar_url": "https://... | null" },
    "amount": MoneyDto,
    "status": "held",
    "status_label": "في الضمان",
    "release_hint": "تُحرَّر تلقائياً بعد تأكيد النشر",
    "held_at": "2026-10-08T18:30:00Z"
  }],
  "meta": { "current_page": 1, "last_page": 1, "total": 3, "total_amount": MoneyDto }
}
```
- Creator `amount` = net to receive. Brand `amount` = gross held.
- `release_hint`: one localized line saying what releases the money at the deal's current stage (it differs per stage).
- Order: the deal closest to release first. Tell us if you prefer a different order.

## 3. New `GET /wallet/earnings?period=6m|12m`: monthly chart
Creator = "your earnings". Brand = "your campaign spend".
```json
{
  "period": "6m",
  "total": MoneyDto,
  "buckets": [ { "month": "2026-05", "amount": MoneyDto } ],
  "current_month": "2026-10"
}
```
- Always return every month in the period, including zero months, oldest first.
- Creator bucket = escrow releases credited that month (net).
- Brand bucket = escrow holds that month minus escrow refunds that month.
- Please document the exact definitions in the handoff.

## 4. `GET /wallet/transactions` (and the receipt): add fields to each item
```json
"description": "نبض كافيه",
"counterparty": { "type": "brand|influencer|payout_channel|top_up_channel", "name": "...", "avatar_url": null } | null,
"status": "pending" | null,
"status_label": "قيد التحويل" | null,
"affects_balance": true
```
- `description`: a short localized subject. The app renders `type_label · description`, for example "Escrow release · Nabd Café", "Withdrawal to Sham Cash", "Top-up · Al Haram". Use the deal or brand name for escrow lines, the payout destination for withdrawals, and the channel for top-ups.
- `status` / `status_label`: only for lines whose lifecycle is still open. A `withdrawal_request` shows `pending` until it completes, is rejected or is cancelled. Use `null` once final, so a pill shows only when needed.
- SYP payouts: fill `original` (the SYP amount paid out) and `exchange_rate` on withdrawal lines, so the app can show "≈ 8,320,000 ل.س".
- `source`: confirm that escrow lines carry `{ "type": "deal", "id": ... }` so the app can link to the deal.

## 5. Questions to answer in your reply
1. Platform commission: the design shows a separate creator line "Sada commission · 5%, −20 $" next to the release "+400 $". Is commission its own ledger line? If yes, add a `platform_fee` type (or name the existing one) with `details.rate_percent`. If it's inside `escrow_split`, tell us how to show it.
2. Creator escrow memo line: the design shows "Escrow hold · Zara Home, 1,250 $, in escrow" in the CREATOR's ledger without a sign. It isn't in their balance. Can you emit memo lines with `affects_balance: false` and `balance_after: null`? If not, we'll show escrow only in the card from §2.
3. Can creators add payout methods before their ID check (KYC) is approved?
4. Is there a deal detail endpoint the "Deal" link can open, or should the link stay hidden for now?

## Deliverables
- Endpoints and fields above, with feature tests for both roles (including empty wallets, zero months and a frozen wallet).
- A short handoff delta in the same style as the phase 1 wallet handoff: JSON examples for each new field and endpoint, plus answers to §5.
- Push: no new types needed. If §2 data changes (escrow held or released), the existing wallet pushes are fine; the app refreshes `/wallet`, `/wallet/escrows` and `/wallet/earnings` on any wallet push.
