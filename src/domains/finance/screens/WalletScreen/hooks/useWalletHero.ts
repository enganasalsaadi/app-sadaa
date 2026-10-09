import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

export interface WalletHeroTile {
  key: string;
  label: string;
  kind: WalletTileKind;
  value: Money;
  opens: WalletTileTarget | null;
}

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
 * Balance hero: available balance, this month's credits, the two secondary balances and
 * the one blocker. Summary figures the server doesn't send yet stay out (rule 09).
 */
export const useWalletHero = (role: WalletRole, openKyc: () => void) => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const openSupport = useOpenSupport();
  const walletQuery = useGetWalletQuery();
  const wallet = walletQuery.data;
  const copy = WALLET_ROLE_COPY[role];

  const status: WalletHeroStatus = wallet ? 'ready' : walletQuery.isError ? 'error' : 'loading';

  const tiles = useMemo<WalletHeroTile[]>(() => {
    if (!wallet) return [];
    return copy.tiles.flatMap(def => {
      const value = tileValue(wallet, def);
      return value
        ? [{ key: def.key, label: t(def.labelKey), kind: def.kind, value, opens: 'opens' in def ? def.opens : null }]
        : [];
    });
  }, [copy.tiles, t, wallet]);

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
    tiles,
    island,
    actionAllowed,
  };
};

export type WalletHeroModel = ReturnType<typeof useWalletHero>;
