import type { NavigatorScreenParams } from '@react-navigation/native';
import { parsePushPayload, type PushTarget } from '@/core/notification';
import type { RootTabParamList } from '@/core/navigation';
import type { UserType } from '@/domains/auth';
import type { AppNotification } from '../types';

/** Typed destinations of a tapped push or inbox entry (rule 07: never a raw screen name). */
export type NotificationRoute =
  | { screen: 'KycScreen' }
  | { screen: 'CompanyVerification' }
  | { screen: 'PlatformDetailScreen'; platformId: string }
  | { screen: 'NotificationsScreen' }
  | { screen: 'WalletTab' }
  | { screen: 'PayoutMethods' }
  | { screen: 'TopUpDetail'; topUpId: string }
  | { screen: 'WithdrawalDetail'; withdrawalId: string }
  | { screen: 'DealDetail'; dealId: string }
  | { screen: 'CampaignDetail'; campaignId: string; role: 'brand' | 'creator' }
  | { screen: 'Strikes' };

/**
 * Platforms, payout methods, withdrawals and strikes are creator screens, top-ups and company
 * verification brand ones: the other role lands somewhere safe. A brand's KYC result opens the
 * verification picker, which shows the document's status beside the other methods. Every deal
 * push opens the deal (M11); both roles' Deals tabs host it. A campaign link opens the brand's
 * campaign in Deals or the creator's in Opportunities (same link, role picks the stack).
 */
export const resolveNotificationRoute = (
  target: PushTarget | null,
  userType: UserType | null,
): NotificationRoute | null => {
  if (!target) return null;
  switch (target.kind) {
    case 'kyc':
      return userType === 'brand' ? { screen: 'CompanyVerification' } : { screen: 'KycScreen' };
    case 'verification':
      return userType === 'brand'
        ? { screen: 'CompanyVerification' }
        : { screen: 'NotificationsScreen' };
    case 'platform':
      return userType === 'influencer'
        ? { screen: 'PlatformDetailScreen', platformId: target.platformId }
        : { screen: 'NotificationsScreen' };
    case 'notifications':
      return { screen: 'NotificationsScreen' };
    case 'wallet':
      return { screen: 'WalletTab' };
    case 'payoutMethods':
      return userType === 'influencer' ? { screen: 'PayoutMethods' } : { screen: 'WalletTab' };
    case 'topUp':
      return userType === 'brand'
        ? { screen: 'TopUpDetail', topUpId: target.topUpId }
        : { screen: 'WalletTab' };
    case 'withdrawal':
      return userType === 'influencer'
        ? { screen: 'WithdrawalDetail', withdrawalId: target.withdrawalId }
        : { screen: 'WalletTab' };
    case 'deal':
      return { screen: 'DealDetail', dealId: target.dealId };
    case 'campaign':
      if (userType === 'brand' || userType === 'influencer') {
        return {
          screen: 'CampaignDetail',
          campaignId: target.campaignId,
          role: userType === 'brand' ? 'brand' : 'creator',
        };
      }
      return { screen: 'NotificationsScreen' };
    case 'strikes':
      return userType === 'influencer' ? { screen: 'Strikes' } : { screen: 'NotificationsScreen' };
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
};

// Entries from before deep links were sent carry only a type (+ entity id): rebuild the link
// so it still goes through the same allow-list.
const FALLBACK_LINK: Record<string, (entityId: string) => string> = {
  kyc_approved: () => 'sada://kyc',
  kyc_rejected: () => 'sada://kyc',
  brand_social_proof_approved: () => 'sada://verification',
  brand_social_proof_rejected: () => 'sada://verification',
  brand_domain_verified: () => 'sada://verification',
  platform_approved: id => `sada://platforms/${id}`,
  platform_rejected: id => `sada://platforms/${id}`,
  wallet_top_up_completed: id => `sada://wallet/top-ups/${id}`,
  wallet_top_up_rejected: id => `sada://wallet/top-ups/${id}`,
  wallet_top_up_reversed: id => `sada://wallet/top-ups/${id}`,
  wallet_withdrawal_completed: id => `sada://wallet/withdrawals/${id}`,
  wallet_withdrawal_rejected: id => `sada://wallet/withdrawals/${id}`,
  wallet_withdrawal_returned: id => `sada://wallet/withdrawals/${id}`,
  wallet_payout_method_added: () => 'sada://wallet/payout-methods',
  wallet_payout_method_changed: () => 'sada://wallet/payout-methods',
};

export const notificationTarget = (item: AppNotification): PushTarget | null => {
  const data = item.data ?? {};
  const parsed = parsePushPayload({ ...data, type: item.type });
  if (parsed.target) return parsed.target;
  const entityId = typeof data.entity_id === 'string' ? data.entity_id : '';
  const link = FALLBACK_LINK[item.type]?.(entityId);
  return link ? parsePushPayload({ deep_link: link }).target : null;
};

/**
 * Tab params for a route opened from outside the stack (a push tap).
 * `initial: false` keeps the tab's root underneath, so back never leaves the user stranded.
 */
export const toTabParams = (route: NotificationRoute): NavigatorScreenParams<RootTabParamList> => {
  switch (route.screen) {
    case 'PlatformDetailScreen':
      return {
        screen: 'SettingsTab',
        params: {
          screen: 'PlatformDetailScreen',
          params: { platformId: route.platformId },
          initial: false,
        },
      };
    case 'WalletTab':
      return { screen: 'WalletTab' };
    case 'PayoutMethods':
      return { screen: 'WalletTab', params: { screen: 'PayoutMethods', initial: false } };
    case 'TopUpDetail':
      // The wallet home stays underneath, like the Settings routes keep Profile.
      return {
        screen: 'WalletTab',
        params: { screen: 'TopUpDetail', params: { id: route.topUpId }, initial: false },
      };
    case 'WithdrawalDetail':
      return {
        screen: 'WalletTab',
        params: { screen: 'WithdrawalDetail', params: { id: route.withdrawalId }, initial: false },
      };
    case 'DealDetail':
      // The deals list stays underneath, so back lands on the rest of the user's deals.
      return {
        screen: 'DealsTab',
        params: { screen: 'DealDetail', params: { id: route.dealId }, initial: false },
      };
    case 'CampaignDetail': {
      const params = { screen: 'CampaignDetail', params: { id: route.campaignId }, initial: false } as const;
      // The feed (creator) or the deals list (brand) stays underneath.
      return route.role === 'brand'
        ? { screen: 'DealsTab', params }
        : { screen: 'OpportunitiesTab', params };
    }
    case 'Strikes':
      return { screen: 'DealsTab', params: { screen: 'Strikes', initial: false } };
    case 'KycScreen':
    case 'CompanyVerification':
    case 'NotificationsScreen':
      return { screen: 'SettingsTab', params: { screen: route.screen, initial: false } };
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
};
