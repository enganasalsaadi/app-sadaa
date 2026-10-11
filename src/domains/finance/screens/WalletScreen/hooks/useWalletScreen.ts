import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpRight, History, Plus } from 'lucide-react-native';
import type { WalletStackScreenProps } from '@/core/navigation';
import { useGetProfileQuery } from '@/domains/auth';
import type { WalletRole } from '../../../types';
import { WALLET_ROLE_COPY, type WalletTileTarget } from '../../../constants';
import type { WalletHeroActions } from '../components/WalletHero';
import { useAmountsHidden } from '../../../hooks/useAmountsHidden';
import { useWalletActivity } from './useWalletActivity';
import { useWalletEarnings } from './useWalletEarnings';
import { useWalletEscrows } from './useWalletEscrows';
import { useWalletHero } from './useWalletHero';
import { useWalletPayouts } from './useWalletPayouts';
import { useWalletRate } from './useWalletRate';

type Navigation = WalletStackScreenProps<'WalletScreen'>['navigation'];

/**
 * Wallet tab, both roles: the balance dial and its blocker, then the escrow tickets, the
 * monthly tide, today's rate and the latest lines on a receipt, which open the statement
 * and each receipt. Brands get Top up + top-up history in the hero; creators get Withdraw +
 * withdrawal history there, and the payout pill under the escrow tickets.
 */
export const useWalletScreen = (role: WalletRole) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  // Keeps `/me` subscribed so a wallet push's `User` refresh updates the blocker.
  const { refetch: refetchMe } = useGetProfileQuery();
  const [refreshing, setRefreshing] = useState(false);
  const { hidden, toggleHidden } = useAmountsHidden();

  // KYC lives in the account stack; `initial: false` keeps its root underneath.
  const openKyc = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'KycScreen', initial: false }),
    [navigation],
  );

  const hero = useWalletHero(role, openKyc);
  const rate = useWalletRate(role);
  const escrows = useWalletEscrows();
  const earnings = useWalletEarnings(role);
  const activity = useWalletActivity();

  const openStatement = useCallback(() => navigation.navigate('Statement'), [navigation]);
  const openReceipt = useCallback(
    (reference: string) => navigation.navigate('TransactionReceipt', { reference }),
    [navigation],
  );

  const openPayoutMethods = useCallback(() => navigation.navigate('PayoutMethods'), [navigation]);
  const payouts = useWalletPayouts(role, openPayoutMethods);

  const openTopUp = useCallback(() => navigation.navigate('TopUp'), [navigation]);
  const openTopUps = useCallback(() => navigation.navigate('TopUps'), [navigation]);
  const openWithdraw = useCallback(() => navigation.navigate('Withdraw'), [navigation]);
  const openWithdrawals = useCallback(() => navigation.navigate('Withdrawals'), [navigation]);
  const onOpenTile = useCallback(
    (target: WalletTileTarget) => {
      switch (target) {
        case 'topUpsInReview':
          navigation.navigate('TopUps', { status: 'pending_review' });
          return;
        case 'withdrawalsPending':
          navigation.navigate('Withdrawals', { status: 'pending' });
          return;
        default: {
          const _exhaustive: never = target;
          return _exhaustive;
        }
      }
    },
    [navigation],
  );

  // Brands top up, creators withdraw (rule 06); `/me` capabilities enable the primary.
  const { actionAllowed } = hero;
  const actions = useMemo<WalletHeroActions>(
    () =>
      role === 'brand'
        ? {
            primary: { label: t('finance.wallet.actions.topUp'), icon: Plus, onPress: openTopUp, disabled: !actionAllowed },
            secondary: { label: t('finance.wallet.actions.history'), icon: History, onPress: openTopUps },
          }
        : {
            primary: {
              label: t('finance.wallet.actions.withdraw'),
              icon: ArrowUpRight,
              onPress: openWithdraw,
              disabled: !actionAllowed,
            },
            secondary: { label: t('finance.wallet.actions.withdrawals'), icon: History, onPress: openWithdrawals },
          },
    [actionAllowed, openTopUp, openTopUps, openWithdraw, openWithdrawals, role, t],
  );

  const { refetch: refetchWallet } = hero;
  const { refetch: refetchRate } = rate;
  const { refetch: refetchEscrows } = escrows;
  const { refetch: refetchEarnings } = earnings;
  const { refetch: refetchActivity } = activity;
  const { enabled: payoutsEnabled, refetch: refetchPayouts } = payouts;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refetchWallet(),
        refetchRate(),
        refetchEscrows(),
        refetchEarnings(),
        refetchActivity(),
        refetchMe(),
        ...(payoutsEnabled ? [refetchPayouts()] : []),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    payoutsEnabled,
    refetchActivity,
    refetchEarnings,
    refetchEscrows,
    refetchMe,
    refetchPayouts,
    refetchRate,
    refetchWallet,
  ]);

  return {
    role,
    title: t('tabs.wallet'),
    hidden,
    toggleHidden,
    hiddenLabel: t(hidden ? 'finance.wallet.showAmounts' : 'finance.wallet.hideAmounts'),
    openStatement,
    openReceipt,
    hero,
    actions,
    onOpenTile,
    rate,
    escrows,
    dealsCount: escrows.escrows?.count ?? 0,
    earnings,
    activity,
    payouts,
    copy: WALLET_ROLE_COPY[role],
    refreshing,
    onRefresh,
  };
};

export type WalletScreenModel = ReturnType<typeof useWalletScreen>;
