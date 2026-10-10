---
paths:
  - "src/domains/finance/**"
---

# 09b — Money Archetype Visual Rules (rule 09 §2.1)

- **Wallet hero balance:**
  - Title row beside header's glass eye action (`ScreenHeaderAction glass`).
  - Label `onBrandMuted` with a **still** mint dot (`glass.iconMoney`, never pulsing — not a §3.1 loop).
  - `MoneyText size="display" tone="onBrand" splitFraction rounding="down" animated` (58, rolls once).
  - Month-in glass pill (mint `glass.iconMoney` text, compact amount).
  - Two glass tiles for secondary balances (compact `AnimatedNumber`; clock = waiting, lock = escrow).
  - The one blocker as `LiveIsland`.
  - Role action row: one `onBrand` primary (Withdraw | Top up) + one glass secondary.
  - Eye action hides every amount on screen (`hidden`, remembered per device). Header `leading` pins balance (`size="title"`) once hero scrolls away.
  - **Hero budget exception:** ~50–60% of screen expanded (island included) since it collapses into pinned header. Compact = `size="hero"` balance, no month pill, island title only.
  - Figures the server doesn't send stay out (no placeholders); actions to unbuilt screens stay out.
- **Ledger row:** 40px `md`-radius badge (`soft` bg + `main` icon: mint = money in, `surface.elevated` = money out, info = escrow hold, warning = pending) · title `bodyMedium` · meta = status pill (only when not final-success) + date `caption` tertiary · amount end-aligned `MoneyText showSign`: credit `tone="money"`, debit default, cancelled/rejected `muted strikethrough`. SYP lines carry `≈ USD` caption under amount.
- **Exact vs compact:** ledger, receipt, quote, confirm = exact. `notation="compact"` only in stat tiles, chips, KPI strips.
- **Amount entry:** amount ≥ 48px extraBold, centred, teal caret · "available" line above (value `money.text`) · "use all" teal soft chip · quote card below, live (debounced): gross → fee → divider → net (`money.text`, `title`) → payout in target currency `estimate` + rate caption · primary in `LayoutFooter` with timing caption.
- **Receipt:** 56px soft-mint circle icon · description `bodySmall` · amount `h2`-size `MoneyText showSign` · status pill · labelled `KeyValueRow` cards (Details: deal, date, copyable reference; Amount: original + FX rate when present, gross, fee, net). Footer: secondary only (view deal) + teal link (report a problem). No primary on read-only receipt.
- **Colors:** mint only for money flow (balances, credits, net). Fees/debits neutral, never danger red. Status pills per rule 08.
- **Wallet tab body:** `StaggerIn` sections, `px="xl"`: stale-rate `Notice` (warning, replaces rate row) · held money `EscrowFlowCard` (payer → Sada escrow → payee, `MoneyFlow` while held; `explainer` when nothing held) · monthly `BarChart` card (creator earnings `tone="money"`, brand spend `neutral`; `SegmentedControl` 6 months | year; hidden when empty) · `ExchangeRateRow` · latest lines grouped by day (`WalletTransactionRow` in one `Card` per day, `Divider`s between).
