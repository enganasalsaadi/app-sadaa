import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { ExploreFilters, HomeStackScreenProps } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser, useOpenSupport } from '@/domains/auth';
import { useAmountsHidden } from '@/domains/finance';
import { useGetBrandHomeQuery } from '../../../api/brandHomeApi';
import { useGetExploreFiltersQuery } from '../../../api/exploreApi';
import { BRAND_HOME_ISLAND, resolveCategoryIcon } from '../../../constants/brandHome';
import { useCreatorCardActions } from '../../../hooks/useCreatorCardActions';
import type { BrandHomeRail } from '../../../types/explore';
import { DAY_PART_GREETING, resolveDayPart } from '../../../utils/dayPart';

type Navigation = HomeStackScreenProps<'BrandHomeScreen'>['navigation'];

/**
 * Every `/brand/home` call records rail impressions (handoff §5, throttle 30/min): refetch on
 * focus only once the data is this old. A remount within the window reuses the cache.
 */
const HOME_STALE_SECONDS = 120;
const HOME_STALE_MS = HOME_STALE_SECONDS * 1000;

export type BrandHomeStatus = 'loading' | 'error' | 'ready';

export const useBrandHomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const user = useAppSelector(selectUser);
  const openSupport = useOpenSupport();
  const { hidden, toggleHidden } = useAmountsHidden();
  const homeQuery = useGetBrandHomeQuery(undefined, {
    refetchOnMountOrArgChange: HOME_STALE_SECONDS,
  });
  const filtersQuery = useGetExploreFiltersQuery();
  const { openCreator, toggleShortlist } = useCreatorCardActions();
  const [refreshing, setRefreshing] = useState(false);
  // Read once per mount: Home is a tab root, remounted often enough for a greeting.
  const [dayPart] = useState(() => resolveDayPart(new Date().getHours()));
  const home = homeQuery.data;

  const status: BrandHomeStatus = home ? 'ready' : homeQuery.isError ? 'error' : 'loading';

  const { refetch, fulfilledTimeStamp, isFetching } = homeQuery;
  useFocusEffect(
    useCallback(() => {
      if (!isFetching && fulfilledTimeStamp && Date.now() - fulfilledTimeStamp > HOME_STALE_MS) {
        refetch();
      }
    }, [fulfilledTimeStamp, isFetching, refetch]),
  );

  // Account screens live in the Settings tab; `initial: false` keeps Profile underneath.
  const openProfile = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'ProfileScreen' }),
    [navigation],
  );
  const openNotifications = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'NotificationsScreen', initial: false }),
    [navigation],
  );
  const openWallet = useCallback(() => navigation.navigate('WalletTab'), [navigation]);
  // `initial: false` keeps the wallet under the wizard, so closing it lands there.
  const openTopUp = useCallback(
    () => navigation.navigate('WalletTab', { screen: 'TopUp', initial: false }),
    [navigation],
  );
  const openShortlist = useCallback(() => navigation.navigate('Shortlist'), [navigation]);

  const openExplore = useCallback(
    (filters?: ExploreFilters) => navigation.navigate('Explore', filters ? { filters } : undefined),
    [navigation],
  );
  const openSearch = useCallback(
    () => navigation.navigate('Explore', { focusSearch: true }),
    [navigation],
  );
  const openCategory = useCallback(
    (category: string) => openExplore({ category }),
    [openExplore],
  );
  const openRail = useCallback(
    (rail: BrandHomeRail) => {
      if (rail.seeAll) openExplore(rail.seeAll);
    },
    [openExplore],
  );
  const browseAll = useCallback(() => openExplore(), [openExplore]);

  const categoryOptions = filtersQuery.data?.categories;
  const categories = useMemo(
    () =>
      categoryOptions?.map(({ value, label }) => ({ value, label, icon: resolveCategoryIcon(value) })) ??
      [],
    [categoryOptions],
  );

  const supportUrl = home?.supportWhatsappUrl ?? null;
  const contactSupport = useCallback(() => {
    if (!supportUrl) return;
    // Allow-listed in the mapper (rule 07); the boot-config number is the fallback.
    Linking.openURL(supportUrl).catch(() =>
      openSupport(t('marketplace.brandHome.support.message')),
    );
  }, [openSupport, supportUrl, t]);

  const islandDto = home?.island ?? null;
  const island = useMemo(() => {
    if (!islandDto) return null;
    const def = BRAND_HOME_ISLAND[islandDto.type];
    return {
      key: islandDto.type,
      tone: def.tone,
      // Server copy, shown as-is (rule 03).
      title: islandDto.title,
      message: islandDto.body,
      hint: islandDto.ctaLabel,
      onPress: () =>
        navigation.navigate('SettingsTab', { screen: def.screen, initial: false }),
    };
  }, [islandDto, navigation]);

  const companyName = home?.companyName || user?.display_name || null;
  const governorate = home?.governorate?.label ?? null;
  const wallet = home?.wallet ?? null;
  // The pill's ＋ shows only once `/me` allows a top-up; any blocker is the island's job (rule 06).
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;
  const hero = useMemo(
    () => ({
      status,
      greeting: t(DAY_PART_GREETING[dayPart]),
      companyName: companyName ?? t('marketplace.brandHome.companyFallback'),
      governorate,
      wallet,
      canTopUp,
    }),
    [canTopUp, companyName, dayPart, governorate, status, t, wallet],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    status,
    error: homeQuery.error,
    hero,
    island,
    hidden,
    toggleHidden,
    rails: home?.rails ?? [],
    hasSupport: !!supportUrl,
    unreadNotifications: user?.unread_notifications_count ?? 0,
    refreshing,
    onRefresh,
    retry,
    openProfile,
    openNotifications,
    openShortlist,
    openWallet,
    openTopUp,
    openCreator,
    toggleShortlist,
    contactSupport,
    openSearch,
    // Categories are a shortcut: hidden when `/explore/filters` fails, Explore still works.
    categories,
    categoriesLoading: filtersQuery.isLoading,
    openCategory,
    openRail,
    browseAll,
  };
};

export type BrandHomeScreenModel = ReturnType<typeof useBrandHomeScreen>;
