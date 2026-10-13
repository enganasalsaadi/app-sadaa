# Direct Deals — Mobile Handoff (B0–B13)

For: the React Native team (`mobile/sadaa`), tasks M1–M11.
Backend status: **all of Phase B is implemented** (2026-10-13). Source of truth for decisions: `docs/plans/Direct Details Engine/backend-plan.md`. Business rules in plain English: `docs/product-architecture.md`. Every request/response is in Postman: `tests/Postman/Shabbak_API.postman_collection.json` (folders "Brand Deals", "Influencer Deals", "Wallet", "Brand Home").

---

## 0. Ground rules (apply everywhere)

- Base path `/api/v1`. Bearer token (Sanctum). Send `Accept-Language: ar|en` (default `ar`). Every `label` in a response is already localized, so show it as-is.
- Ids are ULID strings. Money in deals is **USD only**, sent as strings with 2 decimals (`"150.00"`). The app never computes totals: always show the server's numbers (quote endpoints exist for that).
- Times are ISO-8601. Show them in `Asia/Damascus`. Count down from `due_at`. Never compute deadlines on the device.
- Error shape: `{ success: false, error_code, message, errors?, meta? }`. Branch on `error_code`, never on `message`.
- **409 means the deal changed under you.** On any 409 `deal_*`: show the message, **refetch the deal** (`GET …/deals/{id}`), and redraw from the new state.
- After every successful POST, the response `data` is the full updated deal (unless noted). Replace your cached copy with it.
- Uploads (drafts, proofs, evidence, retention, brief) all use the same **3 steps**: (1) ask for a slot `{name, mime, size}` → **201** `{file_id, kind, upload {method: PUT, url, headers, expires_at}}`, (2) `PUT` the bytes straight to `upload.url` with exactly `upload.headers` (valid 30 min), (3) send the `file_id`s in the submit call. Unused slots are deleted after 24h. Limits: video mp4/mov/webm ≤ 300 MB, image jpg/png/webp ≤ 20 MB, pdf ≤ 20 MB (only where allowed).

---

## 1. Endpoint map by mobile task

### M1 — Rate-card add-ons (B0)
See `docs/mobile/rate-card-addons.md` (unchanged).

### M2 — Brand offer builder (B2)
| Method | Path | Notes |
|---|---|---|
| POST | `/brand/deals/quote` | Prices lines without saving. KYC-verified brand only (403 `kyc_required`). Returns items, `total_usd`, min delivery, wallet `{balance_usd, shortfall_usd, is_sufficient}` (low balance is a warning only). |
| POST | `/brand/deals` | Save a draft. Max 50 drafts (409 `deal_draft_limit`). |
| GET/PUT/DELETE | `/brand/deals/{id}` | Draft read / replace / delete. |
| POST | `/brand/deals/{id}/attachments` → PUT → `/attachments/{file}/complete`; DELETE `/attachments/{file}` | Brief files (max 5, image/pdf ≤ 20 MB), draft only. |
| POST | `/brand/deals/{id}/send` | `{device_id}`. Brand signs. 409 `deal_price_changed` (draft refreshed, show the new quote), `deal_offer_exists` (1 open offer per creator), `deal_offer_limit` (20 open per brand), 422 `deal_creator_unavailable`. |
| POST | `/brand/deals/{id}/withdraw` | Pull back an open offer. |

Request lines: `{rate_card_id, quantity ≤ 10, addons[]}`. Each quantity unit becomes its own deliverable (max 20 per deal).

### M3 — Lists, detail, timeline, contract (both roles)
`GET /brand/deals?status[]=…`, `GET /influencer/deals?status[]=…` (paginated, newest activity first) · `GET …/deals/{id}` · `GET …/deals/{id}/timeline` · `GET …/deals/{id}/contract` (bilingual JSON snapshot; the Arabic text governs). Influencers never see drafts.

### M4 — Respond, extension, payment (B3)
| Who | Path | Notes |
|---|---|---|
| Influencer | POST `/influencer/deals/{id}/accept` `{device_id}` | No KYC needed (P5). Response `meta.funding {funded, reason, missing_usd}`. If the brand is short → `awaiting_payment` (24h). |
| Influencer | POST `…/decline` `{reason, note?}` | Reasons `schedule_full`, `not_a_fit`, `vacation`, `other` (note required for `other`, ≤ 500). |
| Influencer | POST `…/extension` `{delivery_days, reason, device_id}` | Once per deal, max +14 days. Signs the contract and the extension addendum. |
| Brand | POST `/brand/deals/{id}/extension/approve` / `…/decline` | Approve = countersign + fund. Decline = offer cancelled. |
| Brand | POST `/brand/deals/{id}/fund` | Manual retry while `awaiting_payment`. Top-ups also fund waiting deals automatically. |

**409 `deal_deadline_passed`** can come from accept, decline, extension, extension approve/decline and fund. It means "the offer has closed" (expired or payment timed out on the server). Show that, then refresh the deal.

### M5 — Shipping (B5)
Brand: POST `/brand/deals/{id}/shipment` `{courier, tracking_no, tracking_url?}` (ship and re-ship), PUT `…/shipment` (edit until receipt/issue), POST `…/shipment/cancel` (during an issue → full refund).
Influencer: POST `/influencer/deals/{id}/shipment/receive`, POST `…/shipment/issue` (multipart, `reason`, `note?`, `photos[]` 1–5; photos required for `damaged|incomplete|wrong_item`; `delayed` only 7 days after shipping → 422 `deal_issue_too_early`), POST `…/shipment/cancel` (free cancel after a missed ship window or an unanswered issue).
Deal field `shipping`: `{ship_by, reships_left, free_cancel_from, shipments[]}`. Errors: 409 `deal_already_shipped`, `deal_reship_limit`, 422 `deal_not_shipped`.

### M6 — Drafts and review (B6)
Influencer: POST `/influencer/deals/{id}/items/{item}/uploads` (slot), POST `…/items/{item}/drafts` `{file_ids[1–10], caption ≤ 2200}` (201, deal in `data`, round in `meta.draft`), GET `…/items/{item}/drafts`.
Brand: GET `/brand/deals/{id}/items/{item}/drafts`, POST `…/items/{item}/approve` (also "approve as-is" when `approve_as_is_available`), POST `…/items/{item}/revision` `{note ≤ 2000, pins[≤ 20] {file_id, at_second?, note}}`.
Item fields: `revisions_allowed`, `revisions_used`, `revisions_left`, `approve_as_is_available`, `timer_paused`, `due_at`. Errors: 409 `deal_revisions_exhausted` (meta `extra_revision_available` + price → offer the upsell), `deal_revision_pending`, 422 `deal_upload_invalid`, 409 `deal_upload_limit`.
The brand has 48h to review; if silent, the item is auto-approved (P9).

### M7 — Publish and verify (B7)
| Who | Path | Notes |
|---|---|---|
| Influencer | POST `/influencer/deals/{id}/items/{item}/proof-uploads` | Photos only (screenshot proof). |
| Influencer | POST `…/items/{item}/publish` `{url?, proof_file_ids[1–3]}` | **201**: deal in `data`, the new publication in `meta.publication`. |
| Both | GET `…/items/{item}/publications` | History of hand-ins. |
| Brand | POST `/brand/deals/{id}/items/{item}/verify` | Confirm the live post. Silent 48h → auto-verified. |
| Brand | POST `…/items/{item}/fix` `{note}` | Ask for a corrected link (max 2 per item, 24h window). |

Errors: 422 `deal_live_url_invalid` (`meta.reason` = `invalid | platform_mismatch | handle_mismatch`), 409 `deal_live_url_taken`, 409 `deal_fix_limit`, 409 `deal_deadline_passed` (after a default: `meta.deal_status = creator_defaulted`).
Fields: item `fix_requests_left`, `live_url`, `verified_at`; publication `handle_checked`. **When `handle_checked` is false, show "account not checked" so the brand looks at the screenshots.**
When every item is verified the deal becomes `completed` and escrow is released. While posts are being checked, the wallet hint reads "verifying".

### M8 — Cancel, withdraw, upsells (B8, B9)
- Brand cancel: POST `/brand/deals/{id}/cancel` `{reason, note?, expected_outcome}`. Read `cancellation.brand` first: `{outcome {key: free|kill_fee|dispute_only, label}, free_until, refund_usd, kill_fee_usd, platform_fee_usd, creator_net_usd}`, and send its `outcome.key` as `expected_outcome`. Errors: 409 `deal_cancel_terms_changed` (fresh numbers in meta, so confirm again), 409 `deal_cancel_requires_dispute` (send the user to the dispute flow), 409 `deal_cancel_not_available`. Reasons: `no_longer_needed`, `budget_changed`, `timing_changed`, `other`.
- Influencer withdraw: POST `/influencer/deals/{id}/withdraw` `{reason, note?}` when `cancellation.influencer.withdraw_available`. Costs 1 strike (show `cancellation.influencer.strike`). 409 `deal_free_cancel_available` means use the free shipping cancel instead (no strike). Reasons: `schedule_conflict`, `personal`, `brief_concern`, `other`.
- Strikes: GET `/influencer/strikes` (influencer only, brands never see them).
- Upsells. Brand: POST `/brand/deals/{id}/upsells/quote`, POST `…/upsells` `{kind, line? {rate_card_id, quantity, addons[]}, item_id?, addon?, device_id}` (201, `meta.upsell_id`), POST `…/upsells/{upsell}/withdraw`. Influencer: POST `/influencer/deals/{id}/upsells/{upsell}/accept` `{device_id}` (countersigns the addendum) / `…/decline` `{reason: schedule_full|not_a_fit|other, note?}`. Kinds: `deliverable`, `addon`, `extra_revision`. Deal fields: `upsells[]`, `upsell_window {open, closed_reason, pending_upsell_id}`. Item fields: `deal_upsell_id`, `timer_paused`, add-on entries carry `upsell_id`. Errors (409): `deal_upsell_closed` (meta `reason`), `deal_upsell_pending`, `deal_upsell_not_pending`, `deal_upsell_insufficient_funds` (meta `missing_usd`, so offer a top-up), `deal_upsell_unfunded`.

### M9 — Disputes and retention (B10)
- Disputes (both roles): GET `…/deals/{id}/disputes`, POST `…/dispute/uploads`, POST `…/dispute` `{reason, statement 20–2000}`, POST `…/dispute/evidence` `{note?, file_ids[], links[], refs[] {type: file, id} | {type: shipment_photo, shipment_id, index}}`, POST `…/dispute/withdraw` (opener only). Deal fields: `dispute` (latest), `dispute_window {open, closed_reason, disputes_left}`. Errors: 409 `deal_dispute_limit`, `deal_dispute_evidence_closed`, `deal_dispute_evidence_limit`, 403 `deal_dispute_not_open`, `deal_dispute_not_opener`. Evidence is open for 24h after opening; the admin target time is shown, not enforced.
- Retention (after `completed`): GET `…/deals/{id}/retention`. Brand: POST `/brand/deals/{id}/items/{item}/retention/uploads`, POST `…/items/{item}/retention` `{reason, note?, file_ids[1–3]}`, POST `…/retention/{case}/confirm|reject`. Influencer: POST `/influencer/deals/{id}/retention/{case}/uploads`, `…/restore` `{url?, file_ids[1–3]}`, `…/contest` `{note}`. Deal fields: `retention[] {item_id, ends_at, report_available, open_case_id}`, `retention_cases[]`. Errors (409): `deal_retention_closed`, `deal_retention_case_open`, `deal_retention_not_awaiting`.

### M10 — Ratings (B11)
POST `…/deals/{id}/rating` `{scores {criterion: 1–5}, comment?}` or POST `…/rating/skip`. Brand rates `content_quality, timeliness, communication`; influencer rates `brief_clarity, review_speed, request_clarity`. Deal field `rating {open, due_at, revealed_at, brand, influencer}`. Each side shows only `answered` until both answered or the 7-day window closes. Errors (409): `deal_rating_closed`, `deal_rating_already_submitted`.

### M11 — Notifications (B12)
Push (FCM) and the in-app inbox (`/notifications`) carry `data {type, entity_id, deep_link}`. For deals, `type = deal_<kind>` and `deep_link = sada://deals/{deal_id}`. **Route every deal notification to the deal detail screen.** Then refetch: the push only tells you something changed.
Kinds: offer_sent, extension_requested, payment_required, escrow_funded, ready_to_ship, shipped, reshipped, shipment_updated, product_received, work_started, issue_reported, transit_overdue, issue_answer_missed, ship_window_missed, draft_submitted, revision_requested, revision_overdue, fix_requested, draft_approved, published, item_verified, completed_brand, completed_creator, offer_declined, offer_expired, payment_timeout, cancelled_kill_fee, defaulted, cancelled, dispute_resolved, dispute_opened, dispute_evidence_added, dispute_evidence_closed, dispute_withdrawn, retention_reported, retention_restored, retention_escalated, retention_closed, upsell_proposed, upsell_accepted, upsell_declined, upsell_unfunded, upsell_withdrawn, upsell_voided, upsell_lapsed, rating_submitted, ratings_revealed, strike_recorded, `reminder_<timer>`, `deadline_warning_<timer>`.

---

## 2. Deal shape (`DealResource`)

Top-level keys: `id, origin, status {key,label}, stage {key,label}|null, brand {name, avatar_url}, creator {slug, name, avatar_url}, items[], items_count, total_usd, currency, shipping_mode {key,label}, shipping, cancellation, delivery_hours, requested_delivery_days, extended_delivery_hours, extension, decline_reason, deadline_at, upsells[], upsell_window, dispute, dispute_window, retention[], retention_cases[], rating, brief, brief_attachments[], due_at, sent_at, funded_at, contract {id, hash, signatures[]}, created_at, updated_at`.

Item keys: `id, rate_card_id, deal_upsell_id, title, platform, service, package_value, unit_price_usd, addons[] {type, label, price_usd, options, upsell_id}, total_usd, delivery_days, delivery_hours, retention, revisions_allowed, revisions_used, revisions_left, approve_as_is_available, status {key,label}, due_at, timer_paused, live_url, fix_requests_left, verified_at`.

Deal statuses: `draft, pending_influencer, negotiating_deadline, awaiting_payment, escrow_locked (brief, server-only), product_shipping, shipping_issue, in_progress, disputed, completed` and the finals `declined, expired, cancelled_pre_escrow, cancelled_payment_timeout, cancelled_by_brand, cancelled_with_kill_fee, cancelled_by_influencer, cancelled_shipping_timeout, creator_defaulted, resolved_refund, resolved_payout, resolved_split`.
Item statuses (only while `in_progress`): `pending → draft_submitted ⇄ revision_requested → approved_to_publish → verifying_live → verified` (a brand fix sends `verifying_live → approved_to_publish`). The deal `stage` is the slowest item.
`due_at` is null while timers are frozen (`shipping_issue`, `disputed`): show "paused".

## 3. Timeline (`GET …/timeline`)
Rows: `{id, subject {type: deal|deal_item, id}, from, to, actor {key,label}, reason, metadata, due_at, occurred_at}`.
- **Note rows** have `from == to` (nothing moved). Render them as events, not status changes. Note reasons include `deadline_warning`, `ship_window_missed`, `revision_overdue`, `shipped`, `reshipped`, `shipment_updated`, `transit_overdue`, `issue_answer_missed`, `upsell_proposed|accepted|declined|withdrawn|lapsed|voided|unfunded`, `dispute_evidence_added`, `dispute_evidence_closed`, `retention_reported|restored|contested|confirmed|rejected|escalated|auto_confirmed`, `rating_window_opened`, `rating_submitted`, `ratings_revealed`.
- System reasons: `timeout` (offer/extension/payment expired), `auto_approved` (brand silent on a draft), `auto_verified` (brand silent on a live post), `defaulted`, `all_verified` (completion).
- Other reasons: `published`, `republished`, `verified`, `fix_requested`, `approved_as_is`, `brand_cancelled`, `withdrew`, `dispute_opened`, `dispute_withdrawn`, `issue_unanswered`.
Unknown reasons must still render: fall back to the `to.label`.

---

## 4. Contract changes by task (what changed for the app)

| Task | Change |
|---|---|
| B4 | New 409 `deal_deadline_passed` on accept / decline / extension / extension approve-decline / fund ("the offer has closed" → refresh). Timeline note rows (`from == to`): `deadline_warning`, `ship_window_missed`, `revision_overdue`. New history reasons `timeout`, `auto_approved`, `auto_verified`. |
| B5 | Deal `shipping {ship_by, reships_left, free_cancel_from, shipments[]}` + 6 shipping routes. |
| B6 | Upload slots, drafts, review routes; item `revisions_left`, `approve_as_is_available`; deal `brief_attachments`. |
| B7 | Proof uploads, publish (201 + `meta.publication`), publications list, verify, fix; errors `deal_live_url_invalid` (422, `meta.reason`), `deal_live_url_taken`, `deal_fix_limit`; item `fix_requests_left`; publication `handle_checked`; deal can reach `completed`; escrow hint "verifying". |
| B8 | Deal `cancellation` block; brand cancel, influencer withdraw, strikes list; errors `deal_cancel_requires_dispute`, `deal_cancel_terms_changed`, `deal_free_cancel_available`; `deal_deadline_passed` on publish now has `meta.deal_status`. |
| B9 | Deal `upsells[]`, `upsell_window`; item `deal_upsell_id`, `timer_paused`, add-on `upsell_id`; 5 upsell error codes. All additions. |
| B10 | Deal `dispute`, `dispute_window`, `retention`, `retention_cases` + dispute/retention routes. Existing fields unchanged. |
| B11 | Deal `rating` + rating routes. |
| B12 | Push + inbox for every deal event (§1 M11). No response changes. |
| **B13** | See §5. |

---

## 5. B13 — integrations (new in this handoff)

### 5.1 `GET /brand/home` → `active_deals` is now live
```jsonc
"active_deals": {                 // null when the brand has no open deal
  "needs_action_count": 2,
  "total_count": 3,
  "items": [                      // ≤ 10; "needs your action" first, then soonest due_at
    {
      "id": "01J…",
      "status": { "key": "in_progress", "label": "…" },
      "stage": { "key": "draft_submitted", "label": "…" } | null,   // null unless in_progress
      "creator": { "slug": "food", "name": "Food Creator", "avatar_url": "…" | null },
      "title": "Instagram Reel +2",
      "total_usd": "150.00",
      "due_at": "2026-10-15T09:00:00+03:00" | null,
      "needs_action": true,
      "action": { "key": "review_draft", "label": "Review the draft" } | null
    }
  ]
}
```
- Open = `pending_influencer, negotiating_deadline, awaiting_payment, escrow_locked, product_shipping, shipping_issue, in_progress, disputed`. Drafts and closed deals are never listed.
- `action.key`: `fund` (awaiting payment) · `answer_extension` · `answer_issue` (shipping issue) · `ship` (nothing shipped yet) · `review_draft` · `verify_post` · `add_evidence` (dispute evidence window open). `due_at` is the deadline of that action (for no action: the deal's next deadline).
- Tap → deal detail. The counts cover all open deals, not only the 10 shown.

### 5.2 New island `fund_deals`
Shown when the brand has accepted offers waiting for money. Priority: after `kyc_rejected`, `verify_account`, `verification_pending`; before `complete_profile`.
```jsonc
"island": { "type": "fund_deals", "title": "…", "body": "…", "cta": { "label": "Top up", "action": "top_up" },
            "meta": { "count": 1, "expires_at": "…" } }
```
- `cta.action = top_up` → open the wallet top-up flow. Waiting deals are funded automatically after a top-up.
- **Every island now has a `meta` key**. It is `null` for all types except `fund_deals`.

### 5.3 `GET /wallet/escrows`
- Order is now **closest to release first**: `verifying_live` → `approved_to_publish` → `draft_submitted`/`revision_requested` → `pending` → `product_shipping` → `shipping_issue` → `disputed`; ties oldest first.
- Each row adds `stage` (string key) and `stage_label`. For an `in_progress` deal it is the slowest item's status; otherwise it is the deal status. Both are `null` if the escrow has no deal.

### 5.4 Media kit (`GET /public/creators/{slug}` and the own-kit `preview`)
- `highlights` is live: `{engagement_rate_pct: null, avg_views: null, local_audience_pct: null, completed_campaigns: N}` once the creator has ≥ 1 **completed** deal; `null` before that. Hide null metrics. Show the completed count.
- `worked_with` is live: `{total_brands, items[≤ 12] {id, name, logo_url, is_verified, completed_campaigns}}`, most recent completed deal first; `null` when none. Brands that turned off "Show my brand on creators' profiles" (`PATCH /brand/settings {show_on_creator_profiles}`) are counted in `total_brands` but not listed, so `items` may be shorter than `total_brands`.
- `audience` stays `null` and `top_portfolio_items` stays `[]`, as before.
- Staging with `MEDIA_KIT_DEMO_DATA=true`: demo values fill only the sections that are still empty; real deal data always wins.

### 5.5 KYC and payouts (P5 check)
An influencer can accept and finish deals without KYC; the money lands in their wallet on completion. **Withdrawing** needs verified KYC: `GET /wallet/withdrawals/quote` returns `allowed: false` with reason `kyc_required` (and `POST /wallet/withdrawals` refuses). Show a "Verify to withdraw" CTA there, not on the deal.

---

## 5a. A1 — admin tools: what the app sees (no new app endpoints)

Admins now rule disputes and close retention cases. Nothing new to call; these shapes and kinds start appearing:

- **`dispute.ruling`** (in `DealResource.dispute` and `GET …/disputes`): `null` until ruled, then `{outcome {key refund|payout|split, label}, reason, brand_usd, creator_usd, commission_usd, creator_net_usd, resolved_at}`. `reason` is the admin's public explanation. Deal `status` becomes `resolved_refund|resolved_payout|resolved_split` (final; items keep their last status; no `rating` window opens).
- **Retention case** (`retention_cases[]`, `GET …/retention`): new `admin_note` (team's note when it closed the case) and `clawback_usd` (`null` or amount moved creator → brand). `closed_reason` can now also be `upheld` | `dismissed`.
- **Timeline reasons** (actor `admin`): deal `dispute_resolved` (meta `outcome`, `brand_usd`, `creator_usd`, `commission_usd`, `creator_net_usd`, `note`), deal note `dispute_evidence_reopened` (meta `note`, `hours`, `evidence_due_at`, `admin_target_at` — evidence is open again, show the add-evidence button from `dispute.evidence_open`), item notes `retention_upheld`, `retention_dismissed` (meta `note`), `retention_clawback` (meta `amount_usd`, `note`).
- **Strike reasons** (`GET /influencer/strikes`): new `dispute_lost`, `retention_violation`. Revoked strikes disappear from the list.
- **Wallet**: new transaction type `clawback` (label "Clawback"): debit on the creator, credit on the brand.
- **Notification kinds** (push `deal_*`): `dispute_evidence_reopened` (both), `retention_clawback` (both, body has the amount), `strike_revoked` (creator, opens the deal), `strikes_flag_cleared` (creator, **deep link `sada://strikes`**, no deal id). Existing `dispute_resolved` and `retention_closed` now come from admin actions.
- **Suspension**: a suspended user gets 403 `account_suspended` on every call and all tokens are revoked → log out to the login screen with the message.

---

## 6. Edge-case checklist
- [ ] Any 409 `deal_*` → message + refetch the deal; never retry blindly.
- [ ] Countdown from `due_at`; `null` while `shipping_issue`/`disputed` → "paused".
- [ ] Timeline: `from == to` rows are notes; unknown `reason` → show the `to` label.
- [ ] Publish: show `handle_checked=false` as "account not checked"; on 422 `deal_live_url_invalid` map `meta.reason` to a hint.
- [ ] Cancel: always send `expected_outcome` from the latest deal; on `deal_cancel_terms_changed` show the new numbers and confirm again.
- [ ] Upsell: `deal_upsell_insufficient_funds` → top-up CTA with `meta.missing_usd`.
- [ ] Notifications: open `sada://deals/{id}` and refetch; `sada://strikes` opens the strikes screen (A1).
- [ ] Ruled dispute: render `dispute.ruling` (outcome, amounts, reason) on the deal and the dispute screen.
- [ ] Brand home: `active_deals: null` → hide the rail; `needs_action_count > 0` → badge.
- [ ] Media kit: `worked_with.items.length < total_brands` is normal (privacy).
- [ ] Withdraw: `kyc_required` → verification CTA.
