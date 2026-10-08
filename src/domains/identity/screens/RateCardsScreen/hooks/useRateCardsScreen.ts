import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CatalogService } from '@/core/api';
import type { Money } from '@/core/money';
import type { SettingsStackParamList } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { fromPriceUsd, selectUser, type RateCard } from '@/domains/auth';
import { useRateCardSources } from '../../../hooks/useRateCardSources';
import { needsRateCards } from '../../../utils/rateCardNotice';
import { hasFreeSlot, platformToGroup, takenPackageKeys } from '../../../utils/rateCardForm';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'RateCards'>;

export interface RateCardListRow {
  id: string;
  serviceLabel: string;
  packageLabel: string | null;
  price: Money;
}

export interface RateCardGroupView {
  /** Platform key or the in-person group key. */
  key: string;
  platform: string | null;
  /** Catalog platform label; `null` for the in-person group. */
  label: string | null;
  rows: RateCardListRow[];
  /** A service here still has an unpriced slot. */
  canAdd: boolean;
}

/** Catalog order: service first, then package option. */
const catalogRank = (services: readonly CatalogService[], card: RateCard): number => {
  const serviceIndex = services.findIndex(service => service.key === card.service.key);
  const options = services[serviceIndex]?.package?.options ?? [];
  const packageIndex = options.findIndex(option => String(option.value) === String(card.package?.value));
  return serviceIndex * 100 + Math.max(packageIndex, 0);
};

export const useRateCardsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const user = useAppSelector(selectUser);
  const sources = useRateCardSources();
  const { cards, groups: serviceGroups } = sources;
  const [refreshing, setRefreshing] = useState(false);

  const groups = useMemo<RateCardGroupView[]>(() => {
    if (!cards) return [];
    return serviceGroups.map(group => ({
      key: platformToGroup(group.platform),
      platform: group.platform,
      label: group.label,
      rows: cards
        .filter(card => card.platform === group.platform)
        .sort((a, b) => catalogRank(group.services, a) - catalogRank(group.services, b))
        .flatMap(card => {
          const price = fromPriceUsd(card.price_usd);
          return price
            ? [{ id: card.id, serviceLabel: card.service.label, packageLabel: card.package?.label ?? null, price }]
            : [];
        }),
      canAdd: group.services.some(service =>
        hasFreeSlot(service, takenPackageKeys(cards, group.platform, service.key)),
      ),
    }));
  }, [cards, serviceGroups]);

  const openCard = useCallback(
    (cardId: string) => navigation.navigate('RateCardEditor', { cardId }),
    [navigation],
  );
  const addToGroup = useCallback(
    (group: string) => navigation.navigate('RateCardEditor', { group }),
    [navigation],
  );
  const addCard = useCallback(() => navigation.navigate('RateCardEditor'), [navigation]);
  const openPlatforms = useCallback(() => navigation.navigate('PlatformsScreen'), [navigation]);

  const { refetch } = sources;
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
    groups,
    showNotice: needsRateCards(user),
    /** Only the in-person group: no linked platform the catalog prices. */
    hasNoPlatforms: groups.length > 0 && groups.every(group => group.platform === null),
    canAdd: groups.some(group => group.canAdd),
    isLoading: sources.isLoading,
    isError: sources.isError,
    error: sources.error,
    isRetrying: sources.isFetching,
    retry,
    refreshing,
    onRefresh,
    openCard,
    addToGroup,
    addCard,
    openPlatforms,
  };
};

export type RateCardsScreenModel = ReturnType<typeof useRateCardsScreen>;
