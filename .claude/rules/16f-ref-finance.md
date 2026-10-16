---
paths:
  - "src/domains/finance/**"
---

# 16f — Ref: Finance (wallet, top-ups, payouts, withdrawals)

## Wallet (finance)

- `BalanceCard` (role → withdraw | deposit only) · `PaymentBreakdown` (`estimate` for client previews).
- `walletApi`: `getWallet` (+ v4 `summary`), infinite `getWalletTransactions`, receipt `getWalletTransaction`, `getExchangeRate`, v4 `getWalletEscrows` / `getWalletEarnings` (404 = server predates them → section hidden / explainer). DTOs → `Money` in `utils/walletMappers`; unknown status/type → `null`.
- Wallet tab `screens/WalletScreen` (approved mix 2026-10-11; `role` prop from navigator; section hooks per card): `Layout heroBackdrop="brandGlow" heroBehavior="parallax"` (same hero as every tab root: body slides over it) · `BalanceDial` (Skia arcs from `useWalletHero` `segments`, `selectedKey`/`selectSegment` + haptic; centre faces cross-fade) + `DialLegend` · `EscrowTickets` (sideways `EscrowTicket`s, `MoneyRise` loop paused via `useLayoutInView({ track })`; none held → `EscrowFlowCard` explainer) · `PayoutPort` (creator) · `TideChart` (Skia, `utils/tidePath`) · `RateLine` · `ReceiptTape` (unrolls on reveal, `ReceiptLine`s). Domain parts: `EscrowFlowCard` (explainer only) · `WalletTransactionRow` (`onPress(reference)` → receipt) · `WalletDayGroup` / `WalletDayGroupSkeleton` (statement). Line data `hooks/useWalletLineView` (row + receipt tape); look `constants/walletLineLook`; eye state `hooks/useAmountsHidden` (shared, re-read on focus). Tokens `colors.wallet.*`, `motion.loop.moneyRise`.
- `screens/StatementScreen` (`role` prop; `STATEMENT_TYPE_FILTERS` per role; `utils/statementPeriods` → query args, unset keys left out so "all" shares the tab's `{}` cache).
- `screens/TransactionReceiptScreen` (`{ reference }`; copy, share, report via `useOpenSupport`).
- Blockers `WALLET_BLOCKER_DEF` + `resolveWalletBlocker`; role copy `WALLET_ROLE_COPY`.
- v4 contract (live): `docs/mobile-handoff-v4.md`. Escrow `id` = hold id (`source.id` on lines); `deal_id`/`deal_title` `null` until deals ship. Receipt commission rows from `WalletTransaction.commission` (creator `escrow_release` `details`), display only.

## Brand top-ups (Money wizard archetype, rule 09)

- `TopUpNavigator` (`TopUp` route, nested 4 steps, `useTopUpFlow` context + one form `topUpSchema`).
- `TopUpsScreen` (status chips) · `TopUpDetailScreen` (`submitted` mode).
- `topUpApi`: `getTopUpChannels` no-store, falls back to `buildFallbackChannels` on pre-v2 404; DEV sample accounts only with `ENABLE_MOCK_DATA`.
- Money math `utils/topUpEstimate` (BigInt, floor). Day grouping `groupByDay` / `formatDayLabel` (`utils/walletDates`).
- Hero action row (brand): `onBrand` Top up + `glass` history.
- Contract `docs/mobile-handoff-topup-v2.md` (`payer_reference`, signed receipt `expires_at`, `top_up_pending_limit`). Demoed in DevShowcase `sada` category.
- Channels shared by top-ups and payouts: `PAYMENT_CHANNELS` / `PAYMENT_CHANNEL_DEF` / `channelCurrenciesKey` (`constants/paymentChannels`, i18n `finance.channels.*`).

## Creator payout methods (handoff §7)

- `PayoutMethodsScreen` (List, ≤ 10 rows in one `ListGroup`, `PayoutChannelSheet` → form).
- `PayoutMethodFormScreen` (`{ channel }` add | `{ id }` edit): fields per channel group from `PAYOUT_GROUP_DEF`, `createPayoutMethodSchema(t, channel)`, primary via `POST /{id}/default` after save, delete = optimistic `ConfirmSheet`.
- `payoutMethodApi` (no Idempotency-Key: not money). `usePayoutMethods` (views with governorate names). Creator wallet `PayoutPort`; Profile `payouts` row.

## Creator withdrawals (handoff §8, Money wizard)

- `WithdrawNavigator` (`Withdraw` route, nested amount → review). `useWithdrawFlow` context: one form `withdrawSchema`, primary method preselected, a method added via `PayoutMethodForm { channel }` becomes destination on return, debounced silent `getWithdrawalQuote`, server block = disabled Continue + every reason + `Countdown`.
- `WithdrawalsScreen` + `WithdrawalDetailScreen` (`submitted` mode, cancel while pending, header share = plain-text receipt).
- `withdrawalApi` (create/cancel with `Idempotency-Key`). `parseWithdrawalBlock` (422 `meta.reasons`). Defaults `WITHDRAW_LIMITS`.
- Hero action row (creator): `onBrand` Withdraw + `glass` withdrawal history.

## Shared money-wizard parts

`MoneyStepLayout` · `ReviewSection` · `StatusFilterChips` · generic `DiscardSheet flow` for finance forms.
