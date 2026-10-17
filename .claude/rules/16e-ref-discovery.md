---
paths:
  - "src/domains/marketplace/**/*BrandHome*"
  - "src/domains/marketplace/**/*BrandHome*/**"
  - "src/domains/marketplace/**/*Explore*"
  - "src/domains/marketplace/**/*Explore*/**"
  - "src/domains/marketplace/**/*Shortlist*"
  - "src/domains/marketplace/**/*Shortlist*/**"
  - "src/domains/marketplace/**/*CreatorCard*"
  - "src/domains/marketplace/**/*CreatorRows*"
  - "src/domains/marketplace/**/*priceLock*"
  - "src/domains/marketplace/**/*PriceLock*"
  - "src/domains/identity/**/*MediaKitPublic*/**"
  - "src/domains/identity/**/*priceLock*"
  - "src/domains/identity/**/*PriceLock*"
---

# 16e — Ref: Discovery (Brand Home, Explore, Shortlist, price lock)

- Brand Home `screens/BrandHomeScreen` («Spotlight», 2026-10-11): `/brand/home` refetched on focus only when > 2 min old (impressions); island → `BRAND_HOME_ISLAND` (`constants/brandHome`) → `HomeIsland`; `WalletLine` (eye state from finance `useAmountsHidden`, "Top up" → `WalletTab/TopUp` when `capabilities.top_up_wallet.allowed`); `SearchEntry` / `CategoryChips` (`resolveCategoryIcon`) / rail `seeAll` → `Explore` (`ExploreParams`: `filters`, `focusSearch`). `HomeRails` picks a shape per `BrandHomeRailKey` (exhaustive): `near_you` → `StoryDeck` (`hooks/useStoryDeck`: pan + throw on the UI thread, depth from shared `base`, a11y "next" action) · `verified` → `VerifiedTiles` · `fast_delivery` → `FastList` · `new`/`recently_viewed` → `RingsRail`. Photos via `CreatorMedia` (navy gradient + monogram fallback, `media*` gradient tokens).
- Card taps everywhere: `hooks/useCreatorCardActions` (Media Kit `src=search` + optimistic ❤️ `toggleShortlist`, `setShortlist(creator, on)` → `Promise<boolean>`, `shortlist_full` toast). Row list skeleton `components/CreatorRowsSkeleton`.
- Shortlist `screens/ShortlistScreen` (List, `HomeStack` `Shortlist`, Home header ❤️): `getShortlist` refetched on mount; ❤️ removes (optimistic patch in `shortlistApi`) then info toast with Undo (`setShortlist(…, true)`).
- Price lock: reasons, `toPriceLockReason`, `PRICE_LOCK_ACTION` (copy + CTA screen per reason) live in **identity** (owns the screens; identity must never import marketplace — cycle) and come via `@/domains/identity`. Marketplace `constants/priceLock` keeps `PRICE_LOCK_LABEL` (card line) + `GATED_EXPLORE_PARAMS/SORTS`; `PriceLockSheet` navigates on `onDismissed`. Marketplace tests loading these mock the identity barrel to `utils/priceLock` + `constants/priceLock`.
- Public Media Kit lock (identity `MediaKitPublicScreen`): `PublicRateCard` nullable prices → `buildLockableRateRows` (`price: null` = 🔒 row); `PriceLockFooter` from `resolvePriceLockNotice(reason, toPriceLockViewer(...))` (guest → Login, creator → text only); locked body also provides `User` so verification saves / pushes drop it.
- Explore `screens/ExploreScreen` (List): `ExploreFilters` is the infinite-query cache key; search debounced 400 ms (`toSearchQuery` 2–60); sheet draft `useExploreFilterDraft` → `applyFilterDraft`; locked viewer + 🔒 param → `requestLock` (queued until the open sheet's `onDismissed`), never sent; `403 gated_parameter` → `stripGatedFilters` + lock sheet. Lock state from first page meta, before it from Home cache (`useQueryState`, no fetch).
- Home campaigns (PC7, 2026-10-17; flag = `active_campaigns` / `campaigns` `null` → both sections and every entry point hidden, no skeleton since the flag is unknown while Home loads). **Brand:** `types/campaignHome` + `mapBrandActiveCampaigns` → `BrandHome.activeCampaigns`; `screens/BrandHomeScreen/components/HomeCampaigns` (`RailHeading` + `Rail` of `CampaignSeatCard`, `CampaignSeatStrip` > 10 seats = `ProgressBar`); `needsAction` = amber ring + server `action.label` bar; tap routes through `campaignHomeTarget(action.key)` (`constants/campaignHome`: `fund_seats` → TopUp, `review_applicants` → `CampaignApplicants`, else/unknown → `CampaignDetail`); `waitingDeals.campaignCount` → island note; `BrandActiveDeal.campaign` → `DealCampaignChip`. **Creator:** `mapCreatorCampaignsGlance` (in the `getCreatorDealSummary` transform, not `mapCreatorDealSummary`, to avoid a mapper cycle; ≤3 feed cards via `mapCreatorCampaign`) → `CreatorDealSummary.campaigns`; `screens/CreatorHomeScreen/components/HomeCampaigns` (`CountChip` ×3 only > 0, `Rail` of `CampaignTicket` reusing the feed's `OpportunityNet/Seats/Badges`, "all" tile when `feedCount > items`, `CampaignsQuiet` when nothing fits → rate cards) on `hooks/useCreatorHomeCampaigns` (feed / `Opportunities {segment:'applications'}` / `CampaignDetail initial:false`); the tab reads `Opportunities` `segment` once then clears it. Tab badge `useCreatorInvitesBadge` = `campaigns.newInvites` (`tabs.invites`).
