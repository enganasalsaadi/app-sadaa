# Account hold: mobile handoff (API 2026-10-23)

When Sada suspends a brand or creator, their deals and campaigns pause. The suspended user is logged out, so these changes are seen by **the other side**.

## What the app receives

| Where | Field / code | Meaning |
|---|---|---|
| `DealResource` (deal list + detail) | `on_hold: { since } \| null` | The deal is paused. Timers are stopped (`due_at` keeps its old value; don't count down). Both sides are read-only. |
| `DealReturnShipmentResource` | `on_hold: boolean` | The creator's account is under review; no reminder or strike until it ends. |
| `DealResource.rating` (completed deals) | `on_hold: boolean` | The 7-day rating window is paused. `open` stays `true`, so the active side can still rate; don't count down `due_at`. |
| `DealRetentionCaseResource` | `on_hold: boolean` | The 24h answer clock is paused (no escalation, no auto-close). Don't count down `due_at`. |
| Any deal action on a paused deal | `409 deal_party_suspended` (meta `held_at`) | Show the localized `message`, refresh the deal. Never retry automatically. |
| `POST /brand/deals/{id}/send` to a suspended creator | `422 deal_creator_unavailable` | Existing error, now also returned when the creator's account is suspended. |

The API never says **who** was suspended. Copy should read "paused while Sada reviews an account".

## Pushes (`type` = `deal_<kind>`, deep link `sada://deals/{id}`)

| Kind | To | When |
|---|---|---|
| `deal_on_hold` | the active side | A paid deal paused. |
| `deal_hold_released` | both sides | Paused deal resumed. Every timer got its remaining time back, at least 24h. Refetch. |
| `deal_cancelled_on_hold` | the active side | An unpaid offer was cancelled because of the review. No strike. |
| `deal_hold_resolved` | the active side | Sada settled the paused deal (status `resolved_refund` / `resolved_payout` / `resolved_split`). |

## UI to build

1. Deal detail: when `on_hold` is set, show a banner (Arabic default): «الصفقة معلّقة مؤقتاً ريثما يراجع فريق صدى أحد الحسابات. المؤقتات متوقفة.» Hide or disable every action button, and stop countdowns.
2. Deal cards / lists: a small "معلّقة" chip; no countdown.
3. Return card: when `return_shipment.on_hold` is set, replace the waybill countdown with the same paused note.
4. Handle `deal_party_suspended` like other 409 deal errors: show the message and refetch.
5. Rating card and retention case card: when `on_hold` is set, show the paused note instead of the countdown.

On resume `due_at` values (deal, items, brief exit `ship_from` / `exit_until`, rating, retention) change: refetch on `deal_hold_released`.

The TypeScript DTO (`src/domains/marketplace/types/dealDto.ts`) already has every optional field.
