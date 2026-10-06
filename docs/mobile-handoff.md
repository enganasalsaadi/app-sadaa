# Media Kit — Mobile Handoff (backend LOCKED + implemented, 2026-10-06)

> For the mobile Claude Code agent working in `mobile/sadaa`.
> The backend for **§17 Media Kit** is live. Several decisions differ from the mobile proposal of 2026-10-05.
> **The backend is the source of truth.** Update the mobile docs first, then build against the locked contract in the Appendix.

---

## 0. Your tasks, in order

1. **Sync the contract.** In `docs/mobile-contract.md`, replace the whole section `## 17. Media Kit — PROPOSED (2026-10-05, needs backend sign-off)` (through the end of §17.8 "Open for backend") with the **Appendix** at the bottom of this file, verbatim. In the doc's status/header line, mark §17 as LOCKED.
2. **Fix `docs/design/creator-home-plan.md`.** It conflicts with the locked contract in the places listed in §2 below.
3. **Update types and the API layer** (§3): the `identity` domain, tags `MediaKit` and `MediaKitStats`.
4. **Build the screens** using the plan's build order, applying the behavior rules in §4 and the checklist in Appendix §17.10.
5. **Report back to the backend owner** the app identifiers listed in §5. Universal links won't verify without them.

Do not invent fields. If something you need is missing from the Appendix, ask. Don't guess.

---

## 1. What changed vs the proposal (breaking for any code written against it)

| Area | Proposal (mobile docs today) | Locked (backend) | Mobile impact |
|---|---|---|---|
| Counting views | `GET /public/creators/{slug}?src=` counts a view | GET is **read-only**. New `POST /public/creators/{slug}/views` `{ src }` → 202 | Fire the beacon once when the public-profile screen opens |
| Old slug | 301 redirect | API: **200** with canonical body + `meta.canonical_slug` (only the web page 301s) | If `meta.canonical_slug` is present, replace the stored slug and cache key |
| Slug cooldown | 429 `too_many_requests` + `meta.retry_after` | **409 `slug_change_cooldown`**, `meta.retry_after` (s) + `meta.available_at` (ISO) | Show "available on {date}". It is not a rate limit |
| Slug invalid/taken | 422 `errors.slug` | `error_code: slug_unavailable`, **422** (`meta.reason`: `invalid_length` \| `invalid_format` \| `reserved`) or **409** (`reason: taken`) | Map `meta.reason` to a localized field error |
| Slug availability | — | **New** `GET /influencer/media-kit/slug-check?slug=` → `{ available, reason }` | Debounced live check (~400 ms) in Settings |
| Revert slug | — | Returning to your own previous slug (≤ 30 days) is allowed even during the cooldown | Don't hard-block the field if the user types the previous slug |
| Share channels | `copy \| share_sheet`, 200 `null` | `whatsapp \| telegram \| copy_link \| other`, **201** first / **200** retry, body `{ channel, occurred_at }` | Clipboard → `copy_link`. Share sheet → `whatsapp` / `telegram` if the OS reports the target, else `other` |
| Share while private | — | **409 `media_kit_private`** | Prompt "Make public" |
| Idempotency key | Optional semantics | `X-Idempotency-Key` **required**, must be a UUID (else 422) | New UUID per tap, the same UUID on retry |
| Tier | `influencer_tier` | `tier` + `tier_label` (localized) | Rename |
| Location | `governorate`, `governorate_label` | **Removed** (never returned) | Drop "city" from the Media Kit card |
| Niches | `{ id, label }[]` | `string[]` keys, same keys as the profile | Label with the existing profile niche lookup |
| Platforms | `is_available`, `follower_count: number \| null`, `profile_url: string` | No `is_available`. Adds `display_name`, `follower_count_verified`, `follower_tier_label`. `follower_count: number`, `profile_url: string \| null` | Show ✓ next to the count only when `follower_count_verified` |
| Own kit | — | Adds `id`, `created_at` | — |
| Kit creation | Lazy on first read | Created when onboarding completes (lazy is a backfill only) | `GET /influencer/media-kit` always returns a kit for an onboarded influencer |
| Stats range | Ends today 00:00 | Ends **now** (today counts) | — |
| Stats nulls | Every metric nullable | `profile_views`, `unique_brand_views`, `link_opens`, `shares` are **always objects**. Only `search_impressions` and `offers_from_profile` are `null` (not live) | Hide the tile only when the metric is `null` |
| Sparkline | — | `profile_views.series[{ date, value }]`, one point per Damascus day, zeros included | Optional sparkline on Insights |
| Stats freshness | ≤ 1 h stale | Cached ≤ 10 min. A share refreshes it immediately | Invalidate `MediaKitStats` after a successful share |
| Web domain | `<WEB_DOMAIN>` TBD | `public_url` is already absolute on the public web host | Always share `public_url` + `?src=link`. Never build the URL client-side |

---

## 2. Required edits to `docs/design/creator-home-plan.md`

- **Decisions table, Stats row:** `search_impressions` and `offers_from_profile` return `null` for now, so those tiles are hidden. The Home card's 4 tiles (views, brands, link opens, offers) therefore show **3** until offers ship.
- **Section 3, Media Kit card:** remove "city" (there's no location field). Niches come from `niches` keys plus the local labels. Tier comes from `tier_label`.
- **Media Kit Settings:** "422 → field, 429 → countdown" becomes "`slug_unavailable` 422/409 → field error by `meta.reason`; `slug_change_cooldown` 409 → 'available on `meta.available_at`'; 429 = real rate limit (10 PATCH/h) → generic toast". Add the live slug-check. Disable the field while `can_change_slug_at` is in the future, unless the user is reverting to the previous slug.
- **Ownership, share hook:** channel mapping per §1. Invalidate `MediaKitStats` on 200/201.
- **Ownership, deep link:** route `MediaKitPublic { slug }` must also call the views beacon with `src: 'link'` (or `'app'` when opened in-app, `'search'` from search results).

---

## 3. API layer & types

Response envelope (unchanged, for reference):
- success: `{ success: true, message, data, meta: { locale, ...extra } }`.
- error: `{ success: false, message, error_code, errors, meta: { locale, ...extra } }`.

Error `meta` extras live at the top-level `meta` (`meta.reason`, `meta.retry_after`, `meta.available_at`). `meta.canonical_slug` on a success response lives there too. Send `Accept-Language`, since every label (`tier_label`, `platform_label`, `brand_locations[].label`) is localized server-side.

Endpoints (all under `/api/v1`):

| Method | Path | Auth | Tag | Notes |
|---|---|---|---|---|
| GET | `/influencer/media-kit` | influencer | `MediaKit` | Own kit + `preview` |
| PATCH | `/influencer/media-kit` | influencer | invalidates `MediaKit` | `{ slug?, is_public? }`, 10/h |
| GET | `/influencer/media-kit/slug-check?slug=` | influencer | — (don't cache) | 30/min |
| GET | `/influencer/media-kit/stats?period=7d\|30d\|90d` | influencer | `MediaKitStats` | default `30d` |
| POST | `/influencer/media-kit/share` | influencer + `X-Idempotency-Key` | invalidates `MediaKitStats` | 30/h |
| GET | `/public/creators/{slug}` | none (bearer optional) | `PublicMediaKit:{slug}` | ETag, 60/min/IP |
| POST | `/public/creators/{slug}/views` | none (bearer optional) | — | `{ src }` → 202, 30/min/IP |

The TS types are in Appendix §17.9. Replace the proposal's §17.7 types entirely.

---

## 4. Behavior rules (don't skip)

- **Views beacon:** fire-and-forget, once per screen open (not per render), and never awaited by the UI. Ignore every error, including 404 and 429. Include the bearer token when logged in, so brand views count toward `unique_brand_views`. The backend dedups the same viewer for 30 min and ignores the creator's own views. "Preview as brand" renders `GET /influencer/media-kit` → `preview`, so it needs no public GET and no beacon.
- **Deep links:** parse `https://<host>/c/{slug}` into `{ slug }` and validate it against `^[a-z0-9][a-z0-9._]*[a-z0-9]$`, 3–30 chars, case-insensitive (lowercase it first). Invalid → fall back to Home. Never navigate to a raw path. Allow-list the route (rule 07).
- **404 on public GET** (unknown, private, suspended or deleted creator) → "Profile not available" empty state. Never distinguish between these cases.
- **Share flow:** generate the UUID before opening the sheet. POST only after the user completes the share (or immediately on copy). On a network error, retry with the **same** UUID.
- **Private kit:** Home shows the notice + "Make public" (PATCH `{ is_public: true }`). The share CTA catches 409 `media_kit_private` and shows the same prompt.
- **Stats tiles:** `null` metric → hide. `change_pct: null` → "new" with no arrow. `brand_locations: []` → hide the chart. `share_pct` already sums to 100, so don't re-normalize.
- **Account deletion:** no client change. The backend now hides the kit and releases its slug after 30 days automatically.

---

## 5. Send these to the backend owner (needed for universal links + the web page's app buttons)

- iOS: Team ID, bundle IDs (prod + dev), App Store ID.
- Android: package name, SHA-256 signing fingerprints (debug + release + Play App Signing).
- The custom URL scheme (used by the web page's "Open in app" button, `scheme://c/{slug}`).

App config:
- iOS associated domain `applinks:<PUBLIC_WEB_HOST>`. Add `?mode=developer` while testing on a tunnel.
- Android intent filter with `android:autoVerify="true"` for `https://<PUBLIC_WEB_HOST>/c/*`.
- Use a **stable** tunnel hostname (a named Cloudflare Tunnel), not rotating ngrok URLs. The host is whatever `public_url` returns.

---

## Appendix — Locked contract (paste verbatim as §17 of `docs/mobile-contract.md`)

## 17. Media Kit — LOCKED (2026-10-06, implemented)

The creator's public profile: what brands see, shared as a link, with view stats on the creator Home.
Backend plan: `api/docs/plans/media-kit/backend-plan.md` (§2 lists every change from the mobile proposal, C1–C10).

Guards for `/influencer/media-kit*`: `auth` + `account.active` + `phone.verified` + `user.type:influencer` (same 403s as §5.3). Public routes (§17.4, §17.5) need no auth; a bearer token is optional and never fails the request.

**Changes from the 2026-10-05 proposal (mobile must follow these):**
| # | Proposal | Final |
|---|---|---|
| C1 | `GET /public/creators/{slug}` counts a view | GET is **read-only**. Count with `POST /public/creators/{slug}/views { src }` (§17.5) when the screen opens |
| C2 | Old slug → 301 | API returns **200** with the canonical body + `meta.canonical_slug`. Only the web page 301s |
| C3 | Cooldown → 429 | **409 `slug_change_cooldown`** + `meta.retry_after` (seconds) + `meta.available_at` |
| C4 | Range ends today 00:00 | Range ends **now** (today counts) |
| C5 | `src=search` feeds `search_impressions` | Server-side only; `search_impressions` is `null` until search ships |
| C6 | Kit created lazily | Created when onboarding completes; lazy creation is only a backfill |
| C7 | — | **New** `GET /influencer/media-kit/slug-check` |
| C8 | — | Going back to your own previous slug (within 30 days) is allowed even during the cooldown |
| C9 | — | `platforms[].follower_count_verified` |
| C10 | — | Share while private → **409 `media_kit_private`** |
| — | Share channels `copy \| share_sheet`, 200 `null` | Channels `whatsapp \| telegram \| copy_link \| other`; 201 first time / 200 on retry, body `{ channel, occurred_at }` |
| — | `influencer_tier`, `governorate`, niches as `{id,label}` | `tier` + `tier_label`; no `governorate`; `niches` = string keys (same as profile) |

### 17.1 `GET /influencer/media-kit` — own media kit
```json
{
  "id": "01J…", "slug": "anas", "public_url": "https://<PUBLIC_WEB_URL>/c/anas", "is_public": true,
  "slug_changed_at": null, "can_change_slug_at": null,
  "created_at": "2026-10-05T09:00:00+00:00", "updated_at": "2026-10-05T09:00:00+00:00",
  "preview": PublicMediaKit
}
```
- `preview` is exactly what §17.4 returns to the public ("Preview as brand"). One shape.
- `can_change_slug_at`: `null` = can change now; otherwise ISO time when the cooldown ends. Use it to disable the slug field in advance.
- `public_url` is on the public web host (`PUBLIC_WEB_URL`), not the API host. Share this URL + `?src=link`.

### 17.2 `PATCH /influencer/media-kit` — partial
Body `{ "slug"?: "anas.style", "is_public"?: false }` → 200 same shape as §17.1. Throttle 10/h → 429.
- Slug is lowercased. Rules: 3–30 chars, `^[a-z0-9][a-z0-9._]*[a-z0-9]$`, no `..`, not ULID-shaped, not reserved (`admin`, `api`, `app`, `c`, `help`, `support`, `www`, `login`, `brand`, `influencer`, …, and anything starting with `sada`), not taken.

| Error | Status | `meta` |
|---|---|---|
| `slug_unavailable` (invalid length / format / reserved) | 422 | `reason`: `invalid_length` \| `invalid_format` \| `reserved` |
| `slug_unavailable` (taken, incl. held by someone for 30 days) | 409 | `reason`: `taken` |
| `slug_change_cooldown` (1 change per 30 days) | 409 | `retry_after` (seconds), `available_at` (ISO) |

- After a change the old slug keeps resolving to you for 30 days (API: 200 + `canonical_slug`; web: 301), and nobody else can claim it.
- `is_public=false`: every public route returns 404 `not_found` (never reveals the creator exists). Shares → 409 `media_kit_private`.

### 17.3 `GET /influencer/media-kit/slug-check?slug=` — live availability
→ 200 `{ "available": true, "reason": null }` or `{ "available": false, "reason": "taken" }`. Reasons as in §17.2. Your own current/held slug counts as available. Throttle 30/min → 429. Debounce input (~400 ms).

### 17.4 Public — `GET /public/creators/{slug}` (no auth; bearer optional)
```json
{
  "slug": "anas", "display_name": "Anas Style", "avatar_url": "https://…",
  "tier": "MICRO", "tier_label": "مايكرو", "is_verified": true,
  "niches": ["fashion", "beauty"],
  "platforms": [ { "platform": "instagram", "platform_label": "إنستغرام", "username": "anas",
                   "profile_url": "https://instagram.com/anas", "display_name": "Anas Style",
                   "follower_count": 45210, "follower_count_verified": true,
                   "follower_tier": "MICRO", "follower_tier_label": "مايكرو", "is_primary": true } ],
  "rate_cards": [ { "platform": "instagram", "service_type": "reels", "price_usd": 50.0 } ],
  "price_from_usd": 30.0,
  "bio": null, "top_portfolio_items": [], "offers_from_profile": null
}
```
- **Read-only** — opening it does not count a view (call §17.5).
- `display_name` = primary platform `display_name`, else the user's name. `avatar_url` `null` → show initials.
- `is_verified` = KYC verified. `platforms` exclude `rejected`, primary first then followers desc. `follower_count_verified` = auto-verified or admin-approved (self-declared counts are `false`).
- `rate_cards` only for available, non-rejected platforms; `price_from_usd` = their min or `null`. `bio` `null` until AI bio ships.
- **Never returned:** phone, email, `full_name`, `area`, KYC data, `rejection_reason`, user `id`.
- Old slug (≤ 30 days) → **200** with the new `slug` in the body + `meta.canonical_slug`. Replace the stored slug if `meta.canonical_slug` is present.
- Unknown / private / suspended / deleted → 404 `not_found`. Rate limit 60/min per IP. `ETag` + `Cache-Control: public, max-age=60` (`If-None-Match` → 304).

### 17.5 `POST /public/creators/{slug}/views` — count a view
Body `{ "src": "app" | "link" | "search" | "web" }` → 202 `null`. Send once when the creator screen opens, with the bearer token if logged in.
- Not counted (still 202): the creator's own views, admins, bots / empty user agents, and repeats by the same viewer within 30 min.
- A logged-in brand also counts toward `unique_brand_views` (once per day).
- Unknown / hidden slug → 404. Invalid `src` → 422. Rate limit 30/min per IP.

### 17.6 `POST /influencer/media-kit/share`
Body `{ "channel": "whatsapp" | "telegram" | "copy_link" | "other" }`, header **`X-Idempotency-Key: <uuid per tap>`** (required, UUID → else 422).
- 201 `{ "channel": "whatsapp", "occurred_at": "…" }` first time; **200** same body on a retry with the same key (counted once).
- Kit private → 409 `media_kit_private`. Rate limit 30/h per user → 429. Bumps the stats cache, so the Home tile updates immediately.

### 17.7 `GET /influencer/media-kit/stats?period=7d|30d|90d` (default `30d`)
```json
{
  "period": "30d",
  "range": { "from": "2026-09-07T00:00:00+03:00", "to": "2026-10-06T11:40:00+03:00" },
  "generated_at": "2026-10-06T08:40:00Z",
  "profile_views":      { "value": 1240, "previous": 1107, "change_pct": 12.0,
                          "series": [ { "date": "2026-09-07", "value": 31 } ] },
  "unique_brand_views": { "value": 38, "previous": 30, "change_pct": 26.7 },
  "link_opens":         { "value": 96, "previous": 0,  "change_pct": null },
  "shares":             { "value": 14, "previous": 9,  "change_pct": 55.6 },
  "search_impressions": null,
  "offers_from_profile": null,
  "top_portfolio_items": [],
  "brand_locations": [
    { "key": "damascus", "label": "دمشق", "count": 21, "share_pct": 55.3 },
    { "key": "other",    "label": "أخرى", "count": 8,  "share_pct": 21.0 }
  ]
}
```
- Range: from start of day (today − N + 1) **to now**, in `Asia/Damascus`. Previous period = same length shifted back.
- `change_pct` = `null` when `previous = 0`, 1 decimal. A metric that is **`null`** = feature not live → hide the tile (not 0).
- `profile_views.series`: one point per Damascus day in the range (zeros included) — for a sparkline.
- `brand_locations`: by brand governorate, top 5 + `other`, count desc, `share_pct` sums to 100. Buckets with < 3 brands merge into `other`; `[]` when `unique_brand_views < 3`. Brand identities are never returned.
- Cached up to 10 min (`generated_at` = when computed); a share refreshes it. Invalid `period` → 422.

### 17.8 Web page & universal links
- `https://<PUBLIC_WEB_URL>/c/{slug}` — server-rendered page from the same data as §17.4: OpenGraph/Twitter tags (avatar, name, tier) for link previews, Arabic RTL by default (`?lang=en` or an English browser → English), `noindex`.
- The page counts its own view via JS (`src` from `?src=`; anything other than `link|search|web` → `web`), so link-preview bots never count.
- Old slug / different case → **301** to the canonical URL (query kept). Hidden / unknown → friendly 404 page.
- App links: `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` match `/c/*`. Values come from backend env — **mobile must send us:** iOS Team ID + bundle IDs, App Store ID, Android package + SHA-256 signing fingerprints (debug + release), and the custom URL scheme (for the page's "Open in app" button).
- App setup: iOS associated domain `applinks:<host>` (`?mode=developer` while on a tunnel); Android `autoVerify` intent filter for `https://<host>/c/*`. Use a **stable** tunnel hostname (named Cloudflare Tunnel), not rotating ngrok URLs.
- App parses `/c/{slug}` into a typed route `{ slug }` (validate with the §17.2 regex, case-insensitive) — never navigate to a raw path. Then `GET` §17.4 + `POST` §17.5 with `src=link`.

### 17.9 TS types
```ts
type StatMetric = { value: number; previous: number; change_pct: number | null };
type StatsPeriod = '7d' | '30d' | '90d';
type ViewSource = 'app' | 'link' | 'search' | 'web';
type ShareChannel = 'whatsapp' | 'telegram' | 'copy_link' | 'other';
type SlugReason = 'invalid_length' | 'invalid_format' | 'reserved' | 'taken';
interface PublicMediaKit {
  slug: string; display_name: string | null; avatar_url: string | null;
  tier: FollowerTier | null; tier_label: string | null; is_verified: boolean;
  niches: string[];
  platforms: { platform: Platform; platform_label: string; username: string; profile_url: string | null;
               display_name: string | null; follower_count: number; follower_count_verified: boolean;
               follower_tier: FollowerTier | null; follower_tier_label: string | null; is_primary: boolean }[];
  rate_cards: { platform: Platform; service_type: ServiceType; price_usd: number }[];
  price_from_usd: number | null;
  bio: null; top_portfolio_items: []; offers_from_profile: null;
}
interface MediaKit {
  id: string; slug: string; public_url: string; is_public: boolean;
  slug_changed_at: string | null; can_change_slug_at: string | null;
  created_at: string; updated_at: string;
  preview: PublicMediaKit;
}
interface SlugCheck { available: boolean; reason: SlugReason | null }
interface MediaKitStats {
  period: StatsPeriod; range: { from: string; to: string }; generated_at: string;
  profile_views: StatMetric & { series: { date: string; value: number }[] };
  unique_brand_views: StatMetric; link_opens: StatMetric; shares: StatMetric;
  search_impressions: StatMetric | null; offers_from_profile: StatMetric | null;
  top_portfolio_items: { id: string; title: string; thumbnail_url: string; clicks: number }[];
  brand_locations: { key: string; label: string; count: number; share_pct: number }[];
}
```

### 17.10 Media Kit edge-case checklist
- [ ] **Slug field**: debounce slug-check; on PATCH 409 `slug_change_cooldown` show `meta.available_at`; disable the field while `can_change_slug_at` is in the future (except reverting to the previous slug).
- [ ] **409 `slug_unavailable` / `taken`** after a green slug-check (race) → show the error, re-check.
- [ ] **Deep link with an old slug** → GET returns `meta.canonical_slug`; use it for the share sheet and cache keys.
- [ ] **Share**: new UUID per tap, same UUID on retry; private kit → 409 → prompt "make public".
- [ ] **View beacon**: fire-and-forget, never block the UI, ignore errors; don't re-send on re-render (backend dedups 30 min anyway).
- [ ] **Stats tiles**: `null` metric → hide; `change_pct: null` → show "new" / no arrow; `brand_locations: []` → hide the chart.
