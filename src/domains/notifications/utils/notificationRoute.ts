import type { NavigatorScreenParams } from '@react-navigation/native';
import { parsePushPayload, type PushTarget } from '@/core/notification';
import type { RootTabParamList } from '@/core/navigation';
import type { UserType } from '@/domains/auth';
import type { AppNotification } from '../types';

/** Typed destinations of a tapped push or inbox entry (rule 07: never a raw screen name). */
export type NotificationRoute =
  | { screen: 'KycScreen' }
  | { screen: 'PlatformDetailScreen'; platformId: string }
  | { screen: 'NotificationsScreen' }
  | { screen: 'WalletTab' }
  | { screen: 'PayoutMethods' }
  | { screen: 'TopUpDetail'; topUpId: string };

/** Platforms and payout methods are creator screens, top-ups a brand one: the other role lands somewhere safe. */
export const resolveNotificationRoute = (
  target: PushTarget | null,
  userType: UserType | null,
): NotificationRoute | null => {
  if (!target) return null;
  switch (target.kind) {
    case 'kyc':
      return { screen: 'KycScreen' };
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
  platform_approved: id => `sada://platforms/${id}`,
  platform_rejected: id => `sada://platforms/${id}`,
  wallet_top_up_completed: id => `sada://wallet/top-ups/${id}`,
  wallet_top_up_rejected: id => `sada://wallet/top-ups/${id}`,
  wallet_top_up_reversed: id => `sada://wallet/top-ups/${id}`,
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
 * Settings-tab params for a route opened from outside the stack (a push tap).
 * `initial: false` keeps Profile underneath, so back never leaves the user stranded.
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
    case 'KycScreen':
    case 'NotificationsScreen':
      return { screen: 'SettingsTab', params: { screen: route.screen, initial: false } };
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
};
