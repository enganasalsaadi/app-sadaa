# Media Kit v2 (Pitch Page): Mobile Handoff (backend implemented, 2026-10-11)

> For the mobile Claude Code agent working in `mobile/sadaa`.
> Answers `media-kit-v2-prompt.md`. All changes are **additive**: no existing field changed shape or meaning.
> **The backend is the source of truth.** The locked contract is `api/docs/plans/profile-account/mobile-contract.md`: §8.1 (bio), §8.3 (brand settings), §17.1 / §17.4 / §17.9 / §17.10, and the new **§17.11**.

**Staging:** base URL `<STAGING_API_URL>/api/v1`, deployed `<DATE>`. The backend owner fills these in on deploy.

---

## 0. Your tasks, in order

1. **Sync the contract.** Copy §8.1, §8.3, §17.4, §17.9, §17.10 and §17.11 from the backend contract into `docs/mobile-contract.md`.
2. **Update types** to the §17.9 `PublicMediaKit` interface (adds `MediaKitHighlights`, `MediaKitAudience`, `MediaKitPortfolioItem`, `MediaKitWorkedWith`, `BrandSettings`).
3. **Build:**
   - cover upload/remove (creator media kit settings);
   - bio editor (profile edit);
   - city and shortlist heart on the pitch page;
   - "Show my brand on creators' profiles" toggle (brand account settings).
4. **Keep the stubbed sections hidden** (`highlights`, `audience`, `worked_with`, `top_portfolio_items`). Leave the code paths in place so they light up without an app release when the data arrives.

Do not invent fields. If something is missing, ask.

---

## 1. Decisions (what changed vs your request, and why)

| # | Request | Decision | Why |
|---|---|---|---|
| D1 | `highlights` computed from connected-platform insights + deals | **Always `null` for now.** Shape and formulas are locked in §17.11 | We only read public profile data (follower counts). There's no OAuth/insights provider, and no Deals domain yet. Sending `0`s would break your "never 0 as a stand-in" rule |
| D2 | `audience` from Meta insights | **Always `null` for now** | Same: no insights provider |
| D3 | `worked_with` from completed deals | **Always `null` for now** | No Deals domain yet. The privacy rule is locked: opted-out brands are counted in `total_brands` but not listed |
| D4 | Brand privacy setting | **Built now:** `GET`/`PATCH /brand/settings` `{ show_on_creator_profiles }`, default `true` | So brands can opt out before their first deal is ever shown. No visible effect until D3 goes live |
| D5 | `top_portfolio_items` | **Stays `[]`.** Item shape locked in §17.9 | Portfolio is its own milestone |
| D6 | Bio: "no links or phone numbers" | Stricter. Also rejects emails, `@handles`, bare / obfuscated domains (`insta . com`, `wa(dot)me`, `shop نقطة com`) and any **7+ digit run**, including Arabic-Indic / Persian digits and digits split by spaces or dashes | Bios are public. Deals must stay inside escrow, so the bio can't become a contact channel |
| D7 | Cover 1500×600 | As requested. Server center-crops to 1500×600 WebP. Upload ≤ 5 MB, ≤ 6000×6000 px. 10 uploads/h | Same pipeline as the avatar. The URL changes per upload, so it's safe to cache by URL |
| D8 | Cover as OG image | Done. `/c/{slug}` uses the cover, falling back to the avatar | n/a |
| D9 | `is_shortlisted` | Brand bearer → `true`/`false`. Everyone else (guest, creator, owner, admin) → `null` | `null` = "not applicable". Hide the heart, don't render it unfilled |
| D10 | Caching | Already viewer-aware, now covered by tests. Guest → `public, max-age=60`. Any bearer → `private` + `Vary: Authorization`. The ETag changes when shortlist state changes | Prices were already per-viewer |
| D11 | Shortlist `slot_keys` (phase 2) | **Skipped.** `PUT /brand/shortlist/{slug}` is unchanged | Not blocking. It will come with direct offers (§4) |
| D12 | `city` | Returned again as `{ key, label }` (governorate). v1 had removed location | You asked for it. `area` is still never returned |
| D13 | Account deletion | Cover file deleted, bio cleared | Bios are public free text |

---

## 2. Live vs stubbed (staging)

| Field | Status |
|---|---|
| `cover_url` | **Live** (`null` until the creator uploads) |
| `bio` | **Live** (`null` until the creator writes one) |
| `city` | **Live** (`null` only if the creator has no governorate) |
| `public_url` | **Live** |
| `is_shortlisted` | **Live** |
| `highlights` | Stub: always `null` |
| `audience` | Stub: always `null` |
| `worked_with` | Stub: always `null` |
| `top_portfolio_items` | Stub: always `[]` |
| `GET`/`PATCH /brand/settings` | **Live** |
| `POST`/`DELETE /influencer/media-kit/cover` | **Live** |
| `PATCH /influencer/profile { bio }` | **Live** |

---

## 3. Example responses (from a local run, `Accept-Language: ar`; `contract_terms` / rate-card details trimmed)

### 3.1 Everything that can be filled today (viewer = a not-yet-KYC'd brand that shortlisted the creator)
```json
{
  "slug": "rama.food",
  "display_name": "Rama Food",
  "avatar_url": "https://api.dicebear.com/9.x/initials/png?seed=Rama+Food",
  "cover_url": "https://<host>/storage/covers/01M4MCBKEWZVYGKKF46WCFR8XH/01JC….webp",
  "bio": "صانعة محتوى طعام ولايف ستايل من دمشق",
  "city": { "key": "damascus", "label": "دمشق" },
  "public_url": "https://<PUBLIC_WEB_URL>/c/rama.food",
  "is_shortlisted": true,
  "tier": "MACRO", "tier_label": "ماكرو (Macro)",
  "is_verified": true,
  "niches": ["food_cooking"],
  "platforms": [ { "platform": "instagram", "platform_label": "إنستغرام", "username": "rama.food",
                   "profile_url": "https://instagram.com/rama.food", "display_name": "Rama Food",
                   "follower_count": 48200, "follower_count_verified": true,
                   "follower_tier": "MACRO", "follower_tier_label": "ماكرو (Macro)", "is_primary": true } ],
  "rate_cards": [ { "id": "01M4…", "slot_key": "instagram:reel:30", "platform": "instagram",
                    "service": { "key": "reel", "label": "ريلز" }, "price_usd": null, "…": "…" } ],
  "price_from_usd": null, "price_locked": true, "price_lock_reason": "kyc_required",
  "contract_terms": { "version": "v1", "items": [ "…" ] },
  "highlights": null,
  "audience": null,
  "worked_with": null,
  "top_portfolio_items": [],
  "offers_from_profile": null
}
```
(Prices are masked here because that brand isn't KYC-verified. A verified brand gets `price_usd` and `price_from_usd`.)

### 3.2 Nothing filled (new creator, guest viewer)
```json
{
  "slug": "new.creator",
  "display_name": "Rama Food",
  "avatar_url": "https://api.dicebear.com/9.x/initials/png?seed=Rama+Food",
  "cover_url": null,
  "bio": null,
  "city": null,
  "public_url": "https://<PUBLIC_WEB_URL>/c/new.creator",
  "is_shortlisted": null,
  "tier": null, "tier_label": null,
  "is_verified": false,
  "niches": ["food_cooking"],
  "platforms": [],
  "rate_cards": [],
  "price_from_usd": null, "price_locked": true, "price_lock_reason": "kyc_required",
  "contract_terms": { "version": "v1", "items": [ "…" ] },
  "highlights": null,
  "audience": null,
  "worked_with": null,
  "top_portfolio_items": [],
  "offers_from_profile": null
}
```

---

## 4. Direct offers: the plan (not built)

Blocked on the **Deals** domain (deal states, escrow hold at offer acceptance). The proposed shape is below; it is locked only when Deals is designed.

- **Quote (server-priced, nothing persisted):** `POST /brand/offers/quote`
  ```json
  { "creator_slug": "rama.food", "slot_keys": ["instagram:reel:30"], "addons": [{ "slot_key": "instagram:reel:30", "type": "rush_delivery" }] }
  ```
  → `{ "items": [{ "slot_key", "price_usd", "addons": [{ "type", "price_usd" }] }], "subtotal_usd", "commission_usd", "tax_usd", "total_usd", "total_syp", "fx_rate", "quote_id", "expires_at" }`.
  Validated against the creator's **current** rate cards: an unknown or stale key → 422 with `meta.invalid_slot_keys`. This needs a KYC-verified brand (same `view_prices` gate), otherwise 403 `kyc_required`.
- **Send:** `POST /brand/offers` with `{ "quote_id", "brief": "…", "budget_usd"?: number, "deadline"?: "YYYY-MM-DD" }` and header `X-Idempotency-Key`.
  - It re-prices on the server. If the price changed since the quote → 409 `quote_stale` with the new quote.
  - It holds the total in escrow from the brand wallet: 409 `insufficient_funds` (existing code) → top-up flow.
  - → 201 the offer (`status: pending_creator`).
- **Timeline:** after the Deals domain ships (the next marketplace milestone after campaign creation). The backend owner will confirm the date. Phase-2 `slot_keys` on the shortlist would arrive in the same release, so the "Add" picks carry straight into the quote.

Until then, keep the bottom bar as "Save to shortlist" (`PUT /brand/shortlist/{slug}`, unchanged).

---

## 5. Tests on the backend (for reference)

- `tests/Feature/Marketplace/MediaKitV2Test.php`:
  - new fields, filled and empty;
  - city localization; `area` never leaks;
  - `is_shortlisted` for brand (true and false), guest, creator and admin;
  - cache headers per viewer; ETag changes with shortlist state;
  - `preview` mirrors the public shape;
  - OG image falls back to the avatar;
  - account-deletion cleanup.
- `tests/Feature/Marketplace/MediaKitCoverTest.php`:
  - 1500×600 crop;
  - upload / replace / delete / idempotent delete;
  - 422 cases; 403 for brand, 401 for guest;
  - storage failure rollback.
- `tests/Feature/Identity/Account/BioTest.php`:
  - allowed vs blocked bios (19 cases);
  - trim / clear, 300 vs 301 chars;
  - `bio_invalid` saves nothing.
- `tests/Feature/Identity/Account/BrandSettingsTest.php`: default `true`, toggle, validation, 403 for a creator.
- Not tested yet: the metric formulas and `worked_with` privacy. They have no data source yet, and their tests ship with the insights provider and Deals.
