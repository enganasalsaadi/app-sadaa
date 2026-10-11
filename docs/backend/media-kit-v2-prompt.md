You are working on the Sada backend (B2B influencer marketplace, escrow wallet, Syria-first, Arabic-first). The mobile app has rebuilt the creator's public media kit as a pitch page. Brands see it from Home, Explore, the Shortlist and shared `/c/{slug}` links; creators see the same page as "Preview as brand". The new page shows:
- a cover, a big photo, bio and city
- headline numbers
- audience
- brands the creator worked with
- past work
- services by platform

Today `GET /public/creators/{slug}` (contract §17.4) does not return most of this, so the app hides those sections. Please add the fields below. These are additive changes only: nothing existing may change shape or meaning. The app already ships with every new field optional, so you can deploy them one at a time.

## Conventions (keep them)
- Envelope `{ success, message, data, error_code, errors, meta }`.
- Every `*_label` is localized from `Accept-Language` (ar | en).
- Percentages are numbers from 0 to 100 with at most 1 decimal (`5.2` means 5.2%). Counts are integers. Never send formatted strings for numbers.
- A metric you cannot compute yet is `null` (the app hides it). Never send `0` as a stand-in.
- Dates are ISO 8601. "Last 30 days" uses Asia/Damascus.
- The same fields must appear in the `preview` object of `GET /influencer/media-kit` (§17.1), because that preview is by definition the §17.4 shape.

## 1. New fields on `GET /public/creators/{slug}` (and §17.1 `preview`)

```json
{
  "cover_url": "https://… | null",
  "bio": "صانعة محتوى طعام ولايف ستايل من دمشق… | null",
  "city": { "key": "damascus", "label": "دمشق" } | null,
  "public_url": "https://<PUBLIC_WEB_URL>/c/anas",
  "is_shortlisted": true | false | null,

  "highlights": {
    "engagement_rate_pct": 5.2 | null,
    "avg_views": 48000 | null,
    "local_audience_pct": 78.0 | null,
    "completed_campaigns": 12
  } | null,

  "audience": {
    "cities": [ { "key": "damascus", "label": "دمشق", "share_pct": 45.0 },
                { "key": "aleppo",   "label": "حلب",  "share_pct": 30.0 },
                { "key": "other",    "label": "أخرى", "share_pct": 25.0 } ],
    "gender": { "female_pct": 65.0, "male_pct": 35.0 } | null,
    "age_ranges": [ { "key": "18-24", "label": "18–24", "share_pct": 42.0 },
                    { "key": "25-34", "label": "25–34", "share_pct": 35.0 } ],
    "source_label": "من إحصاءات إنستغرام · آخر تحديث 9 تشرين الأول",
    "updated_at": "2026-10-09T08:00:00Z"
  } | null,

  "top_portfolio_items": [
    { "id": "01J…", "title": "إطلاق قهوة الصباح | null", "thumbnail_url": "https://…",
      "platform": "instagram | null", "views": 120000 | null, "brand_name": "Brand X | null" }
  ],

  "worked_with": {
    "total_brands": 7,
    "items": [
      { "id": "01J…", "name": "Zara Home", "logo_url": "https://… | null",
        "is_verified": true, "completed_campaigns": 2 }
    ]
  } | null
}
```

### Field rules
- **`cover_url`**: the creator's banner. `null` when there is none (the app then blurs the avatar). The creator needs a way to set it:
  - `POST /influencer/media-kit/cover`, multipart image, JPEG/PNG/WebP up to 5 MB; store a 1500×600 crop. It returns the §17.1 media kit.
  - `DELETE /influencer/media-kit/cover`.
  - The app will build the upload UI once these exist. Also use the cover as the OpenGraph image of the `/c/{slug}` web page.
- **`bio`**: already reserved (always `null` today).
  - Let the creator edit it with `PATCH /influencer/profile { "bio": "…" }`: max 300 characters, trimmed, no links or phone numbers (422 `bio_invalid`).
  - `null` when empty. The AI bio can fill it later.
- **`city`**: the creator's governorate from their profile, as a lookup key + label. Never return `area` or anything finer (§17.4 privacy list stays as is).
- **`public_url`**: the same absolute link as §17.1 `public_url`, so a brand can share a creator's profile. The app adds `?src=link` itself.
- **`is_shortlisted`**: present only when the bearer is a brand. It says whether this creator is in that brand's shortlist. `null` for guests, creators and admins.
- **`highlights`**: `null` until at least one value is known.
  - `engagement_rate_pct`: average interactions per post (likes + comments + shares + saves) over the creator's posts from the last 30 days on connected platforms, divided by followers × 100. Weight it by platform followers when there are several. `null` when fewer than 5 posts or no API-connected platform.
  - `avg_views`: average views (video plays / reach for reels and videos) per post over the last 30 days, all connected platforms. `null` under 5 posts.
  - `local_audience_pct`: share of the audience whose country is Syria (from platform audience insights). `null` when insights are unavailable.
  - `completed_campaigns`: number of the creator's deals in status `completed`. It is always a number (0 is fine here, and the app hides 0).
- **`audience`**: from Meta (and other) audience insights of the connected platforms, merged with weights by followers. `null` when no insights.
  - `cities`: top 4 + `other`, `share_pct` desc. Use cities in Syria plus the main diaspora cities (Istanbul, Dubai, Berlin…) as reported. The list sums to 100.
  - `gender`: `female_pct + male_pct = 100` (drop "unknown" and renormalise). `null` if not reported.
  - `age_ranges`: platform buckets in age order, summing to 100.
  - `source_label`: localized line naming the source and the last update date (shown as-is).
  - Refresh daily at most. Keep `updated_at`.
- **`top_portfolio_items`**: already reserved as `[]`. Fill it with the creator's featured posts: pinned or AI-picked, max 10, newest first.
  - `thumbnail_url` is required, 4:5 or square, at least 400 px wide.
  - `brand_name` is set only when the post was made for a Sada deal or the creator tagged the brand.
  - `views` is `null` when unknown.
- **`worked_with`**: brands with **at least one deal in status `completed`** with this creator inside Sada. It is social proof backed by escrow.
  - Order by most recent completed deal. Return at most 12 `items`.
  - `total_brands` counts all such brands, including those not in `items`.
  - Privacy: add a brand setting **"Show my brand on creators' profiles"** (default on, in the brand's account settings; give the app the field name and endpoint). Brands that turn it off are left out of `items` but still counted in `total_brands`.
  - Never return deal amounts, dates or brand contact data.
  - `id` is the brand's public id (no internal numeric id). `logo_url` is the brand avatar/logo or `null`. `is_verified` is the brand's company verification.
  - `null` when there are none.

### Caching (important)
§17.4 currently sends `Cache-Control: public, max-age=60` + `ETag`. `is_shortlisted` depends on the viewer, and so do the existing `price_locked` and prices. Make sure:
- any response built with a bearer token is `Cache-Control: private` (or `Vary: Authorization`);
- a shared cache never serves one brand's `is_shortlisted` to another.

## 2. Shortlist: optional picked services (phase 2, not blocking)
On the kit, a brand can pick services ("Add") and sees an estimated total. Until direct offers ship, the main button saves the creator to the shortlist with `PUT /brand/shortlist/{slug}` (unchanged).

If it is cheap to add, accept an optional body `{ "slot_keys": ["instagram:reel:30", …] }` on that PUT. Validate each key against the creator's current rate cards, ignore unknown keys, and return them as `picked_slot_keys` on the shortlist row. If you do this, tell the app and it will start sending it. If not, skip it; nothing breaks.

## 3. Direct offers (tell us the plan)
The bottom bar is built to become "Send direct offer" with the picked services. Please share:
- the planned endpoint and body: creator slug, slot keys, add-ons, brief, budget;
- the server-priced quote endpoint (the app never totals money itself);
- the timeline.

No implementation is required in this change.

## 4. Deliverables (send these back to the mobile team)
1. Deployed to staging, with the base URL and the date.
2. `docs/mobile-contract.md` §17.1 / §17.4 updated with:
   - the final JSON above (as implemented);
   - nullability per field;
   - the rules for every computed number (formula, window, minimum sample);
   - the caching change;
   - the new cover endpoints, the bio PATCH and its 422 codes;
   - the brand privacy setting (field name + endpoint).
3. A short handoff note in the same style as `docs/mobile-handoff.md`:
   - a decisions table (anything you changed from this request and why);
   - one real example response for a creator with everything filled and one with nothing filled;
   - which fields are live now and which are still `null` / `[]` on staging.
4. Tests for:
   - every computed metric, including the "fewer than 5 posts → null" cases;
   - `worked_with` privacy (an opted-out brand is counted but not listed);
   - `is_shortlisted` per viewer (brand / guest / creator);
   - the cache headers per viewer.
