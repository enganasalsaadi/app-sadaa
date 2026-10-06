# Creator Home — Plan (approved 2026-10-05; Home sections 1–6 + Insights built 2026-10-06)

API: `docs/mobile-contract.md` §17 (Media Kit, LOCKED 2026-10-06, implemented). Everything else on Home uses existing endpoints.

## Decisions

| Topic | Decision |
|---|---|
| Media kit backend | Mobile proposed §17; backend locked + implemented it (changes listed in `docs/mobile-handoff.md` §1) |
| Share link | Server-built absolute `public_url` + `?src=link`, never built client-side. Universal link `https://<PUBLIC_WEB_HOST>/c/{slug}` |
| Slug | Auto from primary username, editable (1 change / 30 days; old slug resolves 30 days via `meta.canonical_slug`; reverting to the previous slug allowed during the cooldown) |
| Visibility | Creator can hide the media kit (`is_public`) |
| Stats | profile views, unique brands (count only), link opens, shares, top portfolio items, brand top locations (min 3 brands per bucket). `search_impressions` + `offers_from_profile` are `null` (not live) → tiles hidden, so Home shows **3** tiles until offers ship |
| Sections without an API (wallet, offers, deals, campaigns, badges) | Hidden until the API exists — no placeholders |
| Profile duplication | Home = summary + "Manage" link. Profile keeps the full completion rail, KYC card, settings |

## Sections (top → bottom)

| # | Section | Data | Shown when |
|---|---|---|---|
| 1 | Header (navy, compact): avatar, greeting, `TierBadge`, bell + unread | `/me` | always |
| 2 | Status notice — one, highest priority: suspended → platforms `action_required` → KYC rejected → platforms `under_review` → media kit hidden | `/me` `capabilities`, `platforms_review_status`, `kyc`; §17.1 `is_public` | a blocker exists |
| 3 | **Media Kit card**: preview (avatar, name, ✓ KYC verified, tier from `tier_label`, primary platform + followers (✓ only when `follower_count_verified`), ≤3 niches labelled from local lookups by key, "from $X") · 3 stat tiles (30d: views, brands, link opens; offers tile appears when non-null) · link + copy · **Share (the one primary CTA)** · "All insights" · "Preview" | §17.1 + §17.7 | always |
| 4 | Profile strength: progress bar + next missing step CTA | `/me` `profile_completion` | < 100% |
| 5 | My platforms: horizontal tiles (icon, followers, tier, status, paused) + "Manage" | `/influencer/platforms` | always |
| 6 | My rates: chips per service + "Edit" | `/user/profile` `rate_cards` | always (empty → "Add rates so brands can book you") |

Null metric from §17.7 → tile hidden (feature not live), never shown as 0. `change_pct: null` → "new", no arrow.

## Screens

- **Home** (`marketplace`, composes identity parts) — new **Dashboard** archetype → add to rule 09 + DevShowcase layout variant.
- **Media Kit Insights** (Detail, ✅ built 2026-10-06): `SegmentedControl` 7d/30d/90d · `StatTile` grid (non-null metrics, incl. shares) with change vs previous · `profile_views.series` sparkline (new kit `Sparkline`) · "Where brands view from" (`ProgressBar` per city, `share_pct` as-is, hidden while `[]`) · "Most-viewed work" (hidden while `[]`) · footer primary Share.
- **Media Kit Preview** (✅ built 2026-10-06; read-only, renders own-kit `preview`, no view beacon) — `MediaKitPreview` component, which the brand Explore will reuse. Header gear → Settings.
- **Media Kit Settings** (✅ built 2026-10-06, screen; from the Preview gear and a Profile row): slug edit with debounced (~400 ms, uncached) slug-check §17.3 · `slug_unavailable` 422/409 → field error by `meta.reason` · `slug_change_cooldown` 409 → "available on `meta.available_at`" · 429 = real rate limit (10 PATCH/h) → generic toast · cooldown (`can_change_slug_at` in the future) → info notice with the date; the field **stays editable** because §17.1 has no previous slug to compare against (the server accepts the held slug, else 409 cooldown → field error) · public toggle (hide asks first).

## States

Skeleton per section · stats error → inline error + retry inside the card only · zero views → "Share your link to get your first views" · hidden kit → notice + "Make public" (PATCH `{ is_public: true }`) · offline → global snackbar.

## Ownership

`identity`: media kit API (`MediaKit`, `MediaKitStats`, `PublicMediaKit` tags), `MediaKitCard`, `MediaKitPreview`, Insights/Preview/Settings screens, share hook (Share sheet + clipboard + `POST share` with a UUID `X-Idempotency-Key` made before the sheet opens, reused on retry). Channels: clipboard → `copy_link`; share sheet → `whatsapp` / `telegram` when the OS reports the target (iOS only), else `other`. 409 `media_kit_private` → "Make public" prompt. Invalidate `MediaKitStats` on 200/201. `marketplace/HomeScreen`: layout + composition via `@/domains/identity`. Deep link route `MediaKitPublic { slug }` added to the link allow-list (rule 07); opening it fires the views beacon once (`src: 'link'`, `'app'` in-app, `'search'` from search results), fire-and-forget; public 404 → "Profile not available" for every cause.

## Build order

1. Core: error `meta` (`reason`, `available_at`) + success `meta.canonical_slug`, new error codes, UUID helper, tags.
2. Types + api (real endpoints).
3. Share hook (clipboard dep) · `MediaKitCard` + DevShowcase demo → Home sections 1–6.
4. Insights → Preview → Settings.
5. ✅ 2026-10-06 Universal link + public profile: `MediaKitPublic` root screen, `core/linking` parser/buffer, iOS Associated Domains + `sada` URL scheme + bundle id `com.getsadaapp`, Android `autoVerify` + `sada://c` filters. Pending: stable `PUBLIC_WEB_HOST` (.env* + Xcode build setting) and the ids report to backend (handoff §5).
6. `docs/mobile-architecture.md` §5.2/§5.3 + Change Log, rule 09 Dashboard archetype.
