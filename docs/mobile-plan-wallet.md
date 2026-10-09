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

## Step 5: Creator payout methods ✅ (2026-10-09, commits 50d4918 + 3bec572; awaiting live-server + device testing)

Handoff §7. Product decisions: see "Decisions" below (no re-auth, manage anytime).

- **Routes:** creator stack only: `PayoutMethods` (List archetype) + `PayoutMethodForm` (`{ channel }` add | `{ id }` edit). Entry points: creator wallet `PayoutDestinationCard` (under the escrow card) and the Profile `payouts` row; the withdraw wizard opens the form with `{ channel }` and takes the new method on return (Step 6).
- **API (`api/payoutMethodApi`):** `getPayoutMethods` (server order kept: primary first, then newest), `createPayoutMethod`, `updatePayoutMethod` (PATCH sends only changed keys, via `toPayoutMethodPatch`: an unchanged form makes no request, so the server sends no `wallet_payout_method_changed` push), `setDefaultPayoutMethod` (`POST /{id}/default`, called after a save that asks for primary; a failed switch is a warning, the method is saved), `deletePayoutMethod` (optimistic: row removed at once, primary moved to the newest remaining (`nextPrimaryAfterDelete`), then the server's `default_payout_method_id` wins; `undo()` on failure). **No `Idempotency-Key`:** not a money request, a repeated save only edits the same destination (rule 06).
- **Channels:** shared with top-ups (`PAYMENT_CHANNELS` / `PAYMENT_CHANNEL_DEF`). Field groups per channel in `PAYOUT_GROUP_DEF` (agent transfer: name + phone + governorate + city · cash wallet: name + phone · bank: name + bank + account + IBAN), extra fields in `PAYOUT_CHANNEL_EXTRA_FIELDS` (Sham Cash `account_code`, 4–64 letters/digits/dashes, commit 3bec572). Governorate names from `/lookups` (`usePayoutMethods` builds the views).
- **Form:** `createPayoutMethodSchema(t, channel)`, client fallback limits `PAYOUT_FIELD_LIMITS` (name 3–100, label ≤ 40, city ≤ 100, account 6–30, IBAN format + mod-97) until the server sends its own; primary switch locked on for the first method and the current primary; discard guard + `DiscardSheet`. Delete: `PayoutDeleteSheet` names the method that becomes primary, or says it's the last one.
- **Errors:** `422 payout_method_limit` or `404` (deleted elsewhere) → refetch + back to the list; other 422 → fields (`PAYOUT_SERVER_FIELDS`); limit 10 (`PAYOUT_METHODS_MAX`): Add leaves the footer at 10.
- **Pushes:** `wallet_payout_method_added|changed` (`sada://wallet/payout-methods`) → `PayoutMethods` for creators, wallet tab otherwise; refetch `PayoutMethod` only; warning look in the inbox.
- **Tests:** `payoutMethodSchema` (per-channel fields, Sham Cash code, Syrian mobile only, bank + IBAN, name/label limits), `payoutMethodForm` (mobile normalising, account/IBAN mod-97, `maskTail`, form → details, `toPayoutMethodPatch` empty when unchanged), `payoutMethodMappers` (unknown channel skipped, primary pinned first, delete promotion, last method → no primary).

## Step 6: Creator withdraw ✅ (2026-10-09, awaiting live-server + device testing)

Built to the approved Step 6 boards (Sada Wallet Tab canvas). Approved answers: Continue disabled on a server block (reasons above it; rule 09 §5 exception), "Add payout method" card on step 1, default limits up front ($25 / $500 a day / 7 days, `WITHDRAW_LIMITS`), withdrawal push → detail deferred to Step 7.

- **Routes:** creator stack only: `Withdraw` (nested `WithdrawStackParamList`: `WithdrawAmount` → `WithdrawReview`), `Withdrawals { status? }`, `WithdrawalDetail { id, submitted? }`; `WithdrawalStatusParam` in `core/navigation`.
- **API (`api/withdrawalApi`):** `getWithdrawalQuote` (silent, `keepUnusedDataFor: 0`), `createWithdrawal` + `cancelWithdrawal` (`Idempotency-Key`; invalidate `Wallet`, `WalletTransaction LIST`, `Withdrawal LIST` (+ id on cancel); create upserts the detail), infinite `getWithdrawals`, `getWithdrawal`. Mappers `utils/withdrawalMappers` (unknown status/channel/reason → `null`, a bad row skipped) + `parseWithdrawalBlock` (`422 withdrawal_not_allowed` `meta.reasons` codes or `{code,label}`, `next_allowed_at`, read from `AppApiError.details`; core untouched).
- **Flow state:** `navigation/WithdrawNavigator` = `FormProvider` + `WithdrawFlowContext` (`hooks/useWithdrawFlow`): one form (`schemas/withdrawSchema`: method, payout currency, amount ≥ $25, ≤ $500, ≤ available), wallet + `usePayoutMethods`, primary method preselected (not dirty), a method added from the wizard becomes the destination on return (`PayoutMethodForm { channel }` goes back), currency follows the method, quote debounced 400 ms (`WITHDRAW_QUOTE_DEBOUNCE_MS`, `skipToken` while empty, last quote kept dimmed), block = settled quote `allowed: false` or a submit `422` until the request changes, one `createIdempotentAction()`, discard guard + `DiscardSheet flow="withdraw"`, exit `replace('WithdrawalDetail', { submitted })` or back to the wallet.
- **Chrome:** `components/MoneyStepLayout` (generalised from the top-up step bar; `TopUpStepLayout` and `WithdrawStepLayout` wrap it), shared `ReviewSection` (Edit keys moved to `finance.reviewSection.*`) and `StatusFilterChips` (was `TopUpStatusChips`).
- **Amount step:** destination card (Change → `WithdrawMethodSheet`: radio `ListRow`s + "Add payout method" after dismissal → `PayoutChannelSheet`), no-method card, currency `SegmentedControl` only for two-currency methods, `AmountInput` + "Available" + "Withdraw all" chip + limits caption, blocked `Notice` (every label; server label, else `WITHDRAWAL_REASON_LABEL`) + `Countdown` (timer re-quotes at `next_allowed_at`), quote card (gross, channel fee, net mint, pounds `estimate` + rate "locked when sent"), quote error `Notice` with retry. Continue: disabled when blocked, waits (loading) for an in-flight quote, re-quotes after an error.
- **Review:** head (net payout, "net after fee"), destination + amount `ReviewSection`s, hold/cancel note, submit; `withdrawal_not_allowed` → block + re-quote + `popTo` amount; `fx_rate_*` / `currency_not_supported` → re-quote + amount; `kyc_required` / `wallet_*` → toast + wallet; 422 fields → amount; else `InlineError`.
- **History / detail:** `WithdrawalsScreen` (chips All · in transfer · completed · returned · rejected · cancelled, `WithdrawalDayGroup` / `WithdrawalRow`: signed neutral amount, struck through when lost, SYP payout caption); `WithdrawalDetailScreen` (submitted mode rises in once via `StaggerIn`: ✕ + "Back to wallet" + history + cancel; timeline from timestamps; rejection (danger) / return (info) `Notice`; details with copyable receipt + request numbers; amounts with rate; pending → cancel `ConfirmSheet` (own idempotent action, `409 withdrawal_not_pending` → toast + refetch); returned → "Review payout methods"; `ReportLink`). Status look `WITHDRAWAL_STATUS_LOOK`, view helpers `utils/withdrawalView`.
- **Wallet hero:** creator action row (`onBrand` Withdraw, disabled unless wallet `active` and `withdraw_funds` allowed; `glass` Withdrawal history); "In transfer" tile → `Withdrawals { status: 'pending' }`. The board's icon-only "payout methods" glass button wasn't built: the action row takes two labelled buttons, and payout methods already open from the card under the escrow card.
- **Tests:** `withdrawalMappers` (quote, item, page, 422 block), `withdrawSchema`.
- **Open:** server-sent limits once the backend adds them.

## Step 7: Wiring + docs ✅ (2026-10-09, commit 19ee340; awaiting live-server + device testing)

Push tap → wallet routes, replace `WalletPlaceholder`, DevShowcase demos for new kit/domain parts, `docs/mobile-architecture.md` (§4.4, §5.2, §5.3 Journey F, Change Log).

- **Withdrawal deep links:** `parsePushPayload` accepts `sada://wallet/withdrawals/{id}` (`PushTarget` `withdrawal`, same `ENTITY_ID` check as top-ups); `resolveNotificationRoute` → `WithdrawalDetail` for creators, `WalletTab` otherwise; `toTabParams` opens it over the wallet home (`initial: false`); inbox `FALLBACK_LINK` rebuilds the link from `entity_id` for `wallet_withdrawal_completed|rejected|returned`. Cache refresh was already in `walletPushTags`.
- **Share:** `WithdrawalDetailScreen` header `Share2` action (ready state) → plain-text receipt via `Share.share` (title, gross, net payout, status, date, receipt + request numbers), like `TransactionReceiptScreen`.
- **Cleanup:** `WalletPlaceholder` already gone (wallet tab real since Step 2); no TODO/mock leftovers in finance/notifications; finance domain parts covered by the DevShowcase registry test.
- **Tests:** `pushPayload` (withdrawal link + malformed variants), `notificationRoute` (role routing, fallback link, tab params).
- **Frozen / unfrozen pushes:** `wallet_wallet_frozen|unfrozen` → `sada://wallet` → wallet tab; `walletPushTags` refetches `GET /wallet`, so the hero `LiveIsland` (the handoff's "frozen-wallet banner") appears or clears without a manual refresh. Inbox: warning / success look.
- **Docs:** `docs/mobile-architecture.md` updated with each step (§4.4 wallet rules, §5.2 screen map, §5.3 Journey F, Change Log rows 2026-10-08 → 2026-10-09: wallet tab, statement + receipt, top-up v2, payout methods, Sham Cash, withdrawals, withdrawal deep links).

## Decisions (v1)

| Decision | Why |
|---|---|
| **No re-auth / biometrics** before withdraw or payout method changes (decided 2026-10-09) | Speed over friction in v1. Compensating controls: a security push on every new or changed payout method (`wallet_payout_method_added|changed`), withdrawals only to saved methods, server-side limits ($25 min, $500/day, one per 7 days), the 7-day cooldown, cancel while pending, and every rule re-checked by the server. Revisit if fraud shows up or when instant cash-out lands. |
| **Payout methods manageable anytime** | KYC / frozen-wallet rules gate the Withdraw action only (Step 6), never viewing or editing destinations. |
| **No screenshot protection** on wallet, receipt or withdrawal screens (decided 2026-10-09) | Users screenshot receipts to send to WhatsApp support; the receipt share action covers the same need in text. No `FLAG_SECURE` / iOS capture blur in v1. |
| **Eye toggle (hide amounts) is per device**, not per account | Stored in plain MMKV (`StorageKeys.WALLET_AMOUNTS_HIDDEN`, non-identifying preference); `authStorage.clearSession()` doesn't touch it, so it survives logout and a switch to another account on the same phone. Receipts and detail screens always show amounts. |
| **`Idempotent-Replayed: true` is a normal success** | Same body as the original 201 (handoff §3); no separate handling or toast. |
| **Analytics / logs: IDs only** | No amounts, phones or names tied to identity (rule 07). |

## Open / waiting on backend

| Item | Owner | Trigger | Then (mobile) |
|---|---|---|---|
| v4 wallet fields: `summary.month_in` / `escrow` / `pending_top_ups`, `GET /wallet/escrows`, `GET /wallet/earnings`, line `description` / `counterparty` / `status` / `affects_balance` / SYP `original` (`docs/backend/wallet-v4-prompt.md`) | Backend | Endpoints / fields live on staging | Sections appear on their own (404 → hidden); check the §5 answers against the ledger rows |
| Top-up channels 404 fallback (`buildFallbackChannels`) | Backend (deploy) → mobile | v2 server on staging **and** production | Delete the fallback + its tests |
| Server-sent withdraw limits | Backend | Limits in the quote or `/config` | Replace `WITHDRAW_LIMITS` defaults |
| Server-sent payout field limits | Backend | Limits in the API | Replace `PAYOUT_FIELD_LIMITS` |
| Sham Cash currencies (USD+SYP) and 1.5% fee | Ops | Confirmed by ops | Fix channel def if different |
| Multi-type statement filter | Backend | API accepts several `type`s | Multi-select type chips |
| Deal link on receipts / ledger rows | Marketplace (mobile + backend) | Deal detail screen + `source` deal id | "View deal" footer on the receipt |
| Wallet empty-state CTA | Product | Decide the action (top up / browse campaigns) | Add to the activity empty state |
| Pending tone: warning (built) vs info (submitted board) | Design | Decision | Change `*_STATUS_LOOK` if info wins |
| Firebase regenerated for `com.getsadaapp` | Mobile / DevOps | New config files | Wallet pushes arrive (Step 8 push checks blocked until then) |
| `API_BASE_URL` staging / production still on the old domain | DevOps | New domains | Update `.env.staging` / `.env.production` + rebuild |

## Step 8: QA & device testing checklist

Run on a real iPhone and a real Android phone against staging (v2 server), both roles. Tick each line with device + date.

**Live-server flows**
- [ ] Brand: top-up each channel (USD, SYP, cash wallet SYP only) → `pending_review` → admin approves → push → balance + ledger update
- [ ] Brand: dev mock server returns `completed` at once → detail + wallet show it without a pending step
- [ ] Brand: top-up rejected / reversed → push → detail `Notice`, tone correct
- [ ] Brand: `top_up_pending_limit`, `transfer_reference_duplicate`, `channel_paused`, `top_up_amount_out_of_range` mapped as in Step 4
- [ ] Creator: add each channel (incl. Sham Cash code, bank IBAN), edit (details vs label only: push only on details), set primary, delete primary (promotion matches the sheet), delete last, 11th method blocked
- [ ] Creator: withdraw USD and SYP → `pending` → admin completes / rejects / returns → push → detail + wallet
- [ ] Creator: every quote reason shows its label; `cooldown_active` countdown re-quotes at `next_allowed_at`; `open_request_exists` after a first request
- [ ] Creator: cancel while pending; cancel race (admin completes first) → `409 withdrawal_not_pending` toast + refetch
- [ ] Statement: period presets, custom range, type chips, paging, "all" shares the tab cache; receipt copy / share / report
- [ ] Account delete with funds → `422 account_has_funds` blocked state (creator → wallet, brand → support)

**Edge cases**
- [ ] Wallet `frozen`: `available` 0, `LiveIsland` blocker, Top up / Withdraw disabled, support link; unfreeze push clears it
- [ ] Wallet `closed` and an unknown status → safe blocker, no crash
- [ ] Exchange rate stale → `Notice` replaces the rate row, SYP options off; no rate yet (`data: null`) → SYP off, no crash
- [ ] Idempotency: kill the app mid-submit and retry → same key, `Idempotent-Replayed` shown as success, no double request; slow server → `409 idempotency_request_in_progress` retried (2 s × 3)
- [ ] Capability reasons (`kyc_required`, `kyc_pending`, `kyc_rejected`, `withdrawals_paused`, `onboarding_incomplete`) → right blocker copy + action
- [ ] Offline during each money step → snackbar only, submit not lost; double tap on submit → one request
- [ ] Signed receipt URL expired → detail refetched before opening

**Push (needs Firebase regenerated)**
- [ ] Each `wallet_*` type: foreground, background and **cold start** tap (launch buffer 30 s) → right screen per role, `initial: false` back to the wallet home
- [ ] Wrong role (creator gets a top-up link) → wallet tab, no crash; inbox entry without a link → rebuilt from `entity_id`

**Visual / a11y**
- [ ] Arabic RTL first, then English: chevrons flip, amounts and digits Western, Levantine months
- [ ] Dark mode: `card` hairline, CTA teal, glass on navy only
- [ ] Small screen (iPhone SE / 5.5" Android): wallet hero compact layout, keyboard open on amount steps
- [ ] Reduced motion: no rolling digits, no `MoneyFlow` / `LiveDot` loops, final state at once
- [ ] Android: `card` shadow tint, Skia hero lights + glass cost (no jank on scroll), bottom bar without blur
- [ ] Large text (font scale 1.3+): amounts don't clip, footer buttons reachable
- [ ] Eye toggle: hides every amount on wallet + statement, survives restart and logout

**Release**
- [ ] Ship with or after the server's `account_has_funds` change (handoff §1); raise `min_version` in `/config` if an older build must stop
- [ ] `API_BASE_URL` + Firebase updated, release build smoke test

## Phase 2 (out of scope for v1)

- **Deal escrow:** brand pays a deal into escrow (`awaiting_payment` → `in_progress`), escrow release / refund / split screens (today only ledger lines + `EscrowFlowCard`). Lands with the marketplace deal flow.
- **Disputes:** dispute state on a deal, held funds, support outcome on the receipt.
- **Statements export:** PDF / CSV statement for brands' accounting; invoices and auto-generated contracts (finance owns them, rule 01).
- **Instant cash-out:** the spec's instant withdrawal vs the v1 7-day cooldown; needs a product decision + backend rules (and likely re-auth).
- **Brand spend analytics:** per-campaign spend / ROI (planned `analytics` domain); the wallet bar chart stays a monthly total.
- **Security hardening:** re-auth / biometrics, screenshot protection, if v1 data says so.
