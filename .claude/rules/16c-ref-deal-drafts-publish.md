---
paths:
  - "src/domains/marketplace/**/*Draft*"
  - "src/domains/marketplace/**/*Draft*/**"
  - "src/domains/marketplace/**/*Review*"
  - "src/domains/marketplace/**/*Publish*"
  - "src/domains/marketplace/**/*Publish*/**"
  - "src/domains/marketplace/**/*Publication*"
  - "src/domains/marketplace/**/*Publication*/**"
  - "src/domains/marketplace/**/*Proof*"
  - "src/domains/marketplace/**/*Deliverable*"
---

# 16c — Ref: Deal drafts & publish (P6, P7)

- Drafts & review (P6, 2026-10-15) `api/dealDraftsApi` (`getDealItemDrafts` tag `DealHistory`, `requestDraftUploadSlot`, `quoteExtraRevision` → `DealUpsellQuote`); submit / approve / revision / `upsells` through `runDealAction`. Pure `utils/dealDrafts` (`dealDeliverableAction`, `dealRounds` bars, `formatTimecode`, `captionTokens` / `insertCaptionToken`, `dealRevisionAsk`, `toRevisionBody`, `readExtraRevisionAvailable`), limits `constants/dealDrafts`, schemas `schemas/dealDraftSchema`. Detail section `deliverables` → `DealDeliverables` (+ `DealRoundBars`, `DealItemFuse` with `surface="brand"`); `useDealDetail(role, id, openItem)` (`focusItem` → `DealNextStepCard action`). Creator `screens/DealDraftUploadScreen` («غرفة التحميض»: `DraftContactSheet` + `DraftFrame` develop veil, `DraftAskTicket`, `DraftCaptionCard`, `DraftUploadDock`, `DraftHandedIn`; frames via `useUploadFrames` / `useRoundFrames`). Brand `screens/DealDraftReviewScreen` («طاولة المونتاج»: `ReviewStage` owns `useDraftPlayer` (react-native-video), `ReviewScrubber` Pan/Tap/LongPress → pin, `ReviewDock` + `DealHoldToSign`, sheets pin / revision / extra). Pin color `colors.draft.pin` (amber, «change needed»), not mustard.
- Publish & verify (P7, 2026-10-15) `api/dealPublishApi` (`getDealItemPublications` tag `DealHistory`, `requestProofUploadSlot`); publish / verify / fix through `runDealAction`. Pure `utils/dealPublish` (`parseLiveUrl` / `livePlatformOf` / `checkLiveUrl` with server reason codes, `safeLiveUrl` = rule 07 allow-list before `Linking`, `readLiveUrlReason`, `dealItemStage` → detail routes draft vs publish screen, `dealFixAsk` / `dealFixCount`, `windowShare`, `isLastToVerify`, `toPublishBody`), hosts + reason copy `constants/dealPublish`, schemas `schemas/dealPublishSchema` (test names = reason codes → field `error.type`). `dealDeliverableAction` adds `publish` / `verify`. Creator `screens/DealPublishScreen` («على الهواء»: `PublishHero` + `OnAirLamp`, `LiveLinkField` (useController, shake + reason body), `components/DealProofShots`, `PublishFixTicket`, `PublishDock`, `PublishOnAir`). Brand `screens/DealPublicationReviewScreen` («غرفة البث»: `LiveRoomHero` glass card + account badge, `ProofReel` → `GalleryModal`, `VerifyFuseCard`, `PublicationHistory`, `VerifyDock` hold + mint release line, `PublicationFixSheet`). Shared `components/DealProofPhone` (phone-shaped screenshot, develop veil). Tokens `colors.live.*`.
