---
paths:
  - "src/domains/finance/**"
---

# 09b — Money Screens

Look is free (rule 09 §0). These are the money **truth** rules; break none:

- `MoneyText` / `formatMoney` only (exact formatting, tabular figures). **Exact** in ledger, receipt, quote, confirm; `notation="compact"` only in tiles, chips, KPI strips.
- Colors: mint only for money flow (balances, credits, net). Fees/debits neutral, never danger red. Status per rule 08.
- Figures the server doesn't send stay out (no placeholders); actions to unbuilt screens stay out.
- Eye action hides every amount on screen (`hidden`, remembered per device).
- Ledger amounts: credit `showSign` + money tone, debit default, cancelled/rejected muted strikethrough. SYP lines carry `≈ USD` beneath.
- Amount entry: "available" visible before typing, live debounced quote (gross → fee → net → payout in target currency marked `estimate` + rate), timing caption near the submit.
- Receipt is read-only: no primary action; report-a-problem path present.
- Role actions: brands top up, creators withdraw (rule 06 capabilities).
