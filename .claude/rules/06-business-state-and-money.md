# 06 — Business State Machines & Money

Escrowed money + binding deals: client bugs = lost trust or money.

## Server is source of truth

- Deal/campaign status, balance, escrow, commission, refunds computed/transitioned **only by backend**.
- Client never computes next status and PUTs it. Call **action endpoints** (`POST deals/:id/submit-draft`, `POST deals/:id/approve`), render what server returns.
- Client may show *allowed actions* from a transition map for UX; server re-validates.

## Deal state machine (Direct Deals, `docs/direct-deals/`)

Mirror backend enums as string-literal unions in `domains/marketplace/types/deal.ts`: `DEAL_STATUS` (22: `draft pending_influencer negotiating_deadline awaiting_payment escrow_locked product_shipping shipping_issue in_progress disputed completed` + finals `declined expired cancelled_* creator_defaulted resolved_*`), `DEAL_ITEM_STATUS` (`pending → draft_submitted ⇄ revision_requested → approved_to_publish → verifying_live → verified`; deal `stage` = slowest item) + every sub-enum (upsell, dispute, retention, shipping, cancel).

- **Labels come from the server** (`status.label`, already localized). App maps own only tone / icon / phase / action hints: `constants/dealStatus.ts` typed `Record<DealStatus, …>` (new status fails build until all maps updated).
- Status-only actions `DEAL_STATUS_ACTIONS`, item actions `DEAL_ITEM_ACTIONS`; window-gated ones (cancel, withdraw, dispute, upsell, rating, retention) from server fields in `getDealActions(deal, role)`.
- Price is fixed (rate cards); only negotiation = one deadline extension. Totals from `/quote`, never computed.
- Any `409 deal_*` → server message + refetch the deal. Every action POST returns the full deal → replace cache.
- Countdowns from `due_at` only; `null` = paused.
- Unknown API status → `key: null` + server label, never crash. Every transition unit-tested.
- Campaign lifecycle (public campaigns, later) same pattern.

## Money

- **Integer minor units** + ISO code: `{ amount: 1500000, currency: 'SYP' }`. Never floats or formatted API strings for math. `Money` type in `@/core/money`. Deals send USD strings (`"150.00"`) → parse to cents at the API edge; deals show USD only (no SYP equivalent).
- Commission, escrow split, totals: from server fields. Client math only for *previews*, labelled estimate.
- Money / binding POSTs (top-up, withdraw, deal fund / accept / cancel / upsell / extension approve) send `Idempotency-Key` (`IDEMPOTENCY_HEADER`, uuid v4) via `createIdempotentAction()` (`@/core/api`), one per user intent: key survives failures/retries of that intent (timeout, resume, fixed 4xx), drops after success or `409 idempotency_key_reused`; `reset()` when user starts a different action. Replay (`Idempotent-Replayed: true`) = normal success. Media-kit share (contract §17.6) still uses `X-Idempotency-Key`.
- Disable submit while money mutation in flight. Never auto-retry money mutations except `409 idempotency_request_in_progress` (same key + body, 2s, max 3; already in `createIdempotentAction`).
- Brands deposit + pay; creators withdraw only. Hide actions the role can't do. Enable Top up / Withdraw from `/me` `capabilities.top_up_wallet` / `withdraw_funds` (`reason` → blocker text); server re-checks.

## Audit trail

Agreements, negotiations, draft approvals, proof-of-publish happen in-app (dispute evidence). Never offer "contact via WhatsApp" for deal actions.
