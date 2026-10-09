import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { WalletStackScreenProps } from '@/core/navigation';
import { PAYOUT_METHODS_MAX } from '../../../constants/payoutMethods';
import { usePayoutMethods } from '../../../hooks/usePayoutMethods';
import type { PaymentChannel } from '../../../types';

type Navigation = WalletStackScreenProps<'PayoutMethods'>['navigation'];

/**
 * Creator payout methods: every saved destination, primary first. A row opens its edit
 * form; "Add" opens the channel sheet, then the form for that channel.
 */
export const usePayoutMethodsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const list = usePayoutMethods();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const count = list.methods?.length ?? 0;
  const atLimit = count >= PAYOUT_METHODS_MAX;

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const onPickChannel = useCallback(
    (channel: PaymentChannel) => navigation.navigate('PayoutMethodForm', { channel }),
    [navigation],
  );
  const openMethod = useCallback((id: string) => navigation.navigate('PayoutMethodForm', { id }), [navigation]);

  const { refetch } = list;
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

  const ready = !!list.methods;

  return {
    title: t('finance.payouts.list.title'),
    views: list.views,
    countLabel: t('finance.payouts.list.count', { used: count, max: PAYOUT_METHODS_MAX }),
    isLoading: list.isLoading,
    isError: list.isError,
    error: list.error,
    isRetrying: list.isFetching,
    retry,
    isEmpty: ready && count === 0,
    atLimit,
    /** Add sits in the footer until the list is known and below the limit. */
    canAdd: ready && !atLimit,
    sheetVisible,
    openSheet,
    closeSheet,
    onPickChannel,
    openMethod,
    refreshing,
    onRefresh,
  };
};

export type PayoutMethodsScreenModel = ReturnType<typeof usePayoutMethodsScreen>;
