/**
 * Marketplace domain — campaigns, matchmaking, offers, deal pipeline,
 * content review. Public API only.
 */
export { HomeNavigator } from './navigation/HomeNavigator';
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
export { DEAL_STATUS } from './types';
export type { DealStatus, DealRole, DealAction, DraftStatus } from './types';
export { getDealActions } from './utils';
