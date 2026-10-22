import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Money } from '@/core/money';
import type { User } from '@/domains/auth';

export type HomeMapTileKey =
  | 'offers'
  | 'deals'
  | 'campaigns'
  | 'notifications'
  | 'wallet'
  | 'rates'
  | 'platforms'
  | 'kit'
  | 'insights';

export type HomeMapSub =
  | { kind: 'loading' }
  | { kind: 'text'; text: string; tone: 'muted' | 'warning' }
  | { kind: 'money'; value: Money };

export interface HomeMapTile {
  key: HomeMapTileKey;
  sub: HomeMapSub;
  /** What waits behind the tile (new offers, new invites, unread); 0 = no badge. */
  badge: number;
  onPress: () => void;
}

export interface HomeMapInput {
  /** `null` until the deals summary answers. */
  newOffers: number | null;
  /** `null` while loading; 0 before the first offer ever. */
  activeDeals: number | null;
  /** `false` swaps the campaigns tile for notifications; `null` = not known yet. */
  campaignsEnabled: boolean | null;
  campaigns: { feedCount: number; newInvites: number } | null;
  unreadNotifications: number;
  /** `null` until the wallet loads. */
  available: Money | null;
  rates: { count: number; isLoading: boolean };
  platforms: { count: number; isLoading: boolean; reviewStatus: User['platforms_review_status'] };
  isKitPublic: boolean | null;
  open: Record<HomeMapTileKey, () => void>;
}

const LOADING: HomeMapSub = { kind: 'loading' };

/**
 * «Sada map»: every place a creator goes, three to a row and two wide ones last, each with the
 * one fact that tells whether to go there now. Only the server's counts; `…` until they answer.
 */
export const useHomeMap = (input: HomeMapInput): HomeMapTile[] => {
  const { t } = useTranslation();
  const {
    newOffers,
    activeDeals,
    campaignsEnabled,
    campaigns,
    unreadNotifications,
    available,
    rates,
    platforms,
    isKitPublic,
    open,
  } = input;

  return useMemo(() => {
    const text = (value: string, tone: 'muted' | 'warning' = 'muted'): HomeMapSub => ({ kind: 'text', text: value, tone });

    const third: HomeMapTile =
      campaignsEnabled === false
        ? {
            key: 'notifications',
            sub: text(t('marketplace.creatorHome.map.sub.unread', { count: unreadNotifications })),
            badge: unreadNotifications,
            onPress: open.notifications,
          }
        : {
            key: 'campaigns',
            sub: campaigns
              ? text(t('marketplace.creatorHome.map.sub.openCampaigns', { count: campaigns.feedCount }))
              : LOADING,
            badge: campaigns?.newInvites ?? 0,
            onPress: open.campaigns,
          };

    const platformsSub = (): HomeMapSub => {
      if (platforms.isLoading) return LOADING;
      if (platforms.reviewStatus === 'action_required') {
        return text(t('marketplace.creatorHome.map.sub.platformsAction'), 'warning');
      }
      if (platforms.reviewStatus === 'under_review') return text(t('marketplace.creatorHome.map.sub.platformsReview'));
      return text(
        t('marketplace.creatorHome.map.sub.platforms', { count: platforms.count }),
        platforms.count === 0 ? 'warning' : 'muted',
      );
    };

    return [
      {
        key: 'offers',
        sub: newOffers === null ? LOADING : text(t('marketplace.creatorHome.map.sub.newOffers', { count: newOffers })),
        badge: newOffers ?? 0,
        onPress: open.offers,
      },
      {
        key: 'deals',
        sub:
          activeDeals === null
            ? LOADING
            : activeDeals === 0
              ? text(t('marketplace.creatorHome.map.sub.noDeals'))
              : text(t('marketplace.creatorHome.map.sub.activeDeals', { count: activeDeals })),
        badge: 0,
        onPress: open.deals,
      },
      third,
      { key: 'wallet', sub: available ? { kind: 'money', value: available } : LOADING, badge: 0, onPress: open.wallet },
      {
        key: 'rates',
        sub: rates.isLoading
          ? LOADING
          : text(t('marketplace.creatorHome.map.sub.rates', { count: rates.count }), rates.count === 0 ? 'warning' : 'muted'),
        badge: 0,
        onPress: open.rates,
      },
      { key: 'platforms', sub: platformsSub(), badge: 0, onPress: open.platforms },
      {
        key: 'kit',
        sub:
          isKitPublic === null
            ? LOADING
            : text(t(isKitPublic ? 'marketplace.creatorHome.map.sub.kitPublic' : 'marketplace.creatorHome.map.sub.kitPrivate')),
        badge: 0,
        onPress: open.kit,
      },
      { key: 'insights', sub: text(t('marketplace.creatorHome.map.sub.insights')), badge: 0, onPress: open.insights },
    ];
  }, [
    activeDeals,
    available,
    campaigns,
    campaignsEnabled,
    isKitPublic,
    newOffers,
    open,
    platforms.count,
    platforms.isLoading,
    platforms.reviewStatus,
    rates.count,
    rates.isLoading,
    t,
    unreadNotifications,
  ]);
};
