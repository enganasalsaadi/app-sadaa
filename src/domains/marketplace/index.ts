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
  CreatorCardVariant,
  DraftReviewCardProps,
} from './components';
export { DEAL_STATUS } from './types';
export type { DealStatus, DealRole, DealAction, DraftStatus, ExploreCreator } from './types';
export { getDealActions } from './utils';
