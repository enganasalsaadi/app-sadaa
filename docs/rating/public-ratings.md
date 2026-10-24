# Public ratings: mobile handoff (API 2026-10-23, RT1)

The scores both sides give after a deal now show publicly as an **average + count**. Nothing below **3 revealed ratings**; then the field is `null`. Comments are never public.

## Fields (all `{ average: number (1 decimal), count: number } | null`)

| Where | Field | Whose score |
|---|---|---|
| `GET /explore/creators` card | `rating` | Creator: what brands gave them |
| `GET /public/creators/{slug}` (in-app media kit) | `rating` | Creator |
| Deal (`DealResource`) | `brand.rating` | Brand: what creators gave it. Sent to the creator only; `null` for the brand and admin |
| Campaign feed + detail (`/influencer/campaigns…`) | `brand.rating` | Brand |

## UI to build

1. Creator card (Explore, Brand Home lists): ★ 4.7 (12) next to the badges; hide when `null`.
2. Media kit header: same, with "12 تقييماً" (count) under it.
3. Offer / deal header (creator side) and campaign card + detail: the brand's ★ average (count) next to its name.
4. Never show "no ratings yet" as a negative: when `null` show nothing.

Search rank already includes the rating server-side; no client sorting needed.

The TypeScript DTOs (`explore.ts`, `mediaKit.ts`, `dealDto.ts`, `campaignDto.ts`) already have the optional field.

## M4 rest (RT2, API 2026-10-23)

Types already added (`explore.ts` card, `mediaKit.ts`); fields optional, old builds ignore them.

- `completion: { rate: number (0–100, floored), count: number } | null` on the creator card and media kit. null below 3 deals. Show "✓ 92% أنجز (12)".
- `response: { bucket: 'within_hour' | 'within_day' | 'within_days', label: string } | null` on card and media kit. `label` already localized ("يرد عادةً خلال ساعة"). null below 3 offers.
- Explore filters: `rating_buckets: ExploreOptionDto[]` (values 4, 4.5) → chip group, send as `min_rating`.
- Sort option `rating_desc` ("الأعلى تقييماً") arrives in filters `sort_options`; add to `EXPLORE_SORTS`.
- Brand Home rail `top_rated` (after `near_you`); `see_all = { min_rating: 4.5, sort: 'rating_desc' }`. Add to `BRAND_HOME_RAIL_KEYS` + i18n title.
