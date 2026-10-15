# Backend task — Deal shipping address (B5.1)

For: the Laravel backend (Direct Deals engine). Implement **exactly** as written; the mobile app (P5) is already built against this contract. Anything unclear → ask before changing a name, a code or a shape.

## Why

A deal with a product (`shipping_mode` = `gift` or `returnable`) needs the creator's delivery address and phone, so the brand can hand them to the courier. Today the API has no address at all. The creator gives it **when signing** (accept, or the extension request that signs the contract), can fix it until the product is shipped, and the brand sees it **only while it has to ship**.

## 1. The address object

Request body (`shipping_address`), every string trimmed:

| Field | Rule |
|---|---|
| `recipient_name` | required, string 2–100 |
| `phone` | required, E.164, Syrian mobile only: `^\+9639\d{8}$` |
| `governorate_id` | required, an id from `GET /lookups` → `governorates` |
| `city` | required, string 2–100 (city / town) |
| `area` | required, string 2–150 (neighbourhood / district) |
| `address_line` | required, string 5–255 (street, building, floor) |
| `landmark` | optional, string ≤ 150, nullable (nearest landmark) |
| `notes` | optional, string ≤ 300, nullable (delivery notes, best time) |

Response shape (`DealShippingAddressResource`):

```json
{
  "recipient_name": "سارة الحلبي",
  "phone": "+963944123456",
  "governorate": { "id": "01J…", "label": "دمشق" },
  "city": "دمشق",
  "area": "المزة",
  "address_line": "شارع الجلاء، بناء 12، الطابق 3",
  "landmark": "قرب جامع الأكرم",
  "notes": null,
  "updated_at": "2026-10-15T09:30:00+03:00"
}
```

`governorate.label` is localized by `Accept-Language` like every other label.

Validation errors (422) use dotted keys in `errors`: `shipping_address.recipient_name`, `shipping_address.phone`, `shipping_address.governorate_id`, `shipping_address.city`, `shipping_address.area`, `shipping_address.address_line`, `shipping_address.landmark`, `shipping_address.notes`. On the PUT endpoint (§3.3) the keys are **without** the prefix (`phone`, `city`, …).

## 2. Deal resource changes

Inside the existing `shipping` object add two fields:

```json
"shipping": {
  "ship_by": "…",
  "reships_left": 1,
  "free_cancel_from": null,
  "shipments": [],
  "address": { …DealShippingAddressResource… } | null,
  "address_editable": true
}
```

- `address`
  - **Influencer**: always their own address once given (any status).
  - **Brand**: only while status is `product_shipping` or `shipping_issue`. Every other status → `null` (before funding they don't need it; after receipt they no longer need it).
  - **List endpoints** (`GET /brand/deals`, `GET /influencer/deals`, Brand Home) → always `null`. Only the detail (`GET …/deals/{id}`) and action responses carry it.
- `address_editable` — `true` only for the influencer, while status is `awaiting_payment`, `negotiating_deadline`, `product_shipping` with **no shipment in transit** (no shipment yet, or the latest has an open issue), or `shipping_issue`. Always `false` for the brand.
- `shipping` stays `null` for deals with `shipping_mode = none` (unchanged).

## 3. Endpoints

### 3.1 Accept — `POST /influencer/deals/{id}/accept`
Body: `{ device_id, shipping_address? }`.
- `shipping_address` is **required** when the deal's `shipping_mode` ≠ `none` (422 with `errors.shipping_address` when missing), and **ignored** otherwise.
- Stored on the deal in the same transaction as the signature. Idempotency-Key behaviour unchanged (same key + same body = replay).

### 3.2 Extension — `POST /influencer/deals/{id}/extension`
Body: `{ delivery_days, reason, device_id, shipping_address? }`. Same rule as accept (this request signs the contract too).

### 3.3 Edit — `PUT /influencer/deals/{id}/shipping-address`
Body: the address fields at the top level (no `shipping_address` wrapper). Response: the full deal in `data` (same as every action).
- Only when `shipping.address_editable` is true → else **409 `deal_address_locked`**.
- Also allowed when `address` is still `null` on an older deal (see §5).
- Timeline: a note row (`from == to`), reason `address_updated`, **no address data in `metadata`**.
- Push to the brand `deal_address_updated` (deep link to the deal) only when status is `product_shipping` or `shipping_issue`.

### 3.4 Prefill — `GET /influencer/shipping-address`
Response `data`: the influencer's **last used** address (from their most recent deal that has one) as `DealShippingAddressResource`, or `null`. Read-only; nothing else to store.

### 3.5 Ship — `POST /brand/deals/{id}/shipment` (existing)
New guard: deal has no address → **409 `deal_address_missing`** (message: "The creator hasn't added a delivery address yet."). Re-ship and the edit PUT are unaffected.

## 4. Privacy (mandatory)

- Store the address columns with Laravel's `encrypted` cast (phone and address are PII).
- Never put the address or phone in: push payloads, timeline `metadata`, the contract snapshot / PDF, logs, analytics, Brand Home.
- The contract snapshot only says the product ships to "the address the creator provided in the app".
- Admin panel may show it (dispute handling).

## 5. Older deals

Deals already past acceptance with a product and no address: `address: null`, `address_editable: true` while `product_shipping` / `shipping_issue`. The creator adds it through §3.3. Shipping is blocked by §3.5 until then. Don't change `ship_by` for these.

## 6. Error codes (add to the enum + handoff)

| Code | HTTP | When |
|---|---|---|
| `deal_address_locked` | 409 | PUT after the product shipped / deal left the editable statuses |
| `deal_address_missing` | 409 | Brand ships before the creator gave an address |

## 7. Tests (Pest)

- accept / extension with product: 422 without address; stored with it; ignored for `shipping_mode = none`.
- 422 keys for each invalid field (prefixed on accept/extension, bare on PUT); phone regex.
- visibility matrix: influencer always; brand only in `product_shipping` / `shipping_issue`; lists always `null`.
- `address_editable` per status, incl. after ship (false) and during `shipping_issue` (true).
- PUT → 409 `deal_address_locked` when not editable; note row has no address in metadata; push only in shipping statuses.
- prefill returns the latest address or `null`.
- ship → 409 `deal_address_missing`.
- encrypted at rest (raw DB value ≠ plain text).

## 8. Handoff + Postman

- `docs/direct-deals/direct-deals.md` (backend repo): add to M4 (accept/extension body) and M5 (fields, PUT, GET prefill, the two codes, push kind `address_updated`, note reason `address_updated`).
- Postman: "Influencer Deals" → accept with address, PUT shipping-address, GET shipping-address; "Brand Deals" → ship 409 `deal_address_missing`.
