/**
 * Marketplace domain — campaigns, matchmaking, offers, deal pipeline,
 * content review. Public API only.
 */
export { BrandHomeNavigator } from './navigation/BrandHomeNavigator';
export { CreatorHomeNavigator } from './navigation/CreatorHomeNavigator';
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
  Labeled,
  ExploreCreator,
} from './types';
export { getDealActions, getDealItemActions } from './utils';
