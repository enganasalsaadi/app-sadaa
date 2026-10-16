# Public Campaigns — Mobile Plan (React Native, `mobile/sadaa`)

Status: **APPROVED 2026-10-16** (decisions in `backend-plan.md` §1). Start after backend task **C14**, which writes the exact API contract in `docs/mobile/public-campaigns.md`. This file fixes the screens, flows, and task order only. Field names come from the handoff doc.

Rules: one CM task per session. Reuse the existing Direct Deals screens for everything after Select (D4). AR/EN with RTL first. Money is shown in USD (D8). Every screen handles the feature flag (`campaigns.enabled` from the bootstrap/config endpoint) and hides the entry points when it is off.

---

## 1. Navigation & entry points

| Role | Entry | Target |
|---|---|---|
| Brand | Home card "Active campaigns" (`active_campaigns` key) + tab/stack "Campaigns" | My campaigns list |
| Brand | Explore shortlist → "Invite to campaign" | Campaign picker sheet (I3) |
| Creator | Home strip "Campaigns for you" + tab "Campaigns" | Feed |
| Creator | Push "You're invited" | Teaser detail with the "Invited" badge |
| Both | Linked deal screen | The existing Deal detail + campaign header |

Deep links: `sada://campaigns/{id}`, `sada://campaigns/{id}/applications`, `sada://campaigns/{id}/drop`, `sada://applications/{id}`, `sada://deals/{id}` (existing).

---

## 2. Brand screens

### CM1 — Campaign wizard (draft autosave each step)

1. **Basics:** title, activity type, cover image (signed upload).
2. **Deliverables:** pick from the catalog (platform × format × count × revisions 0–3 + add-on flags). The same picker component as the offer builder (M2) in catalog mode, not rate-card mode.
3. **Pricing:**
   - Fixed: seat price.
   - Bidding: guide min + binding max + optional total budget.
   - Live quote card: gross / fee / creator net per seat, total for all seats.
4. **Targeting:**
   - Platforms come from step 2 and are read-only.
   - Gender (optional), min followers (optional).
   - Cities and niches, labelled "ranking only".
5. **Seats & dates:**
   - Seats (≤ 20).
   - Apply deadline (≤ 30 days).
   - Delivery: delivery days, **or** the drop toggle with `drop_at`. Show the derived "drafts due" date (`drop_at − 72h`).
6. **Shipping:** none / gift (consumable) / returnable (valuable). Returnable shows a notice about the return rules.
7. **Content:**
   - Public teaser (requirements).
   - Private brief (talking points, links, attachments), with a lock icon and "revealed only after funding".
8. **Review & submit:**
   - Full summary.
   - Balance warning banner if the wallet is below seats × price (C-Q17).
   - KYC gate → KYC flow.
   - Submit → `pending_review` screen.

Also in CM1: **Duplicate** from any past campaign → opens the wizard prefilled at step 1.

### CM2 — My campaigns

- **List:** tabs Drafts · In review · Live · Finished. The card shows status chip, seats `occupied/total`, open applications, deadline countdown, and the "Budget secured" badge.
- **Detail:**
  - Header: status, review note if changes were requested.
  - Recruiting stats; execution block (working / completed / late / defaulted).
  - Actions by status: edit (respecting the C-Q12 lock: price and deliverables greyed out after the first application), add seats, extend deadline, close recruiting, cancel, reopen (when suspended), duplicate.
  - Status timeline.

### CM3 — Applicants

- **List:** tabs New · Shortlisted · Selected. Sort by newest / bid / rating. Filters: city, niche, platform.
- **Row:** creator card, bid + net, pitch preview, expiry countdown (72h), "Invited" tag.
- **Applicant detail:** media kit (existing screen), rating, pitch, chosen accounts. Actions: Shortlist · Not selected · **Select**.
- **Compare:** pick 2–3 applicants side by side.
- **Select flow:**
  - Confirm sheet (price, items, shipping mode, budget remaining) → result.
  - Funded: "Deal created" → the linked deal.
  - Short balance: a "Payment needed — 24h" card → wallet top-up (existing) → returns to the deal.
- **Partial funding prompt** after a selection when seats are still open: "Keep recruiting" / "Close recruiting".

### CM4 — Brand system sheets

- **Seat freed:**
  - Before work: an info toast that the seat reopened.
  - After work: a sheet with replace (pick from pending applicants) / reduce seats / reopen.
- **Zero applicants at deadline:** edit price/terms / extend 4 days / cancel free.
- **Ghost warning banner** (48h), plus a suspended state with a one-tap Reopen and the cancel countdown.

### CM8 — Drop dashboard (brand)

- Countdown to `drop_at`.
- Per-creator checklist: verified ✅ / in review ⏳ / late ⚠️ / defaulted ✖. Each row opens the linked deal.
- Summary chips; pull-to-refresh plus a refresh when a push arrives.

### CM9 — Batch tools (brand)

- **Batch shipping:**
  - Lists the linked deals awaiting shipment.
  - The address is revealed per row with a tap (logged server-side; show a "viewing is logged" note).
  - Courier, waybill, and link inputs per row; "Submit all" → per-row result (partial success shown inline).
  - No export button.
- **Announcement:** composer (≤ 1000 chars + optional link), a counter of "x of 3 today", the history list, and an "Informational only — terms don't change" notice.

---

## 3. Creator screens

### CM5 — Discover

- **Feed:**
  - Cards: cover, brand, platforms, deliverables summary, seat price or range, **your net**, seats left, deadline, drop date, shipping badge, "Invited" / "Budget secured" badges.
  - Filters: platform, price, shipping type. Infinite list.
  - Empty state explains the eligibility rules.
- **Teaser detail:** public requirements only. A "private brief revealed after funding" locked block. Bookmark toggle. Apply CTA, disabled with a reason when not allowed (cap 10 reached, banned until date, return pending, already applied).
- **Saved:** the bookmark list.

### CM6 — Apply & my applications

- **Apply sheet:**
  - Bid input with range hint and max validation (bidding only).
  - Live net preview (−10%).
  - Account picker per platform.
  - Pitch (500 counter).
  - Terms summary + consent checkbox: "Applying is a binding offer for 72h".
- **My applications:** tabs Open · Selected · Closed. Each row shows status, expiry countdown, Withdraw (open only), and a link to the deal when selected. "Not selected" is shown neutrally, with no reasons.

### CM7 — Linked deal additions (existing Deal screens)

- A campaign header chip (title + drop date) linking to the teaser.
- **Brief reveal:** the private brief block appears at `ESCROW_LOCKED`. A 24h banner reads "Review the brief — you can exit without penalty until …" with an **Exit** action (confirm sheet). Brand side: the ship action stays disabled with "Creator brief review until …" until the window closes (C-C5).
- In `AWAITING_PAYMENT`, withdraw is shown as no-penalty.
- Announcements render as timeline notes (megaphone icon).
- Drop: a countdown on the deal, the publish button locked until `drop_at − 15m`, and a late badge during grace.

### CM10 — Returns & restrictions

- **Return waybill form** (courier, number, link). Shown when a returnable deal closes after the product was received, with a due date.
- **Global banners:**
  - Account locked until the return waybill is entered (blocks apply + accepting offers; CTA to the form).
  - Banned from public campaigns until a date (severe strike).
- **Brand:** a return receipt confirm / report issue on the deal.

### CM11 — Notifications

- Inbox rows and deep links for every C13 event.
- Push categories: Campaign updates (brand), Applications (creator), Drop reminders (both; 24h / 2h / 0h).

---

## 4. Shared components to build once

`CatalogDeliverablePicker` (shared with M2), `MoneyBreakdown` (gross / fee / net), `CountdownChip`, `StatusChip` (campaign + application enums, labels from the API), `LockedBriefBlock`, `RestrictionBanner`, `SeatMeter`.

## 5. Task order & dependencies

CM1 → CM2 → CM3 (needs C6) → CM4 → CM5 → CM6 → CM7 (needs C7) → CM8 (C9) → CM9 (C11) → CM10 (C10) → CM11 (C13).
The brand and creator tracks can run in parallel after CM2: CM5 and CM6 depend only on C4 and C5.

## 6. V2 (mobile side)

Screening-question answers in the apply sheet, counter-offer flow, seat-group picker, batch rating screen, campaign analytics tab, invite-only badge, waitlist auto-offer prompt. See `backend-plan.md` §9.
