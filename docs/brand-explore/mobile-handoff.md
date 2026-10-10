# Brand Explore & Home — Mobile Handoff (backend implemented, 2026-10-10)

> For the mobile agent in `mobile/sadaa`. Backend source of truth: `docs/plans/brand-explore/backend-plan.md`.
> Do not invent fields. If something is missing here, ask.

All routes are under `/api/v1`, Bearer auth, bilingual via `Accept-Language` (`ar` default). Envelope: `{ success, message, data, meta }`.

---

## 0. Tasks, in order

1. **Types + API layer:** add the `explore` / `brand-home` / `shortlist` endpoints and `CreatorCard` type (§2–§5).
2. **Brand app:** Home screen, Explore screen with filters, shortlist ❤️ + list, 🔒 price state on cards **and** on the public Media Kit (§6).
3. **Creator app:** Media Kit stats tile `search_impressions` now returns a value (§7).
4. **Existing public Media Kit contract changed** (§6): prices become nullable. Brand app must render the lock.

---

## 1. Access rules

| Endpoint | Who | Else |
|---|---|---|
| `GET /explore/creators`, `GET /explore/filters` | brand, admin | creator → `403` |
| `GET /brand/home`, `/brand/shortlist*` | brand (phone verified) | creator/admin → `403` |

**Price lock.** A viewer sees prices only if they are a KYC-verified, active brand (or admin / the kit's owner). Otherwise every price field is `null` **from the server**. Reasons (`CapabilityBlockReasonEnum`): `kyc_required`, `kyc_pending`, `kyc_rejected`, `onboarding_incomplete`, `account_suspended`, `brand_only` (a creator viewing another creator's kit). Map the reason to the verification flow CTA.

---

## 2. `CreatorCard` (used by Explore, Home rails, Shortlist)

```ts
type CreatorCard = {
  slug: string;
  display_name: string;
  avatar_url: string | null;
  governorate: { value: string; label: string } | null;
  niches: { value: string; label: string }[];
  tier: string | null;
  tier_label: string | null;
  primary_platform: {
    platform: string; platform_label: string;
    follower_count: number; follower_count_verified: boolean;
  } | null;
  platforms: string[];                      // platform values
  badges: { kyc_verified: boolean; followers_verified: boolean; rush: boolean; on_site: boolean; new: boolean };
  fastest_delivery_days: number | null;
  price: {
    locked: boolean;
    lock_reason: string | null;             // set when locked
    from_usd: number | null;                // null when locked
    from_syp_approx: number | null;         // null when locked OR rate stale (rounded to 1,000 SYP)
    syp_rate_stale: boolean;
  };
  is_shortlisted: boolean;
};
```

Tap a card → `GET /public/creators/{slug}` → then `POST /public/creators/{slug}/views { "src": "search" }` (existing beacon; use `search` when coming from Explore/Home).
Cards never include phone, email, full name, area, KYC data or user ids.

---

## 3. `GET /explore/creators` (throttle 60/min)

Query params (arrays as `key[]=`):

| Param | Notes |
|---|---|
| `q` | 2–60 chars. Arabic-normalized; dialect/English niche words widen results (e.g. "مطاعم") |
| `governorate[]`, `platform[]`, `niche[]`, `tier[]` | values from `/explore/filters` |
| `category` | chip key from `/explore/filters` → expands to niches server-side |
| `min_followers`, `max_followers` | int; per platform when `platform[]` is set |
| `kyc_verified`, `followers_verified`, `rush`, `on_site` | bool |
| `max_delivery_days` | 1–14 |
| `price_min`, `price_max`, `within_budget` | 🔒 verified brands only |
| `sort` | `recommended` (default), `followers_desc`, `newest`, `delivery_asc`, `price_asc` 🔒, `price_desc` 🔒 |
| `per_page` | 1–30, default 20 |
| `cursor` | opaque, from `meta.next_cursor` |

Response: `data: CreatorCard[]`, `meta: { next_cursor: string|null, price_locked: boolean, price_lock_reason: string|null, applied: {...} }`.
- **No total count**, no page numbers. Infinite scroll with `next_cursor` (null = end).
- Locked viewer using a 🔒 param/sort → **`403`**, `error_code: "gated_parameter"`, `meta.reason` = lock reason. Open the verification flow; do not show an empty list.
- Without a `governorate[]` filter, `recommended` boosts the brand's own city.

## 4. `GET /explore/filters`

`data: { governorates, platforms, niches, tiers, categories, sort, delivery_buckets }`. Options are `{ value, label, requires_verification }` (categories also carry `niches[]`). Show 🔒 on options with `requires_verification: true` for locked viewers. Cached 1 h, `Vary: Accept-Language`.

## 5. `GET /brand/home` (throttle 30/min) and shortlist

```ts
type BrandHome = {
  header: {
    company_name: string | null;
    governorate: { value: string; label: string } | null;
    wallet: { available_usd: number; available_syp_approx: number | null; syp_rate_stale: boolean };
  };
  island: { type: 'kyc_rejected'|'verify_account'|'verification_pending'|'complete_profile';
            title: string; body: string; cta: { label: string; action: string } } | null;
  rails: { key: 'near_you'|'verified'|'fast_delivery'|'new'|'recently_viewed';
           title: string; items: CreatorCard[]; see_all: Record<string, unknown> | null }[];
  active_deals: null;                       // reserved (v2)
  support: { whatsapp_url: string | null };
  capabilities: { view_prices: { allowed: boolean; reason: string | null } };
};
```

- Empty rails are **omitted**; `near_you` is omitted when the brand has no governorate.
- `see_all` = Explore query params to prefill (`recently_viewed` has `null`).
- `cta.action` equals `island.type`; route: `kyc_rejected`/`verify_account`/`verification_pending` → verification flow, `complete_profile` → brand profile edit.
- Wallet hide/show is client-side only.
- Home rails are cached ~2 min server-side (IDs only); locks and ❤️ are per viewer.
- Opening Home is also what records "Near you/Verified/…" impressions — don't call it more than needed.

**Shortlist** (brand-only, open to unverified brands, max 200):

| Method | Path | Result |
|---|---|---|
| GET | `/brand/shortlist?per_page=&cursor=` | `data: CreatorCard[]` (all `is_shortlisted: true`), `meta.next_cursor`. Ineligible creators are hidden |
| PUT | `/brand/shortlist/{slug}` | `204`, idempotent. Unknown/ineligible slug → `404`. 201st → `409 shortlist_full` |
| DELETE | `/brand/shortlist/{slug}` | `204`, idempotent |

Update ❤️ optimistically; roll back on error.

---

## 6. Public Media Kit — contract change (breaking for the brand app)

`GET /public/creators/{slug}` now resolves the bearer **optionally** (never `401`).

| Field | Before | Now |
|---|---|---|
| `price_from_usd` | number | `number \| null` (null when locked) |
| `rate_cards[].price_usd` | number | `number \| null` |
| add-on prices | number | `number \| null` |
| `price_locked` | — | **new** `boolean` |
| `price_lock_reason` | — | **new** `string \| null` |

Locked kits still list what each rate card offers (service, package, delivery, revisions, add-on types). Render a 🔒 state and a "verify to see prices" CTA from `price_lock_reason`. Anonymous web visitors are always locked. The creator's own preview (`GET /influencer/media-kit`) is unaffected.
Caching: authenticated requests are `private` + `Vary: Authorization`; always re-fetch after the brand becomes verified (don't reuse a cached locked body).

## 7. Creator app — Media Kit stats

`GET /influencer/media-kit/stats` → `search_impressions` is a metric object (`value`, `previous`, `change_pct`, same shape as the other tiles) instead of `null`, **when the backend switch `MEDIA_KIT_FEATURE_SEARCH` is on**. Render the tile when non-null; keep hiding it when `null`. Counted once per brand per creator per day.

---

## 8. Checklist

- [ ] `CreatorCard` + `BrandHome` types; cursor infinite scroll (no total).
- [ ] 🔒 on price chips/sorts from `requires_verification`; handle `403 gated_parameter` → verification flow.
- [ ] Media Kit screen: nullable prices + `price_locked` state.
- [ ] Shortlist ❤️ (optimistic), shortlist screen, `409 shortlist_full` message.
- [ ] Home: island → CTA routing, rails, hide empty, WhatsApp support link (hide if null).
- [ ] `POST …/views { src: "search" }` on card tap.
- [ ] Creator stats tile for `search_impressions`.
