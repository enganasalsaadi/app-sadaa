# 06 — Business State Machines & Money

Escrowed money + binding deals: client bugs = lost trust or money.

## Server is source of truth

- Deal/campaign status, balance, escrow, commission, refunds computed/transitioned **only by backend**.
- Client never computes next status and PUTs it. Call **action endpoints** (`POST deals/:id/submit-draft`, `POST deals/:id/approve`), render what server returns.
- Client may show *allowed actions* from a transition map for UX; server re-validates.

## Deal state machine

Mirror backend enums as string-literal unions in `domains/marketplace/types/`:
```ts
export const DEAL_STATUS = ['pending_approval', 'awaiting_payment', 'in_progress', 'under_review',
  'ready_to_publish', 'published', 'completed', 'disputed', 'cancelled', 'refunded'] as const;
export type DealStatus = (typeof DEAL_STATUS)[number];
```
(waiting creator → waiting brand escrow payment → producing → draft reviewed → approved → proof submitted/tracking → funds released · support · cancelled · refunded)

- Transition / i18n / badge-tone maps in `domains/marketplace/constants/` typed `Record<DealStatus, …>` (new status fails build until all maps updated).
- Campaign lifecycle (`open → receiving_offers → selecting → selected → negotiating → agreed → …`) same pattern.
- Unknown API status → safe fallback + log, never crash. Every transition unit-tested.

## Money

- **Integer minor units** + ISO code: `{ amount: 1500000, currency: 'SYP' }`. Never floats or formatted API strings for math. `Money` type in `@/core/money`.
- Commission, escrow split, totals: from server fields. Client math only for *previews*, labelled estimate.
- Money POSTs (top-up, withdraw, cancel) send `Idempotency-Key` (`IDEMPOTENCY_HEADER`, uuid v4) via `createIdempotentAction()` (`@/core/api`), one per user intent: key survives failures/retries of that intent (timeout, resume, fixed 4xx), drops after success or `409 idempotency_key_reused`; `reset()` when user starts a different action. Replay (`Idempotent-Replayed: true`) = normal success. Media-kit share (contract §17.6) still uses `X-Idempotency-Key`.
- Disable submit while money mutation in flight. Never auto-retry money mutations except `409 idempotency_request_in_progress` (same key + body, 2s, max 3; already in `createIdempotentAction`).
- Brands deposit + pay; creators withdraw only. Hide actions the role can't do. Enable Top up / Withdraw from `/me` `capabilities.top_up_wallet` / `withdraw_funds` (`reason` → blocker text); server re-checks.

## Audit trail

Agreements, negotiations, draft approvals, proof-of-publish happen in-app (dispute evidence). Never offer "contact via WhatsApp" for deal actions.
