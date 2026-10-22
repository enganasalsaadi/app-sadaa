import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { HomeStackScreenProps, SettingsStackParamList } from '@/core/navigation';
import {
  useCreatorOverview,
  useMediaKitCard,
  type ProfileStepTarget,
  type StrengthStageKey,
} from '@/domains/identity';
import { useAmountsHidden, useWalletGlance } from '@/domains/finance';
import type { CreatorActiveDeal } from '../../../types';
import { DAY_PART_GREETING, resolveDayPart } from '../../../utils/dayPart';
import { HOME_STEP_DEF } from '../constants/homeSteps';
import { buildHomeTasks, type HomeTask } from '../utils/buildHomeTasks';
import { useCreatorHomeCampaigns } from './useCreatorHomeCampaigns';
import { useCreatorHomeDeals } from './useCreatorHomeDeals';
import { useHomeMap, type HomeMapTileKey } from './useHomeMap';
import {
  HOME_NOTICE_DEF,
  resolveHomeNotice,
  type HomeNoticeAction,
} from '../utils/resolveHomeNotice';

type Navigation = HomeStackScreenProps<'CreatorHomeScreen'>['navigation'];

/** The sheet's first section: a skeleton, the task deck, a calm card, or nothing. */
export type HomeDeck =
  | { kind: 'loading' }
  | { kind: 'tasks'; tasks: HomeTask[]; welcome: boolean }
  | { kind: 'quiet'; nextUp: CreatorActiveDeal | null }
  | { kind: 'none' };

const STEP_SCREEN = {
  editInfo: 'PersonalInfoScreen',
  avatar: 'ProfileScreen',
  platforms: 'PlatformsScreen',
  rates: 'RateCards',
  kyc: 'KycScreen',
} as const satisfies Record<ProfileStepTarget, keyof SettingsStackParamList>;

export const useCreatorHomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const overview = useCreatorOverview();
  const mediaKit = useMediaKitCard();
  const homeDeals = useCreatorHomeDeals();
  const homeCampaigns = useCreatorHomeCampaigns();
  const walletGlance = useWalletGlance();
  const { hidden: amountsHidden } = useAmountsHidden();
  const [refreshing, setRefreshing] = useState(false);
  // Read once per mount: Home is a tab root, remounted often enough for a greeting.
  const [dayPart] = useState(() => resolveDayPart(new Date().getHours()));

  // Account screens live in the Settings tab; `initial: false` keeps Profile underneath.
  const openProfile = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'ProfileScreen' }),
    [navigation],
  );
  const openNotifications = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'NotificationsScreen', initial: false }),
    [navigation],
  );
  const openPlatforms = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'PlatformsScreen', initial: false }),
    [navigation],
  );
  const openPlatform = useCallback(
    (platformId: string) =>
      navigation.navigate('SettingsTab', {
        screen: 'PlatformDetailScreen',
        params: { platformId },
        initial: false,
      }),
    [navigation],
  );
  const openWallet = useCallback(() => navigation.navigate('WalletTab'), [navigation]);
  const openKyc = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'KycScreen', initial: false }),
    [navigation],
  );

  const openRates = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'RateCards', initial: false }),
    [navigation],
  );

  const onStepPress = useCallback(
    (target: ProfileStepTarget) => {
      const screen = STEP_SCREEN[target];
      navigation.navigate('SettingsTab', { screen, initial: screen === 'ProfileScreen' });
    },
    [navigation],
  );

  const onStepStage = useCallback(
    (stage: StrengthStageKey) => onStepPress(HOME_STEP_DEF[stage].target),
    [onStepPress],
  );
  const openInsights = useCallback(() => navigation.navigate('MediaKitInsights'), [navigation]);
  const openPreview = useCallback(() => navigation.navigate('MediaKitPreview'), [navigation]);
  const openKit = useCallback(() => navigation.navigate('MediaKitSettings'), [navigation]);

  const { onMakePublic, isMakingPublic } = mediaKit.share;
  const runNoticeAction = useCallback(
    (action: HomeNoticeAction) => {
      switch (action) {
        case 'openPlatforms':
          openPlatforms();
          return;
        case 'openKyc':
          openKyc();
          return;
        case 'openRates':
          openRates();
          return;
        case 'makePublic':
          if (!isMakingPublic) onMakePublic();
          return;
        default: {
          const _exhaustive: never = action;
          return _exhaustive;
        }
      }
    },
    [isMakingPublic, onMakePublic, openKyc, openPlatforms, openRates],
  );

  const noticeKey = resolveHomeNotice({
    platformsReviewStatus: overview.platformsReviewStatus,
    kycStatus: overview.kycStatus,
    needsRateCards: overview.needsRateCards,
    isKitPublic: overview.isKitPublic,
  });
  // The sign's button spins while the kit is being made public, then the sign falls away.
  const noticeBusy = noticeKey === 'kitHidden' && isMakingPublic;
  const notice = useMemo(() => {
    if (!noticeKey) return null;
    const def = HOME_NOTICE_DEF[noticeKey];
    const action = def.action;
    return {
      key: noticeKey,
      tone: def.tone,
      title: t(def.titleKey),
      message: t(def.messageKey),
      action: action
        ? { label: t(action.labelKey), onPress: () => runNoticeAction(action.run), busy: noticeBusy }
        : undefined,
    };
  }, [noticeBusy, noticeKey, runNoticeAction, t]);

  const { displayName, avatarUrl, tier, isVerified, primaryPlatform } = overview;
  const hero = useMemo(
    () => ({
      greeting: t(DAY_PART_GREETING[dayPart]),
      displayName,
      avatarUrl,
      tier,
      isVerified,
      primaryPlatform,
    }),
    [avatarUrl, dayPart, displayName, isVerified, primaryPlatform, t, tier],
  );

  const { deals, counts, openDealsTab, openStrikes } = homeDeals;
  const { stages } = overview.completion;
  const deck = useMemo((): HomeDeck => {
    if (deals.kind === 'loading') return { kind: 'loading' };
    const welcome = deals.kind === 'welcome';
    const tasks = buildHomeTasks({
      notice: noticeKey,
      waiting: deals.kind === 'deals' ? deals.waiting : [],
      welcome,
      stages,
    });
    if (tasks.length > 0) return { kind: 'tasks', tasks, welcome };
    if (deals.kind === 'deals') return { kind: 'quiet', nextUp: deals.nextUp };
    return { kind: 'none' };
  }, [deals, noticeKey, stages]);

  const { openFeed } = homeCampaigns;
  const mapOpen = useMemo(
    (): Record<HomeMapTileKey, () => void> => ({
      offers: () => openDealsTab('new'),
      deals: () => openDealsTab('active'),
      campaigns: openFeed,
      notifications: openNotifications,
      wallet: openWallet,
      rates: openRates,
      platforms: openPlatforms,
      kit: openKit,
      insights: openInsights,
    }),
    [openDealsTab, openFeed, openInsights, openKit, openNotifications, openPlatforms, openRates, openWallet],
  );
  const glance = homeCampaigns.campaigns;
  const mapTiles = useHomeMap({
    newOffers: counts?.newOffers ?? null,
    activeDeals: deals.kind === 'deals' ? deals.totalCount : deals.kind === 'welcome' ? 0 : null,
    campaignsEnabled: homeCampaigns.enabled,
    campaigns: glance.kind === 'strip' ? glance : null,
    unreadNotifications: overview.unreadNotifications,
    available: walletGlance.available,
    rates: { count: overview.rates.rows.length, isLoading: overview.rates.isLoading },
    platforms: {
      count: overview.platforms.items.length,
      isLoading: overview.platforms.isLoading,
      reviewStatus: overview.platformsReviewStatus,
    },
    isKitPublic: mediaKit.isPublic,
    open: mapOpen,
  });

  const { refresh } = overview;
  const { refresh: refreshDeals } = homeDeals;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), refreshDeals()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshDeals]);

  return {
    hero,
    kpis: overview.kpis,
    unreadNotifications: overview.unreadNotifications,
    notice,
    deck,
    mapTiles,
    strikes: counts?.liveStrikes ?? 0,
    openStrikes,
    mediaKit,
    homeDeals,
    homeCampaigns,
    walletGlance,
    amountsHidden,
    openWallet,
    openKyc,
    completion: overview.completion,
    platforms: overview.platforms,
    rates: overview.rates,
    refreshing,
    onRefresh,
    openProfile,
    openNotifications,
    openPlatforms,
    openPlatform,
    openRates,
    onStepStage,
    openInsights,
    openPreview,
  };
};

export type CreatorHomeScreenModel = ReturnType<typeof useCreatorHomeScreen>;
