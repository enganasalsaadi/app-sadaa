# 06 — Business State Machines & Money

Sada handles escrowed money and legally binding deals. Client bugs here = lost trust or lost money.

## Server is the source of truth

- Deal/campaign status, wallet balance, escrow holds, commission, refunds are computed and transitioned **only by the backend**.
- Client never computes a next status locally and PUTs it. Client calls an **action endpoint** (`POST deals/:id/submit-draft`, `POST deals/:id/approve`) and renders the status the server returns.
- Client may show *allowed actions* from a transition map for UX, but the server re-validates.

## Deal state machine

Mirror backend enums exactly as string-literal unions in `domains/marketplace/types/`:

```ts
export const DEAL_STATUS = [
  'pending_approval',   // waiting creator acceptance
  'awaiting_payment',   // waiting brand payment into escrow
  'in_progress',        // creator producing content
  'under_review',       // draft uploaded, brand reviewing
  'ready_to_publish',   // draft approved
  'published',          // proof link submitted, tracking window
  'completed',          // funds released to creator wallet
  'disputed',           // support intervention
  'cancelled',
  'refunded',
] as const;
export type DealStatus = (typeof DEAL_STATUS)[number];
```

- Transition map, status→i18n key map, status→badge color token map live in `domains/marketplace/constants/` typed `Record<DealStatus, …>` so adding a status fails the build until every map is updated.
- Campaign lifecycle (`open → receiving_offers → selecting → selected → negotiating → agreed → …`) follows the same pattern.
- Unknown status from API → render a safe fallback + log, never crash.
- Every transition is covered by a unit test.

## Money

- Amounts are **integers in minor units** + ISO currency code: `{ amount: 1500000, currency: 'SYP' }`. Never floats, never formatted strings from API used for math.
- Type: `type Money = { amount: number; currency: CurrencyCode }` in `@/core` (shared money helpers + formatter, locale-aware).
- Commission, escrow split (e.g. 30% upfront), totals: shown from server response fields. Client-side math only for *previews*, clearly labelled estimate.
- Money POSTs (top-up, withdraw, cancel) send `Idempotency-Key` (`IDEMPOTENCY_HEADER`, uuid v4) through `createIdempotentAction()` (`@/core/api`), one per user intent: the key survives failures and retries of that intent (timeout, app resume, a fixed 4xx), drops after success or `409 idempotency_key_reused`, and `reset()` when the user starts a different action. A replay (`Idempotent-Replayed: true`) is a normal success. Media-kit share (contract §17.6) still uses `X-Idempotency-Key`.
- Disable submit while a money mutation is in flight. Never auto-retry money mutations, except `409 idempotency_request_in_progress` (same key + body, 2s, max 3), which `createIdempotentAction` already does.
- Wallet rules: brands deposit + pay; creators withdraw only. UI must not expose actions the role can't perform. Enable Top up / Withdraw from `/me` `capabilities.top_up_wallet` / `withdraw_funds` (`reason` → blocker text); the server re-checks.

## Audit trail

All agreements, negotiations, draft approvals and proof-of-publish happen in-app (dispute evidence). Never offer "contact via WhatsApp" flows for deal actions.
