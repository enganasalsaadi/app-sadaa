# Wallet & Finance: Mobile Build Plan

Source: [mobile-handoff-wallet.md](mobile-handoff-wallet.md). Domain: `finance`. One step per session, each closed with `tsc + lint + test` and its doc update.

## Step 0: Design process fix (before any wallet screen) ✅ 2026-10-08

Visual target: Design canvas "Sada Wallet Visual Target" (creator wallet, brand wallet, withdraw, receipt, MoneyText spec). Kit: `.claude/skills/sada-screen/preview-kit.css`.

ASCII mockups can't show "modern", so screens got approved on structure and built without a visual target.
- `/sada-screen` Phase 2 adds a **visual preview**: one HTML phone-frame mockup built from the real Navy Trust tokens (light + dark, AR/RTL), published as a private Artifact. Code starts only after it is approved.
- Rule 09 gets a **Money** archetype (wallet home, amount entry, receipt) with its visual rules: hero balance, `MoneyText` sizes, statement row anatomy, receipt layout.

## Step 1: Foundations (no UI)

Split to keep each session small: **1a** money display ✅ 2026-10-08 · **1b** API safety ✅ 2026-10-08 · **1c** finance types + `walletApi` ✅ 2026-10-08.

Decisions (2026-10-08): wallet hero ≤ ~1/3 of the screen with compact-on-scroll · compact suffix `K/M/B` in both languages · balances `rounding="down"` · compact only in stats/tiles.

| Gap | Fix |
|---|---|
| Header `X-Idempotency-Key` | ✅ 1b: `Idempotency-Key` for money; media-kit share keeps `X-…` (contract §17.6) |
| `MINOR_UNIT_DIGITS.SYP = 2` | ✅ 1a: `0` (backend sends whole pounds); tests fixed |
| Capabilities | ✅ 1b: `top_up_wallet`, `withdraw_funds`, reasons `wallet_frozen`, `withdrawals_paused` (types only; buttons in Step 2) |
| `DELETE /auth/account` | ✅ 1b: `422 account_has_funds` → blocked state (creator on Profile: Go to wallet + support link; else Contact support). Shared `useOpenSupport` |
| Push | ✅ 1b: 7 `wallet_*` types, `sada://wallet` → Wallet tab, `walletPushTags` refresh, inbox icons. Tags `Wallet WalletTransaction TopUp Withdrawal PayoutMethod` added |
| Idempotency retry | ✅ 1b: `createIdempotentAction()` (key per intent, in-progress retry 2s × 3, reused → new key); screens use it from Step 4 |

**MoneyText / `formatMoney` upgrade** ✅ 1a: `size` sm|md|lg|hero (tokens `amountSmall`, `amountHero`), `tone` + `onBrand`, `notation` compact (own K/M/B, compact defaults to `down`), `precision` currency|0|1|2 (`0` = whole), `rounding` nearest|down|up (`core/money/rounding.ts`, integer math on the magnitude), `currencyDisplay` symbol|code|none (SYP ل.س / SYP), `splitFraction` (`formatMoneyParts`), `hidden`, `strikethrough`. Currency placed by hand, not Intl; Arabic keeps ICU's RLM/LRM marks. Tests: `formatMoney.test.ts`, `rounding.test.ts`; DevShowcase demo updated.

**1c** ✅: `finance/types/wallet.ts` (wire DTOs + domain models; `WALLET_STATUS`, `WALLET_TRANSACTION_TYPES`, unknown value → `null`), `utils/walletMappers.ts` (`MoneyDto` → `Money`, `formatted` ignored; an unsupported currency fails a single object (query error) and skips a statement line; unknown direction → amount sign; rate stays a decimal string), `api/walletApi.ts`: `getWallet` (`Wallet`), `getWalletTransactions` (infinite, filters = cache key, 20/page, `WalletTransaction LIST`), `getWalletTransaction` (receipt, id upper-cased), `getExchangeRate` (`null` before the first rate, 60 s cache). `API_ERROR_CODES` + `kyc_required wallet_frozen wallet_closed currency_not_supported fx_rate_stale fx_rate_unavailable top_up_amount_out_of_range payout_method_limit withdrawal_not_allowed withdrawal_not_pending`. Tests: `walletMappers.test.ts`. Top-up, payout and withdrawal endpoints land with their steps (4–6).

## Step 2: Wallet tab (both roles) ✅ (2026-10-09, awaiting device + live-server testing)

Built to the approved «Wallet4» design (Sada Wallet Tab canvas): `CreatorWalletNavigator` / `BrandWalletNavigator` → `WalletScreen role`. Hero: `MoneyText size="display" animated`, still mint dot, month-in pill, two glass tiles, `LiveIsland` blocker (`resolveWalletBlocker`: closed → frozen → unknown → capability reason; KYC → KycScreen, frozen/closed → WhatsApp support), glass eye header action (`StorageKeys.WALLET_AMOUNTS_HIDDEN`), pinned balance in the header. Body: stale-rate `Notice` / `ExchangeRateRow`, `EscrowFlowCard` (live or explainer), `BarChart` earnings/spend card, latest 5 lines by day (`WalletTransactionRow`).

Waiting on the backend (`docs/backend/wallet-v4-prompt.md`, sections hide until it ships): `summary.month_in` / `escrow` / `pending_top_ups`, `GET /wallet/escrows`, `GET /wallet/earnings`, line `description` / `counterparty` / `status` / `affects_balance` / SYP `original`. Answers to its §5 questions may change the ledger rows.

Hidden until their steps ship: Top up / Withdraw action row (Steps 4, 6), deal link (marketplace), empty-state CTA. (Statement button, "All" link and row taps shipped in Step 3.)

**Month names (decided 2026-10-09):** Arabic dates use Levantine months (كانون الثاني … كانون الأول). `formatDate` swaps ICU's name for the Levantine one with `format()` only (no `formatToParts`, uneven on Hermes); tests in `core/i18n/__tests__/format.test.ts`.

## Step 3: Statement + receipt (both) ✅ (2026-10-09, awaiting device + live-server testing)

Built to the approved "Step 3" boards of the Sada Wallet Tab canvas.

- **Routes:** `WalletStackParamList` `Statement` + `TransactionReceipt { reference }`, registered in both role navigators (statement gets `role` from the navigator).
- **Statement** (`screens/StatementScreen`, List archetype): `Layout mode="static"`, eye action (`hooks/useAmountsHidden`, shared with the wallet tab, re-read on focus), pinned `StatementFilters` (period `Chip` with icon/dropdown/clear + per-role type chips from `STATEMENT_TYPE_FILTERS`), `SuperList` of day items (`WalletDayGroup`, regrouped over every loaded page) + `more` (`WalletDayGroupSkeleton`) / `end` items, count header, `currentData` so a new filter shows its skeleton. Filters → `toStatementFilters` (`utils/statementPeriods`, tested): unset keys left out so "all" shares the wallet tab's `{}` cache. `StatementPeriodSheet`: presets apply on tap, "Custom range" swaps the same sheet to `DateRangePickerContent range="past"`.
- **Receipt** (`screens/TransactionReceiptScreen`, Money archetype): 56px badge, `MoneyText size="lg"`, pill only while open, Details (type, from/to, date, copyable reference via Clipboard + toast) and Amount (amount, SYP paid + rate via `formatExchangeRateSides`, balance after unless a memo line) cards; share icon (`Share`, plain text); footer teal "Report a problem" → `useOpenSupport` with the reference. 404 → `InlineError` + report link; other errors → `ErrorState` retry. Amounts always visible.
- **Wallet tab:** glass statement action beside the eye, "See all" on activity, "View full statement" link when `meta.total > 5`, row taps → receipt. Line look shared in `constants/walletLineLook`.
- **Kit:** `Chip` `icon` / `dropdown` / `onClear` + `clearLabel`; `SuperList` `emptyDescription` / `emptyAction`; `DateRangePicker` `range="past"` (max today, one-day ranges, inclusive day count) + Levantine month title. Demos: Chips, DateRangePicker, List states (filtered empty).
- **Not in this step:** fee/gross/net on receipts (withdrawal detail, Step 6), deal link (marketplace endpoint), multi-type filters (API takes one type).

## Step 4: Brand top-up ✅ (2026-10-09, on the v2 contract; awaiting live-server + device testing)

Built to the approved Step 4 boards (Sada Wallet Tab canvas). Backend asks: `docs/backend/top-ups-v1-prompt.md`; answer: `docs/mobile-handoff-topup-v2.md`.

- **v2 delta (2026-10-09):** channels with `Cache-Control: no-store`; `payer_reference` → last copy row of each "Send to" card (`KeyValueRow hint`: write it in the transfer note); `top_up_pending_limit` (new `ApiErrorCode`) → toast + `replace('TopUps', { status: 'pending_review' })` (flow exit `pending`); `transfer_reference_duplicate` without a field map → transfer field; `top_up_amount_out_of_range` also refetches channels; `processing_time_label` rides `TopUpDetail { processingTime }` into the submitted timeline; signed receipt `expires_at` → `isReceiptLinkExpired` (30 s margin) refetches the detail before opening; `reversed` = danger tone; push `wallet_top_up_reversed` + `sada://wallet/top-ups/{id}` (`PushTarget topUp`) → brand `TopUpDetail` over the wallet home (creator → wallet tab), inbox entries without a link rebuild it from `entity_id`. The 404 fallback stays until every environment runs the v2 server.

- **Routes:** brand stack only: `TopUp` (nested `TopUpStackParamList`: `TopUpChannel` → `TopUpAmount` → `TopUpTransfer` → `TopUpReview`, `TopUpPrefill` for "New top-up"), `TopUps { status? }`, `TopUpDetail { id, submitted? }`.
- **Flow state:** `navigation/TopUpNavigator` = `FormProvider` + `TopUpFlowContext` (`hooks/useTopUpFlow`): one form (`schemas/topUpSchema`, rebuilt with the channel's limits), channels fetched fresh per open, limits (server, else `fallbackLimits`), currency auto-switch, credit estimate (`utils/topUpEstimate`, BigInt over the decimal rate, floor), one `createIdempotentAction()` per wizard, discard guard (`useDiscardGuard`, now in `core/hooks`) + `TopUpDiscardSheet`, exit by `replace('TopUpDetail', { submitted })` or back to the wallet.
- **Chrome (rule 09 §2 "Money wizard"):** `components/TopUpStepLayout`: solid header (✕ on step 1 via `ScreenHeader backIcon="close"`), sticky step bar (title, "Step n of 4", `StepProgress tone="surface"`), `LayoutFooter` primary.
- **Steps:** channel = `ListGroup` per group + `ListRow selected` (new radio variant, shares `RadioMark` with `Radio`); amount = `Tag`, `SegmentedControl`, `AmountInput`, range caption, quote card; transfer = account card (copy rows, amount first), instructions or the exact-amount notice, no accounts → support `Notice`, reference (`showCount` 100), receipt via `useFilePicker` (moved to `shared/ui`) + `ReceiptSourceSheet` (picker opens on `BottomSheet onDismissed`); review = credit head, sections with Edit (`popTo`), submit (multipart, `toFormDataFile`).
- **Submit errors:** 422 fields → `applyServerFieldErrors` + `popTo` the owning step; `top_up_amount_out_of_range` / `currency_not_supported` → amount; `fx_rate_*` → refetch + amount + notice; `channel_paused` (new `ApiErrorCode`, plus `transfer_reference_duplicate`) → refetch + channel + notice; `kyc_required` / `wallet_frozen` / `wallet_closed` → toast + back to the wallet; other → `InlineError`.
- **Fallback channels (`api/topUpApi` `getTopUpChannels`):** 404 on `/wallet/top-ups/channels` → `GET /finance/exchange-rate` + `buildFallbackChannels` (cash wallets SYP only, SYP off without a fresh rate, $10–$10,000). Accounts: DEV samples only with `ENABLE_MOCK_DATA`, otherwise none → support prompt. Remove the fallback once the endpoint is live everywhere.
- **History / detail:** `TopUpsScreen` (status chips, `groupByDay` generalised from the ledger, `TopUpDayGroup` / `TopUpRow`, empty + "Show all"); `TopUpDetailScreen` (submitted mode: ✕ + "Back to wallet" + history link; timeline from timestamps; rejection/reversal `Notice`; receipt: image → `GalleryModal`, PDF → `Linking` only for the API origin (`utils/receiptUrl`); "New top-up" prefilled; ledger line link; `ReportLink` shared with the receipt).
- **Wallet hero:** brand action row (`onBrand` Top up, disabled unless wallet `active` and `top_up_wallet` allowed; `glass` history), "Top-ups in review" tile → `TopUps { status: 'pending_review' }`.
- **Kit:** `CustomButton variant="glass"`, `ScreenHeader backIcon`, `BottomSheet onDismissed`, `ListRow selected`; demos updated (Buttons on-navy block, ScreenHeader close, List rows single choice).
- **Tests:** `topUpEstimate`, `topUpMappers` (server + fallback), `topUpSchema`, `receiptUrl`.
- **Open:** pending status uses the warning tone everywhere (the submitted board used info); drop the 404 fallback once staging + production run v2.

## Step 5: Creator payout methods

List (max 10), add/edit form per channel (schema per channel), delete via `ConfirmSheet`.

## Step 6: Creator withdraw

Amount → live debounced quote (all reason labels, `next_allowed_at` countdown) → confirm (gross / fee / net / net payout) → pending. History, detail, cancel while pending.

## Step 7: Wiring + docs

Push tap → wallet routes, replace `WalletPlaceholder`, DevShowcase demos for new kit/domain parts, `docs/mobile-architecture.md` (§4.4, §5.2, §5.3 Journey F, Change Log).
