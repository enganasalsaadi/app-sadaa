import { useCallback, useMemo, useState } from 'react';
import { Platform, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { useAppSelector } from '@/core/store';
import type { Money } from '@/core/money';
import { selectUser, useOpenSupport } from '@/domains/auth';
import type { LiveIslandTone } from '@/shared/ui';
import { WALLET_BLOCKER_DEF, WALLET_ROLE_COPY } from '../../../constants';
import type { WalletTileDef, WalletTileKind, WalletTileTarget } from '../../../constants';
import { useGetWalletQuery } from '../../../api/walletApi';
import type { Wallet, WalletRole } from '../../../types';
import { resolveWalletBlocker } from '../../../utils/resolveWalletBlocker';

/** The `/me` capability that gates the role's one money action (rule 06). */
const ROLE_CAPABILITY = {
  creator: 'withdraw_funds',
  brand: 'top_up_wallet',
} as const satisfies Record<WalletRole, string>;

/** One arc of the balance dial: the available balance, then money held, then money waiting. */
export type WalletDialKind = 'available' | WalletTileKind;

export interface WalletDialSegment {
  key: string;
  label: string;
  kind: WalletDialKind;
  value: Money;
  opens: WalletTileTarget | null;
}

const AVAILABLE_KEY = 'available';

/** Arc order around the dial (and in its legend). */
const DIAL_ORDER = {
  available: 0,
  escrow: 1,
  waiting: 2,
} as const satisfies Record<WalletDialKind, number>;

export interface WalletHeroIsland {
  key: string;
  tone: LiveIslandTone;
  title: string;
  message: string;
  onPress?: () => void;
  hint?: string;
}

export type WalletHeroStatus = 'loading' | 'error' | 'ready';

const tileValue = (wallet: Wallet, def: WalletTileDef): Money | null => {
  switch (def.source) {
    case 'pending':
      return wallet.pending;
    case 'summaryEscrow':
      return wallet.summary.escrow;
    case 'pendingTopUps':
      return wallet.summary.pending_top_ups;
    default: {
      const _exhaustive: never = def.source;
      return _exhaustive;
    }
  }
};

/**
 * Balance hero: the dial (available balance, money in escrow, money waiting), the picked
 * arc, this month's credits and the one blocker. Summary figures the server doesn't send
 * yet stay out (rule 09).
 */
export const useWalletHero = (role: WalletRole, openKyc: () => void) => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const openSupport = useOpenSupport();
  const walletQuery = useGetWalletQuery();
  const wallet = walletQuery.data;
  const copy = WALLET_ROLE_COPY[role];

  const status: WalletHeroStatus = wallet ? 'ready' : walletQuery.isError ? 'error' : 'loading';

  const segments = useMemo<WalletDialSegment[]>(() => {
    if (!wallet) return [];
    const available: WalletDialSegment = {
      key: AVAILABLE_KEY,
      label: t('finance.wallet.dial.available'),
      kind: 'available',
      value: wallet.available,
      opens: null,
    };
    const tiles = copy.tiles.flatMap(def => {
      const value = tileValue(wallet, def);
      return value
        ? [{ key: def.key, label: t(def.labelKey), kind: def.kind, value, opens: 'opens' in def ? def.opens : null }]
        : [];
    });
    return [available, ...tiles].sort((a, b) => DIAL_ORDER[a.kind] - DIAL_ORDER[b.kind]);
  }, [copy.tiles, t, wallet]);

  // A picked arc the server stopped sending falls back to the available balance.
  const [pickedKey, setPickedKey] = useState(AVAILABLE_KEY);
  const selectedKey = segments.some(segment => segment.key === pickedKey) ? pickedKey : AVAILABLE_KEY;
  // Tapping the picked arc again goes back to the available balance.
  const selectSegment = useCallback(
    (key: string) => {
      const next = key === selectedKey ? AVAILABLE_KEY : key;
      if (next === selectedKey) return;
      if (Platform.OS !== 'web') Vibration.vibrate(HAPTIC_TAP_MS);
      setPickedKey(next);
    },
    [selectedKey],
  );

  const monthIn = wallet?.summary.month_in;
  const monthInVisible = monthIn && monthIn.amount > 0 ? monthIn : null;

  const contactSupport = useCallback(
    () => openSupport(t('finance.wallet.supportMessage')),
    [openSupport, t],
  );

  const capability = user?.capabilities?.[ROLE_CAPABILITY[role]];
  const blocker = resolveWalletBlocker({ walletStatus: wallet?.status, capability });
  // The server re-checks; the app only mirrors `/me` and the wallet's state (rule 06).
  const actionAllowed = !!wallet && wallet.status === 'active' && capability?.allowed !== false;
  const statusLabel = wallet?.status_label;
  const island = useMemo<WalletHeroIsland | null>(() => {
    if (!blocker) return null;
    const def = WALLET_BLOCKER_DEF[blocker];
    const action =
      def.action === 'kyc'
        ? { onPress: openKyc, hint: t('finance.wallet.blocker.openKyc') }
        : def.action === 'support'
          ? { onPress: contactSupport, hint: t('finance.wallet.blocker.contactSupport') }
          : null;
    return {
      key: blocker,
      tone: def.tone,
      title: def.titleKey ? t(def.titleKey[role]) : statusLabel ?? '',
      message: t(def.messageKey[role]),
      onPress: action?.onPress,
      hint: action?.hint,
    };
  }, [blocker, contactSupport, openKyc, role, statusLabel, t]);

  const { refetch } = walletQuery;
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    status,
    error: walletQuery.error,
    retry,
    refetch,
    available: wallet?.available ?? null,
    availableLabel: t(copy.availableLabel),
    monthIn: monthInVisible,
    monthInKey: copy.monthIn,
    segments,
    selectedKey,
    selectSegment,
    island,
    actionAllowed,
  };
};

export type WalletHeroModel = ReturnType<typeof useWalletHero>;
