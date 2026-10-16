# Public Campaigns — Mobile Handoff (C0–C14)

For: the React Native team (`mobile/sadaa`), tasks CM1–CM11 (`docs/plans/Public Campaigns architiecture/mobile-plan.md`).
Backend status: **C0–C13 implemented (2026-10-16/17); C14 home integrations being finished in parallel (§6 is the agreed contract).** Source of truth for decisions: `docs/plans/Public Campaigns architiecture/backend-plan.md`. Business rules in plain English: `docs/product/`. Every request/response is in Postman: `tests/Postman/Shabbak_API.postman_collection.json` (folder "18 - Campaigns", plus "17" for the deal-level routes).

A brand posts a **campaign** (recruiting layer). Creators **apply** (a signed offer, valid 72h). The brand **selects** an applicant: that creates a normal **Deal** (`origin = public`) and everything after Select reuses the Direct Deals screens (`docs/mobile/direct-deals.md`). A campaign never has its own "execution" status: it only describes recruiting.

---

## 1. Overview, feature flag, conventions

### 1.1 Task map

| Task | Section |
|---|---|
| CM1 Wizard, CM2 My campaigns | §3.1–3.4 |
| CM3 Applicants + Select, CM4 system sheets | §3.5–3.6, §3.3 |
| CM8 Drop dashboard, CM9 Batch tools | §3.7, §3.8 |
| CM5 Discover, CM6 Apply + my applications | §4 |
| CM7 / CM10 Linked deal, returns, restrictions | §5 |
| Home strips (C14) | §6 |
| CM11 Notifications | §7 |

### 1.2 Feature flag
- `campaigns.enabled` is **off by default**. While it is off, **every** `/brand/campaigns*`, `/influencer/campaigns*`, `/influencer/campaign-applications*` and the admin review routes answer **404 `feature_disabled`**.
- There is **no bootstrap/config key** that exposes the flag. Detect it from: `active_campaigns: null` on `/brand/home` and `campaigns: null` on `/influencer/deals/summary` (both are `null` when the flag is off), or a 404 `feature_disabled` on the first campaign call. Hide every entry point on `feature_disabled`.
- The deal-level routes (`brief-exit`, `return-shipment`, `restrictions`) are **not** behind the flag.

### 1.3 Ground rules (same as Direct Deals)
- Base path `/api/v1`. Bearer token (Sanctum). Send `Accept-Language: ar|en` (default `ar`). Every `label` is already localized, so show it as-is. Branch on `key` / `error_code`, never on `message`.
- Ids are ULID strings. Times are ISO-8601 with offset; show them in `Asia/Damascus`; count down from the server's timestamps (`apply_deadline_at`, `expires_at`, `drop_at`, `due_at`), never compute deadlines on the device.
- **Money is USD only.** Responses use `*_usd` **strings with 2 decimals** (`"150.00"`). Requests send `*_usd` as number or string with up to 2 decimals. Never compute totals/fees on the device: the server returns `gross_usd / fee_usd / net_usd`. Platform fee is `pricing.fee_bps` (basis points, currently 1000 = 10%) and comes out of the creator's side.
- Envelope: `{ success, message, data, meta: { locale } }`.
- **Paginated lists** (`20/page`): `data = { items: [...], meta: { current_page, last_page, total, ...extras } }`. Send `?page=`. Non-paginated lists (`history`, `compare`, `restrictions`) put a plain array in `data`.
- Errors: `{ success: false, message, error_code, errors?, meta? }`. Validation failures are **422 `validation_failed`** with `errors.<field>`; business errors carry extra keys inside `meta` (listed per endpoint and in §8).
- **409 on a campaign means it changed under you** (`campaign_invalid_transition`, `campaign_not_editable`…). Show the message, refetch the campaign (`GET …/campaigns/{id}`) and redraw.
- Uploads use the same 3 steps as deals: (1) ask for a slot → **201** `{file_id, kind, upload {method: PUT, url, headers, expires_at}}`, (2) `PUT` the bytes to `upload.url` with exactly `upload.headers` (valid 30 min), (3) confirm. Images jpg/png/webp ≤ 20 MB; brief attachments may also be pdf ≤ 20 MB.
- Both roles: after any POST on a campaign, `data` is the full updated campaign (`CampaignResource`) unless noted.
- Brand money actions need a **KYC-verified** brand: 403 `kyc_required` (on submit and on Select).

---

## 2. State machines

### 2.1 Campaign status (`status {key, label}`)

| Key | Label (EN) | What the brand UI shows | What the creator sees |
|---|---|---|---|
| `draft` | Draft | Full edit, submit, delete. Tab "Drafts". | 404 |
| `pending_review` | In review | Read-only. Waiting for the admin (no edits, no cancel). | 404 |
| `changes_requested` | Changes requested | Banner with `review_note`, full edit, resubmit. Counts as a draft. | 404 |
| `open` | Open | Live. Applicants, edit (limited, §3.3), seats, deadline, close, cancel. | In feed, can apply while `accepting_applications` |
| `suspended` | Suspended | "Applicants waited too long". One-tap Reopen (§3.3). Cancels itself after 7 days. | Hidden from feed; detail readable |
| `filled` | All seats filled | Decisions finished. If a seat frees later: reopen/reduce prompt. | Detail readable, cannot apply |
| `closed` | Recruiting closed | Recruiting ended with at least one seat taken. Can only reduce a freed seat. | Detail readable, cannot apply |
| `completed` | Completed | Final. Every linked deal ended and at least one delivered. | Detail readable |
| `cancelled` | Cancelled | Final. | 404 |
| `rejected` | Rejected | Final. Admin refused in review. | 404 |
| `removed` | Removed | Final. Admin takedown after publishing; funded deals keep running. | 404 |

Transitions: `draft → pending_review → open | changes_requested | rejected | removed`; `changes_requested → pending_review | cancelled`; `open → suspended | filled | closed | cancelled | removed`; `suspended → open | closed | cancelled | removed`; `filled → open | completed | cancelled | removed`; `closed → completed | cancelled | removed`.

Suggested brand tabs for `GET /brand/campaigns?status[]=…`: **Drafts** = `draft, changes_requested` · **In review** = `pending_review` · **Live** = `open, suspended, filled, closed` · **Finished** = `completed, cancelled, rejected, removed`.

"Published once" = `open, suspended, filled, closed, completed`: only those are readable by creators (`cancelled`/`removed` campaigns are 404 for them; saved/applied rows pointing at one drop out of the lists). `accepting_applications` (on the creator resource) is the single flag that says "Apply is possible now" (open, deadline ahead, a seat free).

### 2.2 Application status (`status {key, label}`)

| Key | Label (EN) | Meaning / UI |
|---|---|---|
| `submitted` | Submitted | Waiting for the brand. Creator: countdown to `expires_at` (72h), Withdraw. Brand: decide. |
| `shortlisted` | Shortlisted | Brand liked it. **Does not extend the 72h.** Creator: same as submitted + "Shortlisted" chip. |
| `selected` | Selected | A deal exists (`deal {id,status}`). The row never changes again; show the **deal stage** instead (`state`, §4.6). |
| `withdrawn` | Withdrawn | Creator pulled it back. Brand never sees it. |
| `expired` | Expired | 72h passed without a decision. |
| `rejected` | Not selected | Brand declined. **Creator sees only "Not selected"**, no reason. |
| `not_selected` | Not selected | Seats filled/closed or campaign cancelled while pending. Same wording. |
| `cancelled` | Cancelled | Admin took the campaign down. |

Pending = `submitted` or `shortlisted` (counts toward the creator's 10 open applications and the brand's `applications_open`). Transitions: `submitted → shortlisted | any closing status`; `shortlisted → any closing status`; no un-shortlist.

### 2.3 Seat occupancy (derived, never sent as a status)
`seats_total` (brand setting) · `counters.seats_occupied` (linked deals that still hold a seat: `awaiting_payment`, `escrow_locked`, `product_shipping`, `shipping_issue`, `in_progress`, `disputed`, `completed`, `resolved_*`) · seats left = `seats_total − seats_occupied` (creator card: `seats {total, left}`). A seat **frees** when its linked deal ends without delivering (payment timeout, withdraw, brief exit, brand cancel, kill fee, ship timeout, default). The brand then decides through `seat_freed` (§3.3).

---

## 3. Brand endpoints

All under `/brand/campaigns`, brand token, behind the flag. Another brand's campaign is **404**.

### 3.1 Campaign shape (`CampaignResource`)

List rows (`GET /brand/campaigns`) skip `private_brief`, `attachments`, `timers`. Detail has all.

```jsonc
{
  "id": "01J…", "status": { "key": "open", "label": "Open" },
  "title": "Ramadan launch", "activity_type": { "key": "restaurant_cafe", "label": "…" } | null,
  "teaser": { "requirements": "…" } | null,
  "cover": { "id","purpose":"cover","kind":"image","name","mime","size","sha256","status","url" } | null,
  "pricing": { "model": { "key": "fixed|bidding", "label": "…" },
               "seat_price_usd": "100.00" | null, "bid_min_usd": null, "bid_max_usd": null, "budget_usd": "800.00" | null },
  "seats_total": 5,
  "shipping_mode": { "key": "none|gift|returnable", "label": "…" },
  "delivery_days": 7 | null,              // null when the campaign has a drop
  "drop_at": "…" | null,
  "drop": { "draft_due_at", "publish_opens_at", "min_gap_hours", "latest_apply_deadline_at" } | null,
  "apply_deadline_at": "…" | null,
  "deliverables": [ { "id","platform":{key,label},"service":{key,label},"count":1,"revisions":1,"addons":["link_in_bio"] } ],
  "targeting": { "genders": ["male"], "min_followers": 5000 | null, "cities": ["damascus"], "niches": ["food"] },
  "budget_secured": true,                 // cache of "wallet covers the open seats"
  "counters": { "applications_open": 3, "seats_occupied": 1 },
  "seat_freed": { "free_seats": 1, "reducible": 1, "options": ["replace","reduce","reopen"], "deadline_passed": false } | null,
  "review_note": "…" | null,              // admin note after changes_requested / reject
  "duplicated_from_id": "…" | null,
  "missing": ["title","teaser","pricing", …],   // what blocks Submit; [] when ready
  "published_at","created_at","updated_at",
  // detail only:
  "timers": { … see §3.4 … },
  "private_brief": { "hashtags":[], "mentions":[], "talking_points":[], "donts":[], "links":[], "promo_code": "…"|null, "tracking_link": "…"|null } | null,
  "attachments": [ CampaignFile… ]
}
```
`missing` values: `title, activity_type, teaser, deliverables, pricing, apply_deadline_at, schedule` (schedule = neither `drop_at` nor `delivery_days`, or a drop in the past). Use it to mark wizard steps incomplete.

### 3.2 Drafting (CM1)

| Method | Path | Notes |
|---|---|---|
| GET | `/brand/campaigns?status[]=…&page=` | 20/page, latest activity first. |
| POST | `/brand/campaigns` | **201**. Only `title` is required. Max **20 drafts** (`draft` + `changes_requested`, duplicates count): 422 `campaign_draft_limit`. |
| GET | `/{id}` | Detail. |
| PUT | `/{id}` | Autosave each wizard step. Send only the sections you changed. |
| DELETE | `/{id}` | `draft` only (409 `campaign_not_draft`). |
| POST | `/{id}/duplicate` | **201**. Allowed from any status. Copies text, brief, deliverables, pricing, seats, shipping, delivery days, targeting. **Not** dates, applications or files (upload cover/attachments again). |
| GET | `/{id}/quote` | Pricing preview (below). Warning only, nothing is held. |
| POST | `/{id}/files` → PUT → `/{id}/files/{file}/complete`; DELETE `/{id}/files/{file}` | Cover and brief attachments. |

**Body (create and update share the same rules):**

| Field | Rule |
|---|---|
| `title` | required on create; 3–120 |
| `activity_type` | one of `ecommerce, restaurant_cafe, fashion_beauty, tech_apps, health_fitness, events_entertainment, retail_services, other` (labels: `GET /lookups` → `campaign_activity_types`, `{id, name_ar, name_en}`) |
| `teaser` | `{ requirements: ≤ 1000 }` — public text creators see |
| `private_brief` | `{ hashtags[], mentions[], talking_points[], donts[], links[] (https/http urls), promo_code ≤ config, tracking_link (url) }`; each list ≤ 10 entries, each entry ≤ 300 chars. Blank entries are dropped. Revealed to the creator only after funding. |
| `pricing_model` | `fixed` or `bidding`. Switching clears the other model's fields (sending them together is 422 `campaign_pricing_conflict`). |
| `seat_price_usd` | fixed only. $5–$50,000. |
| `bid_min_usd` / `bid_max_usd` | bidding only. **Max is binding**, min is a guide only. Max ≥ min. |
| `budget_usd` | optional total cap; ≥ one seat at the highest price/bid; ≤ seats × $50,000. |
| `seats_total` | 1–20 |
| `shipping_mode` | `none` / `gift` (consumable, no return) / `returnable` (sample goes back). |
| `delivery_days` | 1–90. **Mutually exclusive with `drop_at`** (sending both is 422 `campaign_delivery_with_drop`; with a drop it is stored `null`). |
| `drop_at` | optional synchronized publish moment; must be future and after the deadline with the **min gap: 120h (5 days) digital, 240h (10 days) when `shipping_mode ≠ none`** (422 `drop_at`). |
| `apply_deadline_at` | future, ≤ now + 30 days (422 `apply_deadline_at`). |
| `deliverables[]` | ≤ 20 lines. Each `{platform, service, count 1–10, revisions 0–3, addons[]}`; each platform+service once; platform-agnostic services and the `on_site` add-on are refused (422). ≤ 20 units per creator in total. |
| `targeting` | `{ genders: ["male","female"] (both or none = no gender gate), min_followers 0–1e9, cities[] (governorate keys), niches[] ≤ 5 }`. **Gender, min followers and the platforms from `deliverables` are hard gates; cities and niches only affect ranking** (label them "ranking only"). |

PUT semantics: only the sections sent are replaced; `null` clears a nullable one; `deliverables` and `targeting` replace the whole section. Success messages: `campaigns.draft_created / draft_updated`. Show the derived dates from `drop` (drafts due `drop_at − 72h`, publish opens 15 min before `drop_at`, `latest_apply_deadline_at` = latest legal deadline for the chosen `drop_at`).

**Quote** `GET /{id}/quote` → `{ pricing_model, currency: "USD", fee_bps, seats, deliverables_per_creator, seat: { min: {gross_usd,fee_usd,net_usd}|null, max: … }, total_gross_usd: { min, max }, budget_usd, wallet: { balance_usd, required_usd, shortfall_usd, is_sufficient } }`. Nulls until pricing is set. `max` is capped by the budget.

**Files** `POST /{id}/files` body `{ purpose: cover|brief, name ≤ 255, mime, size }` (throttled). Complete → `CampaignFile {id, purpose, kind, name, mime, size, sha256, status, url}` (`url` is a short-lived signed link). Rules: **one cover** (a new confirmed cover replaces and deletes the old one, ≤ 2 open slots); **≤ 5 brief attachments**; allowed in `draft`, `changes_requested` and the live statuses (`open, suspended, filled`), **not** in `pending_review`. Errors reuse `deal_upload_invalid` (422) and `deal_upload_limit` (409).

### 3.3 Submit, edit after publish, lifecycle (CM1, CM2, CM4)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/{id}/submit` | — | `draft`/`changes_requested` → `pending_review`. Response = campaign + `wallet {balance_usd, required_usd, shortfall_usd, is_sufficient}` (low balance is a **warning banner only**). 403 `kyc_required`; 422 `campaign_not_ready` (`meta.missing`); 422 `campaign_live_limit` (max **5** in `pending_review + open + suspended`); 409 `campaign_not_draft`. |
| PUT | `/{id}` | draft fields | On `open/suspended/filled`: edits go live **without re-review**, each logged in the history. Other statuses: 409 `campaign_not_editable`. |
| POST | `/{id}/seats` | `{ seats }` | `seats` is the **count to add** (1–20); total stays ≤ 20 (422 `seats`). Works on `open/suspended/filled`; a `filled` campaign with a free seat goes back to `open`. If the deadline already passed it **requires `apply_deadline_at`** (422 `apply_deadline_at`). |
| POST | `/{id}/seats/reopen` | `{ apply_deadline_at? }` | From the `seat_freed` prompt on a `filled` campaign. 409 `campaign_invalid_transition` unless `filled`; 409 `campaign_no_freed_seat`; 422 `apply_deadline_at` when the old deadline passed and none sent (`campaign_reopen_deadline_required`). |
| POST | `/{id}/seats/reduce` | `{ seats }` | Drop freed seats you don't want to refill. 422 `seats` when over `seat_freed.reducible`; 409 `campaign_no_freed_seat`. Reducing to 0 seats cancels the campaign. |
| POST | `/{id}/deadline` | `{ apply_deadline_at }` | Later than the current one, in the future, ≤ `published_at + 30 days`, and still ≥ the drop min gap. Only `open/suspended` (409 `campaign_not_editable`). |
| POST | `/{id}/reopen` | `{ apply_deadline_at? }` | **Suspended** campaign back to `open` (ghost reset). New date needed only when `timers.suspension.reopen_needs_deadline`. 409 `campaign_invalid_transition` if not suspended. |
| POST | `/{id}/zero-applicants/extend` | — | One-time **+4 days** rescue (not subject to the 30-day cap, never closer to the drop than the min gap). 409 `campaign_extension_unavailable` with `meta.reason` = `not_offered | already_used | drop_too_close`. |
| POST | `/{id}/cancel` | `{ reason? ≤ 500 }` | Free while **no seat is taken**: 422 `campaign_has_occupied_seats` otherwise (use Close). 409 `campaign_invalid_transition` (e.g. in review). Pending applications become "Not selected". |
| POST | `/{id}/close` | — | End recruiting while **≥ 1 seat is taken**: 422 `campaign_no_occupied_seats` otherwise (use Cancel). Pending applications become "Not selected". |
| GET | `/{id}/history` | — | Timeline rows (below). |

**Lock after the first application** (`terms_locked_at`): `PUT` accepts **only `title` and `teaser`**; any other changed field returns 422 `campaign_field_locked` with `meta.fields` (grey those inputs out). Price, budget, deliverables, targeting, activity, shipping, delivery days, drop date and the private brief are locked. Cover and attachments stay changeable through the file endpoints; seats and deadline through their own endpoints. Unchanged values in the body are ignored, but resending a **past** `apply_deadline_at`/`drop_at` still fails validation, so omit unchanged dates.

**Review outcome** arrives by push and status: approved → `open`; `changes_requested` (read `review_note`, edit, resubmit); `rejected` / `removed` (final, `review_note` explains). Admin routes (`/admin/campaigns/{id}/approve|request-changes|reject|takedown`) are for the admin SPA, not the app.

**`seat_freed` prompt** (on the campaign, `null` when nothing to decide): `options` is a subset of `replace` (Select another pending applicant), `reduce`, `reopen`. `open/suspended` → replace/reduce; `filled` → reopen/reduce; `closed` → reduce. `deadline_passed: true` → ask for a new date before Reopen.

**History row** `{ id, subject {type: campaign|application, id}, from {key,label}|null, to {key,label}, actor {key,label}, reason, metadata, due_at, occurred_at }`. `from.key == to.key` rows are notes (render as events): reasons include `applied`, `campaign_edited` (`metadata.fields`), `seat_freed` (`metadata {deal_id, deal_status, pre_work}`), `ghost_warning`, `deadline_reached`, `zero_applicants`, `zero_applicants_extended`. Unknown reason → fall back to the `to.label`.

### 3.4 Running clocks (`timers`, detail only) — CM4 banners

```jsonc
"timers": {
  "accepting_applications": true, "deadline_passed": false,
  "ghost": { "warns_at": "…", "suspends_at": "…" } | null,      // an applicant waited with no brand action
  "suspension": { "ends_at": "…" | null, "reopen_needs_deadline": false } | null,
  "zero_applicants": { "decide_by": "…", "extend_available": true, "extend_to": "…", "options": ["edit","extend","cancel"] } | null
}
```
- **Ghost:** a pending application nobody acted on warns the brand at 48h and suspends the campaign at 72h. Any shortlist/reject/select resets it.
- **Suspended:** banner with the cancel date (`suspension.ends_at`, 7 days) and a one-tap **Reopen**.
- **Zero applicants** (deadline passed and nobody ever applied): sheet with **edit** (PUT then `/deadline`), **extend** (`/zero-applicants/extend`, only if `extend_available`), **cancel**. Silence for 7 days auto-cancels.

### 3.5 Applicants (CM3)

| Method | Path | Notes |
|---|---|---|
| GET | `/{id}/applications` | Paginated list (below). |
| GET | `/{id}/applications/compare?ids[]=a&ids[]=b` | **2–4** ids (distinct ULIDs). `data` = plain array of cards. |
| GET | `/{id}/applications/{app}` | One card. |
| POST | `/{id}/applications/{app}/shortlist` | Returns the card. No un-shortlist. Does not extend the 72h. |
| POST | `/{id}/applications/{app}/reject` | Returns the card. **No reason field**; creator only sees "Not selected". |
| POST | `/{id}/applications/{app}/select` | `{ device_id? }` → **201** (below). |

**List query:** `status[]` (any application status except `withdrawn`; **default = pending**: submitted + shortlisted), `governorate[]`, `niche[]`, `min_followers`, `invited` (bool), `sort` = `newest` (default) | `oldest` | `expiring` | `price_asc` | `price_desc` | `followers` | `rating`, `page`. There is no platform filter (the platforms are fixed by the campaign). `data.meta` extras: `counts {submitted, shortlisted, selected, expired, rejected, not_selected, cancelled}` (for the tab badges) and `recruiting` (below).

**Applicant card** (`BrandCampaignApplicationResource`):
```jsonc
{ "id","status":{key,label},"invited":false,"pitch":"…"|null,
  "price": { "is_bid": true, "gross_usd": "90.00", "net_to_creator_usd": "81.00" },
  "accounts": [ { "platform":{key,label}, "username","follower_count":12000|null,"follower_tier":"…"|null,"verification_status":"…","available":true } ],
  "creator": { "slug","display_name","avatar_url","governorate":{value,label}|null,"niches":[{value,label}],"tier","tier_label" },
  "track_record": { "completed_deals": 4, "rating": { "average": 4.6|null, "count": 3 } },
  "terms_hash","applied_at","expires_at","decided_at",
  "deal": { "id", "status":{key,label} } | null,
  "actions": { "can_shortlist": true, "can_reject": true, "can_select": true } }
```
No phone, email, full name or area. `creator.slug` opens the existing media kit screen. Show the 72h countdown from `expires_at`; an expired row returns 409 `campaign_application_expired` on any decision.

**Decisions** are allowed on `open` and `suspended` campaigns (a decision on a suspended one **reopens it**), and also after the deadline while pending applicants remain.

**Select** → `201 { application, deal {id, status {key,label}}, funding {funded, reason, missing_usd}, recruiting }`:
- Funded: deal is `escrow_locked`/working; message "money held in escrow". Open the linked deal (it uses the normal Deal screens).
- Not funded (`funding.funded = false`): deal is `awaiting_payment` for **24h**; show the funding prompt with `funding.missing_usd` and the wallet top-up flow. A top-up funds the waiting deal automatically; `POST /brand/deals/{id}/fund` retries manually. Timing out frees the seat.
- `recruiting` (also in the applicants list meta): `{ status, seats_total, seats_occupied, seats_left, wallet {balance_usd, required_usd, shortfall_usd, covers_open_seats}, budget_secured, prompt_close }`. `required_usd` = open seats × price (or max bid), capped by the remaining budget, plus deals still awaiting payment. **`prompt_close = true`** (open, seats left, ≥ 1 taken, wallet short) → show "Close recruiting now" (`POST /close`) / "Keep open".
- Select errors: 403 `kyc_required`; 409 `campaign_no_free_seat`; 409 `campaign_application_expired`; 409 `campaign_invalid_transition`; 409 `campaign_drop_too_close` (`meta.min_hours`, `meta.drop_at`: after the deadline, selecting needs the same runway before the drop); 422 `campaign_budget_exceeded` (`meta` `budget_usd, committed_usd, remaining_usd, price_usd`); 422 `campaign_applicant_unavailable` (`meta.reason` = `creator_restricted | creator_inactive | account_unavailable`, + `platforms`).

### 3.6 Invitations (CM3 filter, shortlist action)
| Method | Path | Notes |
|---|---|---|
| GET | `/{id}/invitations` | `{ items: [{ id, creator {slug, display_name, avatar_url}|null, invited_at, seen_at, applied_at }], limit, used }` (creator `null` if they left Explore). |
| POST | `/{id}/invitations` | `{ creators: [explore slug, …] }` 1–100, distinct. Only creators **on the brand's shortlist**. Campaign must still accept applications (409 `campaign_not_accepting`). |

Response is always 200 with a per-creator report: `{ results: [{ creator, invited, reason {key,label}|null, eligibility [{key,label}]|null }], invited, skipped, limit, used }`. Skip `reason.key`: `not_shortlisted | already_invited | already_applied | not_eligible` (with `eligibility[]`) `| limit_reached`. Cap: **50 invitations per campaign** (ever sent). Invited creators get a ranking boost and an "Invited" badge; `GET …/applications?invited=1` filters them.

### 3.7 Drop dashboard (CM8) — `GET /{id}/drop`
409 `campaign_no_drop` when the campaign has no `drop_at`.
```jsonc
{ "campaign_id","drop_at","publish_opens_at","draft_due_at",
  "phase": "upcoming | publish_open | live",
  "countdown": { "seconds_to_publish_open": 0, "seconds_to_drop": 3600 },
  "reminders": [ { "minutes_before": 1440, "at": "…", "sent": true }, … ],     // 1440, 120, 0
  "totals": { "linked": 4, "awaiting_payment": 0, "working": 2, "in_review": 1, "late": 0, "verified": 1, "defaulted": 0, "ended": 0 },
  "creators": [ { "deal_id", "state": {key,label}, "deal_status": {key,label},
                  "creator": { "slug","display_name","avatar_url" },
                  "items": { "total": 2, "in_review": 1, "verified": 0 },
                  "due_at": "…"|null, "late_until": "…"|null } ] }
```
`state.key`: `awaiting_payment | working | in_review | late | verified | defaulted | ended`. **Late** means the creator missed a draft/publish moment and the 24h grace is running (`late_until`); after it the deal defaults. Tap a row → the linked deal (`sada://deals/{deal_id}`). Refresh on pull and on a `campaign_drop_*` push.

### 3.8 Batch tools (CM9) — product campaigns only
`shipping_mode = none` → 422 `campaign_no_shipping` on both shipping routes.

**`GET /{id}/shipping`** →
```jsonc
{ "campaign_id", "shipping_mode": {key,label},
  "totals": { "awaiting": 3, "ready": 2, "blocked": 1, "shipped": 1 },
  "deals": [ { "deal_id","kind":"first|reship","deal_status":{key,label},
               "creator": { "slug","display_name","avatar_url" },
               "ready": true, "blockers": ["brief_window","address_missing"],
               "ship_from": "…"|null, "ship_by": "…"|null, "reshipments_left": 2,
               "last_shipment": { "courier","tracking_no" }|null,
               "address": { …DealShippingAddress… } | null } ] }
```
- Lists funded deals with nothing shipped yet (`kind: first`) and deals with a reported issue (`kind: reship`, never blocked).
- `blockers`: `brief_window` (the creator's 24h brief-review window still runs, ship allowed from `ship_from`) · `address_missing` (the creator has not entered an address). Disable rows with blockers and show the `ship_from` countdown.
- Reading addresses is **logged server-side** for audit (show "viewing is logged"). No export.

**`POST /{id}/shipments`** `{ shipments: [{ deal_id, courier ≤ 100, tracking_no ≤ 100, tracking_url? https ≤ 500 }] }`, 1–20 rows, distinct `deal_id`. Always **200** with a per-row report: `{ total, shipped, failed, results: [{ deal_id, ok: true, shipment: {…} } | { deal_id, ok: false, error_code, message, meta }] }`. Row errors use the normal deal codes (`campaign_brief_window_open` with `meta.ship_from`, `deal_address_missing`, `deal_reship_limit`…) or `campaign_shipment_deal_unknown`. Render per row, keep the failures editable.

**Announcements:** `GET /{id}/announcements` (paginated `{id, body, link, recipients_count, sent_at}`) · `POST /{id}/announcements` `{ body 3–1000, link? https ≤ 500 }` → **201** the announcement. Informational only (terms never change). Goes to every creator on a **funded** linked deal; deals awaiting payment and finished ones are skipped. Cap **3 per rolling 24h per campaign**: **429 `campaign_announcement_limit`** with `meta.next_available_at`. No recipients → 422 `campaign_no_announcement_recipients` (does not count toward the cap).

---

## 4. Creator endpoints

All under `/influencer`, creator token, behind the flag.

### 4.1 Feed, saved, detail (CM5)

| Method | Path | Notes |
|---|---|---|
| GET | `/influencer/campaigns?activity_type[]=…&pricing_model=fixed|bidding&page=` | 20/page. Already **gated and ranked by the server** (niche 40, city 20, freshness 30, invited +25). There are no platform/price/shipping filters server-side: filter those on the client if the design needs them. |
| GET | `/influencer/campaigns/saved` | Bookmarks, newest save first. Only campaigns still accepting applications; already-applied ones stay and are flagged by `eligibility.reasons[].key = already_applied`. |
| GET | `/influencer/campaigns/{id}` | Teaser detail. Any campaign published at least once is readable (a saved/invited link keeps working after it fills); draft/review/rejected → 404. **Opening it marks an invitation as seen.** |
| POST / DELETE | `/influencer/campaigns/{id}/bookmark` | Idempotent. Save needs an accepting campaign (404 otherwise). |

**Card / detail (`CreatorCampaignResource`)**
```jsonc
{ "id","status":{key,label},"accepting_applications":true,"title",
  "activity_type":{key,label}|null,
  "brand": { "name","avatar_url","verified":true },
  "cover": CampaignFile|null,
  "pricing": { "model":{key,label}, "fee_bps":1000,
               "fixed": { "gross_usd","fee_usd","net_usd" }|null,
               "bid":   { "min": {gross_usd,fee_usd,net_usd}, "max": {…} }|null },
  "seats": { "total": 5, "left": 3 },
  "apply_deadline_at","drop_at","delivery_days",
  "shipping_mode":{key,label},
  "deliverables": [ { "platform":{key,label},"service":{key,label},"count","revisions","addons":[] } ],
  "bookmarked": false, "invited": false, "budget_secured": true,
  "eligibility": { "eligible": true, "reasons": [ { "key","label","meta" } ] },
  "published_at",
  // detail only:
  "teaser": { "requirements": "…" }|null,
  "requirements": { "genders":[], "min_followers": 5000|null, "cities":[], "niches":[] } }
```
- **Show the creator's take-home (`net_usd`) as the headline**, gross/fee as detail. For bidding show the min–max range.
- Never present: private brief, brief attachments, budget, applicant counts. Show a locked block "Private brief is revealed after funding".
- **`eligibility`:** the feed hides everything the creator can't apply to except `gender_required`. The detail always reports. `reasons[].key`: `platform_missing` (`meta.platforms`) · `min_followers` (`meta.platforms`, `meta.min_followers`) · `gender_mismatch` · `gender_required` (→ deep-link to profile, §4.4) · `already_applied` · `return_pending` · `public_apply_ban`. Disable Apply with the reason's `label`; `eligible: true` + `accepting_applications: true` enables it.
- `budget_secured` → "Budget secured" chip. `invited` → "Invited" chip.

### 4.2 Apply (CM6) — `POST /influencer/campaigns/{id}/apply` → **201**
```jsonc
{ "pitch": "optional, ≤ 500", "bid_usd": 90.00 /* bidding only */,
  "accounts": { "instagram": "<influencer_platforms.id>", "tiktok": "<id>" },
  "device_id": "optional" }
```
- **Applying is a signed, binding offer valid for 72 hours.** There is no separate consent field: the apply call itself signs (ip, device and user agent are recorded server-side). Show the terms summary and a consent checkbox before enabling the button, built from the detail: deliverables, price, shipping mode, delivery days or drop date, deadline. The applied terms are frozen (hash in `terms_hash`) and the **private brief is not part of them**.
- `accounts`: **exactly one** account per platform the campaign requires (key = platform key, value = the creator's linked account id from `GET /influencer/platforms`), approved and available, meeting the follower minimum. Extra platforms are refused.
- Fixed price: do not send `bid_usd` (422). Bidding: `bid_usd` is required, `≤ pricing.bid.max.gross_usd` (binding) and ≥ $5. `pricing.bid.min` is advisory only. Show the live net preview from `pricing.fee_bps`; the exact net comes back in the response.
- Pitch optional (blank = none).
- No re-apply: any earlier application on the campaign (even closed) hides it from the feed and the detail shows `already_applied`.
- Max **10 open applications** (`submitted + shortlisted`); running deals do not count.
- Success message: "Application sent. The brand has 72 hours to respond."

**Errors:** 403 `creator_restricted` (`meta.restriction`, `meta.ends_at`, `meta.deal_id`: show the banner from §5.5) · 404 not published · 409 `campaign_not_accepting` · 422 `campaign_application_limit` (`meta.limit`) · 422 `campaign_profile_incomplete` (`errors.gender`, `meta.missing: ["gender"]` → open profile) · 422 `campaign_not_eligible` (`meta.reasons[]`, `meta.details`) · 422 `validation_failed` with keys `bid_usd` (`campaign_bid_required | campaign_bid_not_allowed | campaign_bid_too_high | campaign_bid_too_low`) and `accounts.<platform>` (`campaign_account_required | campaign_account_unexpected | campaign_account_invalid`).

### 4.3 My applications (CM6)

| Method | Path | Notes |
|---|---|---|
| GET | `/influencer/campaign-applications?status[]=…&page=` | 20/page. Suggested tabs: **Open** `submitted, shortlisted` · **Selected** `selected` · **Closed** `expired, rejected, not_selected, withdrawn, cancelled`. |
| GET | `/influencer/campaign-applications/{id}` | Another creator's id is 404. |
| POST | `/influencer/campaign-applications/{id}/withdraw` | Returns the application. Only pending ones; decided ones → 409 `campaign_invalid_transition`. A **selected** application is left through the deal (§5.3). |

**Application** (`CreatorCampaignApplicationResource`):
```jsonc
{ "id","status":{key,label},
  "state": { "key","label","source":"deal|application" },   // what the card shows
  "can_withdraw": true, "pitch",
  "price": { "is_bid": true, "gross_usd","fee_usd","net_usd" },
  "accounts": [ { "platform":{key,label}, "username" } ],
  "terms_hash","signed_at","expires_at","decided_at",
  "campaign": { "id","title","status":{key,label},"pricing_model","cover","brand":{name,avatar_url},"apply_deadline_at","drop_at" },
  "deal": { "id","status":{key,label} } | null,
  "created_at" }
```
`state`: while waiting it is the application status (`source: application`) with the 72h countdown from `expires_at`; once selected it is the **linked deal's stage** (`source: deal`, e.g. `awaiting_payment`, `escrow_locked`, `in_progress` item stage…): show that and open the deal on tap. "Not selected" is shown neutrally, no reasons. The campaign's `id` here is the only way to map a deal back to its campaign on the creator side.

### 4.4 Profile gender (needed for gender-targeted campaigns)
`gender` (`male|female`) is on `GET /user/profile` and settable with `PATCH /influencer/profile` (`gender`) and optional in `POST /onboarding/influencer/step-2`. Old accounts are `null`: a campaign with a gender target is shown flagged `gender_required`. Add a gender picker to profile and onboarding step 2.

---

## 5. Linked-deal additions (CM7, CM8, CM10)

A linked deal is a normal deal with `origin = "public"`. Everything in `docs/mobile/direct-deals.md` applies (state machine, uploads, drafts, publish, disputes, ratings). Differences:

### 5.1 Identifying the campaign
- `DealResource.origin = "public"` marks a campaign seat. `DealResource.campaign` = `{id, title}` on a linked deal, `null` on a direct deal (list + detail, both sides): use it for the campaign header chip and to open `sada://campaigns/{id}`. The `/brand/home` `active_deals.items[].campaign` card field has the same shape (§6).
- Deal items come from the campaign's frozen terms (one row per unit, price split equally); each item's snapshot is pinned to the creator's selected account for that platform.

### 5.2 Brief reveal and 24h brief exit (creator)
- Before the deal is funded the creator sees `brief: null`, `brief_hidden: true`, `brief_attachments: []`. Show "Brief unlocks when funded". After funding (`funded_at`) the brief and the campaign's brief attachments are in `brief` / `brief_attachments`. The brand always sees them.
- For **24 hours from `funded_at`** the creator may leave cleanly: `cancellation.influencer.brief_exit_available` + `brief_exit_until`. Show a banner "Review the brief — you can leave without penalty until …".
- **`POST /influencer/deals/{id}/brief-exit`** `{ note? ≤ 500 }` → deal in `data`; status `cancelled_by_influencer`, brand refunded in full, **no strike**, the seat frees. 409 `deal_brief_exit_closed` (`meta.exit_until`). The window also closes once any draft round exists or something shipped.
- While the window is open, `POST /influencer/deals/{id}/withdraw` (strike path) is refused with 409 `deal_brief_exit_available` (`meta.exit_until`): send the user to the exit instead.
- Withdrawing in `awaiting_payment` is allowed with no strike (nothing to refund): `cancellation.influencer.strike = false`. Show "no penalty" whenever `strike` is false.

### 5.3 Shipping during the brief window (brand)
`shipping.ship_from` (ISO or `null`) is set while the creator's brief window runs. **First send before it → 422 `campaign_brief_window_open`** (`meta.ship_from`). Disable the Ship button with "Creator brief review until …". The brand's ship window (`shipping.ship_by`) starts when the brief window closes. For many deals at once use the batch screen (§3.8).

### 5.4 Synchronized drop (creator, brand)
Deal field `drop`: `null` for direct deals and campaigns without a drop; else `{ drop_at, publish_opens_at, publish_open }`.
- Drafts are due by `drop_at − 72h` (never less than 24h after funding or receipt, even if funded late).
- The live-link button opens **15 min before `drop_at`** (`publish_opens_at`). Before that, `POST …/items/{item}/publish` is refused with **422 `campaign_drop_not_open`** (`meta.opens_at`, `meta.drop_at`); screenshot proof uploads stay open. Show a countdown to `publish_opens_at` and disable Publish while `publish_open` is false.
- After approval the publish due time is `drop_at` while ahead, else the usual 48h. Missing it follows the normal deadline warning + 24h grace, then default (no new state).
- Reminders reach each working creator at 24h / 2h / 0 before `drop_at` (§7).

### 5.5 Returnable samples and restrictions (CM10)
For `shipping_mode = returnable` the sample must come back when the deal **closes** (any final status) after the product was received (a shipment marked received, or an issue reported as `damaged / incomplete / wrong_item`).

- Deal field `return_shipment` (null until the return opens): `{ id, status {key,label}, waybill_due_at, overdue, courier, tracking_no, tracking_url, handed_at, shipped_at, confirm_by, received_at, auto_received, issue {note, photos[{url,mime,size}], reported_at}|null, waived_at, waive_note }`. `status.key`: `awaiting_waybill → shipped → received | issue_reported`, or `waived`.
- **Creator:** `POST /influencer/deals/{id}/return-shipment` `{ courier ≤ 100, tracking_no ≤ 100, tracking_url? https ≤ 500, handed_at? (not future, not before funding) }` → deal. Can be re-POSTed to correct the waybill until the brand answers. Due in **5 days** (`waybill_due_at`, reminder at 24h); late = `overdue: true`, one normal strike (reason `return_overdue`) and the lock stays until the waybill is in.
- **Brand:** `POST /brand/deals/{id}/return-shipment/receive` · `…/issue` (multipart: `note` 5–1000 required, `photos[]` ≤ 5 jpg/png/webp ≤ 20 MB; throttled) · `…/waive` `{ note? ≤ 500 }` (before receipt; the creator keeps the sample). Brand silent for **14 days** after the waybill → auto received (`auto_received`, `confirm_by` is the date). Issues go to the admin team; no automatic penalty. All return a deal.
- 409 `deal_return_unavailable` (`meta.status`) when the action doesn't fit the return's state.
- **Lock:** from the moment the deal closes until the waybill is entered, the creator cannot apply to campaigns, accept direct offers or ask a deadline extension (restriction `return_pending`). Entering the waybill (or a waive) lifts it.
- **Ban:** a **severe strike** (the creator withdraws or defaults after receiving a `gift` product) bans public applications for **30 days** (restriction `public_apply_ban`); direct offers stay allowed.
- **`GET /influencer/restrictions`** → `data` = active locks `[ { id, kind {key,label}, blocks_public_applications, blocks_direct_offers, deal_id, starts_at, ends_at|null } ]`, `meta { can_apply_public, can_accept_direct }`. `kind.key`: `public_apply_ban`, `return_pending`. Show a global banner when the list is not empty (CTA for `return_pending` → the return form on `deal_id`; for the ban show `ends_at`). Blocked calls return **403 `creator_restricted`** (`meta.restriction`, `meta.ends_at`, `meta.deal_id`).
- `GET /influencer/strikes` rows now carry `severity {key: normal|severe, label}` and reasons may include `return_overdue`: show a "severe" chip.

### 5.6 Announcements in the timeline
`GET …/deals/{id}/timeline` gains a **note row** (`from == to`) with `reason = "campaign_announcement"` and `metadata { announcement_id, campaign_id, body, link }`. Render with a megaphone icon, body and optional link. Also arrives as push `deal_campaign_announcement`. Other new timeline reasons on linked deals: `brief_exit`, `awaiting_payment_withdraw`, `return_required`.

### 5.7 Funding of a linked deal
A Select that finds the wallet short creates the deal in `awaiting_payment` (24h). Brand sees it in `/brand/home` island `fund_deals` (§6); the creator's application `state` shows "Waiting for funding". Timeout: deal `cancelled_payment_timeout`, seat freed (a pre-work free seat reopens a `filled` campaign by itself when its deadline is still ahead).

---

## 6. Home integrations (C14)

> Being added in parallel by another engineer. This is the agreed contract.

### 6.1 `GET /brand/home` → `active_campaigns`
```jsonc
"active_campaigns": {                 // null when the flag is off or the brand has no active campaign
  "needs_action_count": 2,
  "total_count": 4,                   // all active campaigns, not only the items shown
  "items": [                          // ≤ 5; needs-action first, then soonest apply_deadline_at
    { "id": "01J…", "title": "Ramadan launch",
      "status": { "key": "open", "label": "Open" },
      "seats": { "total": 5, "occupied": 2, "left": 3 },
      "applications_open": 3,         // pending applications
      "awaiting_payment_count": 1,    // linked deals waiting for money
      "apply_deadline_at": "…" | null, "drop_at": "…" | null,
      "budget_secured": true,
      "needs_action": true,
      "action": { "key": "fund_seats", "label": "Fund the selected seats" } | null }
  ]
}
```
- **Active** = status in `pending_review, changes_requested, open, suspended, filled, closed`.
- `action.key` priority (first match wins): `fund_seats` (≥ 1 linked deal `awaiting_payment`) → `reopen` (suspended) → `seat_freed` (a freed seat to decide) → `fix_draft` (changes requested) → `review_applicants` (open with pending applications). `action: null` / `needs_action: false` otherwise.
- Tap → the campaign (`sada://campaigns/{id}`), landing on the screen that matches `action.key` (fund → wallet/deal, reopen/seat_freed/fix_draft → campaign detail, review_applicants → applicants).
- `active_campaigns: null` → hide the rail.

### 6.2 `GET /brand/home` → deal additions
- Island `fund_deals`: `meta` gains **`campaign_count`** (how many of the awaiting-payment deals are campaign seats), next to the existing `count` and `expires_at`.
- Each `active_deals.items[]` card gains **`campaign: { id, title } | null`** (`null` for direct deals). Show a campaign chip.

### 6.3 `GET /influencer/deals/summary` → `campaigns`
```jsonc
"campaigns": {                        // null when the flag is off
  "feed_count": 12,                   // campaigns the creator can apply to right now (same as the feed total)
  "new_invites": 1,                   // unseen invitations to campaigns still accepting applications
  "open_applications": 2,             // submitted + shortlisted
  "items": [ …≤ 3 feed cards, same shape as §4.1 list items… ]
}
```
Use it for the "Campaigns for you" strip; `new_invites > 0` → badge. An invitation counts as seen once the campaign detail is opened.

---

## 7. Notifications (CM11)

Push (FCM) and the in-app inbox (`/notifications`) both carry `data { type, entity_id, deep_link }`. Always **navigate to `deep_link` then refetch**; the push only says something changed. Deep links in use: `sada://campaigns/{campaign_id}`, `sada://deals/{deal_id}`, `sada://strikes`. (The admin console links `sada-admin://…` never reach the app.)

> Mobile-plan deep links `sada://campaigns/{id}/applications`, `…/drop` and `sada://applications/{id}` **do not exist** in pushes: route `sada://campaigns/{id}` to the campaign detail and pick the right tab from the campaign `status`/counters.

### 7.1 Brand pushes (`entity_id` = campaign id, link `sada://campaigns/{id}`)
| `data.type` | When | Extras in the text |
|---|---|---|
| `campaign_approved` | Admin approved (from review) | — |
| `campaign_changes_requested` | Admin asked for changes | note (also in `review_note`) |
| `campaign_rejected` | Admin rejected | reason |
| `campaign_removed` | Admin took the campaign down | reason |
| `campaign_new_applications` | Digest: new applicants. **One push per campaign, at most every 60 min**; the first on a quiet campaign goes out within a minute | count |
| `campaign_ghost_warning` | An applicant waited 48h without a reply | suspend date |
| `campaign_suspended` | Auto-suspended after 72h (not sent for a brand-initiated suspend) | cancel date |
| `campaign_suspension_final_warning` | 24h before a suspended campaign is auto-cancelled | date |
| `campaign_deadline_reached` | Apply deadline passed with pending applicants | count |
| `campaign_zero_applicants` | Deadline passed, nobody applied (7-day window starts) | decide-by date |
| `campaign_zero_applicants_final_warning` | 24h before auto-cancel | date |
| `campaign_filled` | Last seat taken (also for the brand's own Select) | — |
| `campaign_closed` | Recruiting closed by the system (not echoed for the brand's own close) | — |
| `campaign_cancelled` | Cancelled by the system (no creator on board); not echoed for the brand's own cancel | — |
| `campaign_seat_freed` | A creator left; replace / reduce / reopen | — |
| `campaign_seat_reopened` | A creator left and the seat reopened by itself | — |
| `campaign_drop_summary_1440` / `_120` / `_0` | Drop in 24h / 2h / now, with the number of creators working | count |

### 7.2 Creator pushes
| `data.type` | `entity_id` / link | When |
|---|---|---|
| `campaign_invited` | campaign / `sada://campaigns/{id}` | A brand invited you. Open the teaser with the "Invited" badge |
| `campaign_shortlisted` | campaign | Shortlisted |
| `campaign_selected` | campaign id, **link = `sada://deals/{deal_id}`** | Selected: open the linked deal |
| `campaign_not_selected` | campaign | Seats filled / closed / cancelled while pending |
| `campaign_application_rejected` | campaign | Brand declined |
| `campaign_application_expired` | campaign | 72h passed |
| `campaign_application_cancelled` | campaign | Admin took the campaign down |
| `campaign_drop_reminder_1440` / `_120` / `_0` | campaign id, **link = `sada://deals/{deal_id}`** | Drop in 24h / 2h / now. Sent to every creator on a funded linked deal |
| `deal_campaign_announcement` | deal id / `sada://deals/{deal_id}` | Brand announcement (excerpt ≤ 120 chars; full text in the timeline) |
| `deal_public_apply_ban` | none → **`sada://strikes`** | Severe strike: public applications paused until the date |
| `deal_public_apply_ban_lifted` | `sada://strikes` | Ban ended or revoked by an admin |
| `deal_return_lock_lifted` | deal / `sada://deals/{deal_id}` | Sample return settled, account unlocked |
| `deal_return_required` | deal | Deal closed with a returnable sample: enter the waybill (date in text) |
| `deal_return_received`, `deal_return_waived` | deal | Brand confirmed the return / waived it |
| `deal_return_issue` | deal | Brand reported a problem with the return |
| `deal_return_overdue` | deal | Waybill overdue (+ strike) |

Brand deal pushes for returns: `deal_return_shipped` (waybill entered, confirm receipt), `deal_return_overdue_brand` (creator late; team notified). Every other deal event is the existing `deal_<kind>` set from Direct Deals; the brief exit produces the usual cancellation pushes.

Notes: the application-change pushes (`shortlisted`, `selected`, `not_selected`, `application_rejected`, …) go only to the applicant. "Own action" pushes are not echoed (a brand is not told about its own close/cancel, a creator not about their own withdrawal). A return **lock imposed** is told by `deal_return_required`; only the lift has its own push. No per-category server switches: implement "push categories" as a client-side filter on `data.type` prefix (`campaign_`, `deal_`).

---

## 8. Error code index

HTTP status is the default unless noted. `meta` keys in brackets.

| `error_code` | HTTP | When | UI hint |
|---|---|---|---|
| `feature_disabled` | 404 | Campaigns flag off | Hide campaign UI |
| `validation_failed` | 422 | Any field rule, with `errors.<field>` | Pin to the input |
| `kyc_required` | 403 | Brand not KYC-verified (Submit, Select) | KYC flow |
| `creator_restricted` | 403 | Public apply ban / pending sample return [`restriction`, `ends_at`, `deal_id`] | Restriction banner (§5.5) |
| `campaign_invalid_transition` | 409 | Status doesn't allow the step; stale copy [`from`, `to`, `campaign_status`] | Refetch and redraw |
| `campaign_not_draft` | 409 | Delete/submit on a non-draft | Refetch |
| `campaign_not_editable` | 409 | Edit/extend/add seats in a status that doesn't allow it | Refetch |
| `campaign_draft_limit` | 422 | 20 open drafts | Finish/delete one |
| `campaign_not_ready` | 422 | Submit with missing parts [`missing[]`] | Jump to the first missing step |
| `campaign_live_limit` | 422 | 5 campaigns in review/open/suspended | Close/cancel one |
| `campaign_field_locked` | 422 | Locked field after first application [`fields[]`] | Grey out; only title/teaser editable |
| `campaign_has_occupied_seats` | 422 | Cancel with a taken seat | Offer Close |
| `campaign_no_occupied_seats` | 422 | Close with no taken seat | Offer Cancel |
| `campaign_schedule_passed` | 422 | Admin approve when deadline/drop lapsed in the queue | (admin) brand edits dates |
| `campaign_extension_unavailable` | 409 | +4 days not offered [`reason`: `not_offered | already_used | drop_too_close`] | Hide/explain |
| `campaign_no_freed_seat` | 409 | Reopen/reduce with nothing freed | Refetch (prompt gone) |
| `campaign_no_free_seat` | 409 | Select with every seat taken | Add seats |
| `campaign_budget_exceeded` | 422 | Select over budget [`budget_usd`, `committed_usd`, `remaining_usd`, `price_usd`] | Raise budget? Show remaining |
| `campaign_application_expired` | 409 | Decision on a lapsed application | Refresh list |
| `campaign_applicant_unavailable` | 422 | Applicant can't be selected [`reason`, `platforms`] | Explain, pick another |
| `campaign_drop_too_close` | 409 | Select after the deadline without drop runway [`min_hours`, `drop_at`] | Explain |
| `campaign_no_drop` | 409 | Drop dashboard on a campaign without `drop_at` | Hide tab |
| `campaign_no_shipping` | 422 | Shipping tools on `shipping_mode = none` | Hide tools |
| `campaign_shipment_deal_unknown` | 404 (per row) | Bulk row deal not in this campaign | Per-row error |
| `campaign_announcement_limit` | 429 | 3 per rolling 24h [`next_available_at`] | Show when it resets |
| `campaign_no_announcement_recipients` | 422 | No funded linked deal to receive it | Explain |
| `campaign_not_accepting` | 409 | Apply/invite/bookmark-apply on a campaign not taking applications | Refetch detail |
| `campaign_application_limit` | 422 | 10 open applications [`limit`] | Withdraw one |
| `campaign_profile_incomplete` | 422 | Gender missing for a gender-targeted campaign [`missing: ["gender"]`] | Open profile |
| `campaign_not_eligible` | 422 | Hard gates fail [`reasons[]`, `details`] | Show reasons from the detail |
| `campaign_brief_window_open` | 422 | Brand ships during the creator's 24h brief window [`ship_from`] | Countdown, disable |
| `campaign_drop_not_open` | 422 | Live link before `drop_at − 15 min` [`opens_at`, `drop_at`] | Countdown, disable Publish |
| `deal_brief_exit_closed` | 409 | Brief exit after the 24h / once work started [`exit_until`] | Hide the exit |
| `deal_brief_exit_available` | 409 | Strike-withdraw while brief exit is possible [`exit_until`] | Offer the exit |
| `deal_return_unavailable` | 409 | Return action not valid for the return's state [`status`] | Refetch deal |
| `deal_upload_invalid` (422), `deal_upload_limit` (409) | | Campaign file rules (cover/brief) | As in Direct Deals |

Validation messages specific to campaigns (arrive as 422 `errors.<field>`): `campaign_price_out_of_range`, `campaign_pricing_conflict`, `campaign_bid_range`, `campaign_budget_below_bid`, `campaign_deadline_past | _too_far | _after_cap | _not_later`, `campaign_seats_over_max`, `campaign_seats_reduce_max`, `campaign_reopen_deadline_required`, `campaign_add_seats_deadline_required`, `campaign_drop_past | _before_deadline | _gap`, `campaign_delivery_with_drop`, `campaign_deliverable_unavailable | _duplicate`, `campaign_addon_not_offered`, `campaign_too_many_items`, `campaign_cover_missing`. Show the server `message`; do not branch on these.

---

## 9. Limits and timings

| Rule | Value |
|---|---|
| Draft title | 3–120 chars |
| Public requirements text | ≤ 1000 chars |
| Private brief | 5 lists × ≤ 10 entries × ≤ 300 chars; links ≤ 10; tracking link ≤ 2048 |
| Seats per campaign | 1–20 |
| Seat price / bid | $5.00 – $50,000.00 per seat; budget ≤ seats × $50,000 |
| Platform fee | 10% (`pricing.fee_bps = 1000`), from the creator side |
| Deliverables | ≤ 20 lines per campaign; count 1–10 per line; revisions 0–3; ≤ 20 units per creator |
| Targeting niches | ≤ 5 |
| Delivery days | 1–90 (only when there is no drop) |
| Apply deadline | future, ≤ 30 days from now (draft); ≤ `published_at + 30 days` (extend) |
| Drop runway (apply deadline → `drop_at`) | ≥ 120h digital / ≥ 240h with product shipping |
| Drafts due for a drop | `drop_at − 72h` (≥ 24h after funding) |
| Live link opens | 15 min before `drop_at` |
| Drop reminders | 24h, 2h, 0 before `drop_at` |
| Drafts per brand | 20 (`draft` + `changes_requested`) |
| Live campaigns per brand | 5 (`pending_review + open + suspended`) |
| Open applications per creator | 10 (`submitted + shortlisted`) |
| Application validity | 72h from applying (shortlisting does not extend it) |
| Applicant pitch | ≤ 500 chars |
| Compare | 2–4 applicants |
| Applicants / feed / campaigns page size | 20 |
| Ghost clock | warn at 48h, suspend at 72h of an unanswered applicant; final cancel warning 24h before |
| Suspension | auto-cancels after 7 days |
| Zero applicants | brand has 7 days after the deadline; +4 days rescue once (cap-exempt) |
| Funding window after Select | 24h (`awaiting_payment`) |
| Brief exit window | 24h from `funded_at` |
| Invitations per campaign | 50; request 1–100 slugs |
| Announcements | 3 per rolling 24h per campaign; body 3–1000; link https ≤ 500 |
| Batch shipments | 1–20 rows; courier / tracking no. ≤ 100; tracking link https ≤ 500 |
| Return waybill due | 5 days after the deal closes; brand confirm-or-auto-receive 14 days after the waybill |
| Return issue | note 5–1000, ≤ 5 photos (jpg/png/webp ≤ 20 MB); waive note ≤ 500 |
| Public apply ban (severe strike) | 30 days |
| Uploads | images jpg/png/webp ≤ 20 MB; brief pdf ≤ 20 MB; brief ≤ 5 files; one cover; PUT URL valid 30 min |
| Admin review target (admin side) | 24h; admin notes 5–1000 chars |

---

## 10. Edge-case checklist
- [ ] `feature_disabled` or `active_campaigns/campaigns: null` → hide every campaign entry point.
- [ ] Any 409 `campaign_*` → message + refetch the campaign; never retry blindly.
- [ ] Money: show server `*_usd` only; creator headline = `net_usd`.
- [ ] Wizard: grey steps from `missing[]`; `delivery_days` and `drop_at` are mutually exclusive; show `drop.*` derived dates.
- [ ] After the first application only title/teaser are editable; handle `campaign_field_locked` `meta.fields`.
- [ ] Applicants: 72h countdown from `expires_at`; decisions on suspended/expired handled by 409.
- [ ] Select: `funding.funded=false` → top-up with `missing_usd`; `recruiting.prompt_close` → Close / Keep open.
- [ ] `seat_freed.options` drives the sheet; reopen asks for a date when `deadline_passed`.
- [ ] Suspended banner: Reopen (date picker only if `reopen_needs_deadline`); zero-applicants sheet from `timers.zero_applicants`.
- [ ] Creator: Apply disabled with the `eligibility` reason; `gender_required` → profile; one account per required platform; bid ≤ max.
- [ ] Linked deal: `brief_hidden` placeholder; brief-exit banner + sheet; Ship disabled until `shipping.ship_from`; Publish disabled until `drop.publish_opens_at`.
- [ ] Returns: waybill form from `return_shipment.status = awaiting_waybill`; global banner from `GET /influencer/restrictions`.
- [ ] Notifications: navigate by `deep_link`, refetch; `sada://strikes` opens the strikes screen.
