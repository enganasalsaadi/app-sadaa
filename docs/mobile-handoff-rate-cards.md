# Rate Cards v2 — Mobile Handoff

Backend status: **live on `main` API** (all endpoints below are green in tests). Ship the app update together with the API release: the old rate card payloads stop working.

## 1. Breaking changes

| Before | Now |
|---|---|
| `service_type` (`reels`, `story`, `post`, `visit`) | `service` (catalog keys, see §3). `reels` → `reel`, `post` → `feed_post` (IG) / `post` (FB), `visit` → `on_site_visit`. |
| `GET /lookups` → `service_types[]` | **Removed.** Use `GET /lookups/rate-card-catalog`. |
| `PUT /influencer/rate-cards` = full replace, card ids regenerated | Still exists, now a **bulk upsert by slot**: ids are kept for cards that stay. Per-card routes added (§4). |
| Card shape `{id, platform, service_type, price_usd}` | New shape (§5). |
| — | All existing cards were **deleted** at release and `has_rate_card` is `false` for every creator. |

## 2. Re-create banner (no push)

Show an in-app banner ("Set up your prices") when **either**:
- `profile.has_rate_card === false`, or
- `capabilities.receive_requests.reason === "rate_card_required"`.

Hide it as soon as the creator saves one card (the flag flips server-side immediately).

## 3. Catalog — `GET /api/v1/lookups/rate-card-catalog`

Public (no token). Localized by `Accept-Language` (`ar` default). Send `If-None-Match` with the last `ETag` → `304` when unchanged. Cache per locale; refetch when `catalog_version` changes.

```jsonc
{
  "catalog_version": "1",
  "price_bounds": { "min_usd": 5, "max_usd": 50000 },
  "platforms": [
    {
      "key": "instagram", "label": "Instagram",
      "services": [
        {
          "key": "story", "label": "Story",
          "package": {                              // null = one card per service
            "key": "frames", "label": "Frames", "type": "options",
            "options": [{ "value": 1, "label": "1 frame" }, { "value": 2, "label": "2 frames" }, { "value": 3, "label": "3 frames" }],
            "default": 1, "visible": true
          },
          "criteria": {
            "delivery_days": { "label": "Delivery time", "min": 1, "max": 14, "default": 5 },
            "revisions": { "label": "Revision rounds", "options": [{ "value": 0, "label": "No revisions" }, …], "default": 1 },
            "retention": {                         // null = not applicable (on_site_visit)
              "label": "Stays live for",
              "options": [{ "value": "24h", "label": "24 hours" }],
              "default": "24h", "minimum": "24h"
            }
          },
          "attributes": [                          // platform extras
            { "key": "link_sticker", "label": "Link sticker", "type": "boolean", "options": [...], "default": false, "visible": false }
          ],
          "addons": ["rush_delivery"]              // add-on types allowed on this service
        }
      ]
    }
  ],
  "platform_agnostic_services": [ { "key": "on_site_visit", … } ],
  "addons": [
    {
      "type": "rush_delivery", "label": "Rush delivery",
      "pricing_modes": [{ "key": "fixed", "label": "Fixed amount", "min": 0.01, "max": 50000 }],
      "options": [{ "key": "delivery_hours", "options": [{ "value": 24 }, { "value": 48 }], "default": 48, "visible": true }]
    }
  ],
  "contract_terms": { "version": "v1", "items": [{ "key": "organic_only", "text": "…" }, …] }
}
```

**Editor rules (v1):**
- Show the services of the creator's linked platforms + `platform_agnostic_services`.
- Show `package` when not null (it's always visible).
- Show the 3 criteria (retention only when not null).
- **Hide attributes where `visible: false`** (all of them in v1). Don't send them; the server applies defaults.
- Offer rush delivery only if the service lists `rush_delivery` in `addons`. Only allow `24h` when `delivery_days ≥ 2` and `48h` when `delivery_days ≥ 3`.
- Render labels from the catalog; never hard-code service names.

## 4. Endpoints

All under `/api/v1`, `Authorization: Bearer`, influencer only.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/influencer/rate-cards` | — | `200` list |
| POST | `/influencer/rate-cards` | card (§4.1) | `201` card |
| PATCH | `/influencer/rate-cards/{id}` | partial card (§4.2) | `200` card |
| DELETE | `/influencer/rate-cards/{id}` | — | `200`, `data: null` |
| PUT | `/influencer/rate-cards` | `{ "rate_cards": [card, …] }` | `200` list |
| POST | `/onboarding/influencer/step-3` | quick form (§4.3) | `200` profile |

A card id that isn't yours returns `404`.

### 4.1 Card payload
```json
{
  "platform": "instagram",          // null / omitted for on_site_visit
  "service": "reel",
  "package_value": "60",            // required when the service has a package; string or number
  "price_usd": 120,                 // 5 – 50000, max 2 decimals
  "delivery_days": 5,               // optional, default 5
  "revisions": 1,                   // optional, default 1
  "retention": "30d",               // optional, default per catalog; omit for on_site_visit
  "addons": [
    { "type": "rush_delivery", "pricing_mode": "fixed", "amount": 30, "options": { "delivery_hours": 48 } }
  ]
}
```

### 4.2 PATCH
Send only what changed. `platform` and `service` are **rejected** (delete + create instead). `package_value` moves the card to another package. `addons`, when present, **replaces the whole list** (`[]` removes all); omit it to keep current add-ons.

### 4.3 Onboarding step 3 (quick form)
```json
{
  "is_skipped": false,
  "rate_cards": [
    { "platform": "instagram", "service": "story", "package_value": 3, "price_usd": 40, "delivery_days": 5 },
    { "platform": null, "service": "on_site_visit", "package_value": 4, "price_usd": 200 }
  ]
}
```
Only `platform, service, package_value, price_usd, delivery_days` are read; the rest takes defaults. Same upsert semantics as PUT.

## 5. Card response (editor and media kit share it)

```json
{
  "id": "01k…",
  "slot_key": "instagram:reel:60",
  "platform": "instagram",
  "service": { "key": "reel", "label": "Reel" },
  "package": { "key": "duration_sec", "value": 60, "label": "Up to 60 seconds" },
  "price_usd": 120,
  "delivery_days": 5,
  "revisions": 1,
  "retention": { "key": "30d", "label": "30 days" },
  "attributes": [{ "key": "collab_post", "label": "Collab post", "value": false, "value_label": "Not included" }],
  "addons": [{
    "type": "rush_delivery", "label": "Rush delivery", "pricing_mode": "fixed",
    "amount": 30, "computed_price_usd": 30, "options": { "delivery_hours": 48 }
  }],
  "includes": ["Up to 60 seconds", "Delivered within 5 days", "1 revision round", "Stays live: 30 days"]
}
```
- `platform`, `package`, `retention` can be `null`.
- `includes` is localized, ready to render as the "What's included" list.
- Media kit (`GET /public/creators/{slug}` and own-kit `preview`) returns `rate_cards[]` in this shape, plus top-level `contract_terms { version, items[{key,text}] }`. `price_from_usd` unchanged. On-site visit cards always show; platform cards only for available, non-rejected platforms.

## 6. Validation errors (`422`)

Keys for single-card routes (prefix `rate_cards.{i}.` for PUT / step 3):

| Key | When |
|---|---|
| `platform` | missing for a platform service · sent for `on_site_visit` · platform not linked |
| `service` | not offered on that platform · **slot already priced** (POST / bulk duplicates) |
| `package_value` | missing / not in options · sent for a service without packages · PATCH to a slot already priced |
| `price_usd` | outside $5–$50,000 or > 2 decimals |
| `delivery_days` / `revisions` / `retention` | outside allowed values · retention sent for on-site visit |
| `attributes.{key}` | unknown key or invalid value |
| `addons.{n}.type` | not allowed on this service · duplicated |
| `addons.{n}.pricing_mode` / `.amount` | mode not allowed · amount out of range |
| `addons.{n}.options.{key}` | invalid option · **rush not faster than delivery_days** |

Messages are localized (`Accept-Language`). Bulk saves are all-or-nothing.

## 7. TypeScript

```ts
export type RateService =
  | 'reel' | 'story' | 'feed_post' | 'post' | 'video' | 'shorts'
  | 'integrated_mention' | 'dedicated_video' | 'channel_post' | 'article' | 'on_site_visit';
export type Retention = '24h' | '30d' | '90d' | '180d' | 'permanent';
export type AddonType = 'rush_delivery' | 'whitelisting' | 'exclusivity' | 'pin' | 'on_site'; // only rush_delivery offered in v1
export type AddonPricingMode = 'fixed' | 'percent_of_base';

export interface RateCardAddon {
  type: AddonType; label: string; pricing_mode: AddonPricingMode;
  amount: number; computed_price_usd: number; options: Record<string, string | number | boolean>;
}

export interface RateCard {
  id: string;
  slot_key: string;
  platform: SocialPlatform | null;
  service: { key: RateService; label: string };
  package: { key: string; value: string | number; label: string } | null;
  price_usd: number;
  delivery_days: number;
  revisions: number;
  retention: { key: Retention; label: string } | null;
  attributes: { key: string; label: string; value: string | number | boolean; value_label: string }[];
  addons: RateCardAddon[];
  includes: string[];
}

export interface RateCardInput {
  platform?: SocialPlatform | null;
  service: RateService;
  package_value?: string | number | null;
  price_usd: number;
  delivery_days?: number;
  revisions?: number;
  retention?: Retention;
  attributes?: Record<string, string | number | boolean>;
  addons?: { type: AddonType; pricing_mode: AddonPricingMode; amount: number; options?: Record<string, string | number | boolean> }[];
}

export interface ContractTerms { version: string; items: { key: string; text: string }[] }
```

Postman: folder **08 - Rate Cards** and **00 - Lookups → Get Rate Card Catalog** in `tests/Postman/Shabbak_API.postman_collection.json`.
