/**
 * Marketplace domain — campaigns, matchmaking, offers, deal pipeline,
 * content review. Public API only.
 */
export { BrandHomeNavigator } from './navigation/BrandHomeNavigator';
export { CreatorHomeNavigator } from './navigation/CreatorHomeNavigator';
export { BrandDealsNavigator, CreatorDealsNavigator } from './navigation/DealsNavigator';
export { OfferBuilderScreen } from './screens/OfferBuilderScreen';
export { DealGuideScreen } from './screens/DealGuideScreen';
export {
  DealStatusPill,
  DealProgress,
  DealCard,
  CreatorCard,
  DraftReviewCard,
} from './components';
export type {
  DealStatusPillProps,
  DealProgressProps,
  DealCardProps,
  CreatorCardProps,
  DraftReviewCardProps,
} from './components';
export { DEAL_STATUS, DEAL_ITEM_STATUS } from './types';
export type {
  Deal,
  DealItem,
  DealDraft,
  DealStatus,
  DealItemStatus,
  DealRole,
  DealAction,
  DealItemAction,
  DealRef,
  DealListArgs,
  DealDetail,
  DealActionPath,
  DealActionRequest,
  DealActionResult,
  Labeled,
  ExploreCreator,
} from './types';
export { getDealActions, getDealItemActions } from './utils';
export type { DealActionOutcome } from './utils';
export {
  dealsApi,
  useGetDealsInfiniteQuery,
  useGetDealQuery,
  useGetDealTimelineQuery,
  useGetDealContractQuery,
} from './api/dealsApi';
export { useDealAction } from './hooks/useDealAction';
export type { UseDealActionOptions } from './hooks/useDealAction';
