# Mobile Integration — Rate-Card Add-ons (catalog v2)

**Added:** 2026-10-12 (Direct Deals task B0). Mobile task: **M1 — Rate-card add-on editor**.

## What changed

Before, the only add-on was `rush_delivery`. The catalog now has 6, and which ones show depends on the service. **No new endpoints and no request-shape changes.** Same `addons[]` array on `POST /influencer/rate-cards`, `PATCH /influencer/rate-cards/{id}` and `PUT /influencer/rate-cards` (bulk). `catalog_version` is now `"2"`; the ETag changes, so a cached catalog refreshes on its own.

| `type` | Options (`options` object) | Default | Notes |
|---|---|---|---|
| `rush_delivery` | `delivery_hours`: `24` \| `48` | `48` | Unchanged. Must be faster than `delivery_days` (48h needs ≥ 3 days, 24h ≥ 2). |
| `extra_revision` | none, send `{}` or leave it out | — | One extra revision round. In a deal it adds +1 to the allowed rounds. |
| `whitelisting` | `duration_days`: `30` \| `60` | `30` | Paid ads usage of the content. |
| `exclusivity` | `duration_days`: `14` | `14` | Only one value. Show it as a fixed "14 days" label, not a picker. |
| `link_in_bio` | `duration_days`: `7` \| `30` | `7` | |
| `pin` | `duration_days`: `7` \| `30` | `7` | |

Rules (all enforced server-side, `422` with `errors.addons.{i}.*`):
- `pricing_mode` must be `fixed` for every add-on. Don't show a percent option.
- `amount` is USD, `> 0` and `≤ 50000`, max 2 decimals.
- Each `type` at most once per card. A card can offer one duration per add-on (e.g. whitelisting 30 **or** 60).
- An add-on the service doesn't offer → `addons.{i}.type`. `on_site_visit` offers none.
- Leaving out an option sends the default. Unknown option keys → `addons.{i}.options.{key}`.

## Editor: render from the catalog

`GET /lookups/rate-card-catalog` already drives the editor. Use it, don't hardcode the table above:
- `platforms[].services[].addons` → list of add-on `type`s allowed for that service, in display order.
- top-level `addons[]` → one entry per type: `type`, `label` (localized), `pricing_modes[]` (only `fixed`, with `min`/`max`), `options[]` (each `key`, `label`, `options[] {value,label}`, `default`, `visible`). For `extra_revision`, `options` is `[]`, so show only the price field.

Example: a 30-day whitelisting add-on for $60:

```json
{ "type": "whitelisting", "pricing_mode": "fixed", "amount": 60, "options": { "duration_days": 30 } }
```

## Reading cards back

`GET /influencer/rate-cards`, the profile and the public media kit return `addons[]` as before: `type`, `label`, `pricing_mode`, `amount`, `computed_price_usd`, `options`. Order isn't guaranteed, so sort by the catalog's service add-on order. For option labels, use the catalog option labels (`duration_days` → "30 days" / "30 يومًا").

## Per-service availability (catalog v2)

| Service | rush | extra_revision | exclusivity | whitelisting | link_in_bio | pin |
|---|---|---|---|---|---|---|
| Instagram reel / feed post | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Instagram story | ✓ | ✓ | ✓ | | ✓ | |
| TikTok video | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| YouTube shorts | ✓ | ✓ | ✓ | ✓ | ✓ | |
| YouTube integrated mention / dedicated video | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Facebook post | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Facebook reel | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Facebook story, website article | ✓ | ✓ | ✓ | | | |
| Telegram channel post | ✓ | ✓ | ✓ | | | ✓ |
| On-site visit | | | | | | |

## Backward compatibility

Old app builds that only know `rush_delivery` keep working. Cards made by an old build simply have no new add-ons. If an older build reads a card that has new add-ons, it gets types it doesn't know, so skip unknown types instead of crashing.
