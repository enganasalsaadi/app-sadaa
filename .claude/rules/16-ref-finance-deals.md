---
paths:
  - "src/domains/finance/**"
  - "src/domains/marketplace/**"
---

# 16 — Ref: Deals & Finance

## Marketplace (deals)

- `DEAL_STATUS` + `Record<DealStatus,…>` maps: `constants/dealStatus.ts` (label/tone), `constants/statusIcons.ts` (icons), `DEAL_ALLOWED_ACTIONS` per role, `DEAL_PIPELINE`.
- `getDealActions` / `buildDealProgress` (`utils/`, tested).
- Parts: `DealStatusPill` (`null` = unknown-status fallback) `DealProgress` `DealCard` `CreatorCard` (`variant` rail = 4:5 photo-first tile, stats on an `overlay` pill, ❤️ `onMedia` · row = 88pt photo beside details; monogram on `brand.soft` without a photo; ❤️ `ShortlistHeart` beside the card via `onToggleShortlist`) `DraftReviewCard`.
- Brand Home `screens/BrandHomeScreen` (Discover home): `/brand/home` refetched on focus only when > 2 min old (impressions); island → `BRAND_HOME_ISLAND` (`constants/brandHome`); `WalletStrip` after the first rail via `BrandHomeRails wallet` slot (eye = finance `useAmountsHidden`, ＋ → `WalletTab/TopUp` when `capabilities.top_up_wallet.allowed`); search in the band / `CategoryTiles` (`Chip variant="tile"`, icon via `resolveCategoryIcon`, fallback ✨) / rail `seeAll` → `Explore` (`ExploreParams` in core nav: `filters` prefill, `focusSearch`).
- Card taps everywhere: `hooks/useCreatorCardActions` (Media Kit `src=search` + optimistic ❤️ `toggleShortlist`, `setShortlist(creator, on)` → `Promise<boolean>`, `shortlist_full` toast). Row list skeleton `components/CreatorRowsSkeleton`.
- Shortlist `screens/ShortlistScreen` (List, `HomeStack` `Shortlist`, Home header ❤️): `getShortlist` refetched on mount; ❤️ removes (optimistic patch in `shortlistApi`) then info toast with Undo (`setShortlist(…, true)`).
- Price lock: reasons, `toPriceLockReason`, `PRICE_LOCK_ACTION` (copy + CTA screen per reason) live in **identity** (owns the screens; identity must never import marketplace — cycle) and come via `@/domains/identity`. Marketplace `constants/priceLock` keeps `PRICE_LOCK_LABEL` (card line) + `GATED_EXPLORE_PARAMS/SORTS`; `PriceLockSheet` navigates on `onDismissed`. Marketplace tests loading these mock the identity barrel to `utils/priceLock` + `constants/priceLock`.
- Public Media Kit lock (identity `MediaKitPublicScreen`): `PublicRateCard` nullable prices → `buildLockableRateRows` (`price: null` = 🔒 row); `PriceLockFooter` from `resolvePriceLockNotice(reason, toPriceLockViewer(...))` (guest → Login, creator → text only); locked body also provides `User` so verification saves / pushes drop it.
- Explore `screens/ExploreScreen` (List): `ExploreFilters` is the infinite-query cache key; search debounced 400 ms (`toSearchQuery` 2–60); sheet draft `useExploreFilterDraft` → `applyFilterDraft`; locked viewer + 🔒 param → `requestLock` (queued until the open sheet's `onDismissed`), never sent; `403 gated_parameter` → `stripGatedFilters` + lock sheet. Lock state from first page meta, before it from Home cache (`useQueryState`, no fetch).

## Wallet (finance)

- `BalanceCard` (role → withdraw | deposit only) · `PaymentBreakdown` (`estimate` for client previews).
- `walletApi`: `getWallet` (+ v4 `summary`), infinite `getWalletTransactions`, receipt `getWalletTransaction`, `getExchangeRate`, v4 `getWalletEscrows` / `getWalletEarnings` (404 = server predates them → section hidden / explainer). DTOs → `Money` in `utils/walletMappers`; unknown status/type → `null`.
- Wallet tab `screens/WalletScreen` (`role` prop from navigator; section hooks per card). Internal parts: `EscrowFlowCard` (`live` | `explainer`) · `ExchangeRateRow` · `WalletTransactionRow` (`onPress(reference)` → receipt) · `WalletDayGroup` / `WalletDayGroupSkeleton` (one day card, tab + statement). Line look `constants/walletLineLook`; eye state `hooks/useAmountsHidden` (shared, re-read on focus).
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
- `payoutMethodApi` (no Idempotency-Key: not money). `usePayoutMethods` (views with governorate names). Creator wallet `PayoutDestinationCard`; Profile `payouts` row.

## Creator withdrawals (handoff §8, Money wizard)

- `WithdrawNavigator` (`Withdraw` route, nested amount → review). `useWithdrawFlow` context: one form `withdrawSchema`, primary method preselected, a method added via `PayoutMethodForm { channel }` becomes destination on return, debounced silent `getWithdrawalQuote`, server block = disabled Continue + every reason + `Countdown`.
- `WithdrawalsScreen` + `WithdrawalDetailScreen` (`submitted` mode, cancel while pending, header share = plain-text receipt).
- `withdrawalApi` (create/cancel with `Idempotency-Key`). `parseWithdrawalBlock` (422 `meta.reasons`). Defaults `WITHDRAW_LIMITS`.
- Hero action row (creator): `onBrand` Withdraw + `glass` withdrawal history.

## Shared money-wizard parts

`MoneyStepLayout` · `ReviewSection` · `StatusFilterChips` · generic `DiscardSheet flow` for finance forms.
