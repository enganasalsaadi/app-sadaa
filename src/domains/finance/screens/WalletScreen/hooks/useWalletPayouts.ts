import { useCallback } from 'react';
import { usePayoutMethods } from '../../../hooks/usePayoutMethods';
import type { WalletRole } from '../../../types';

/** Creator only: the primary payout method under the balance, or a nudge to add one. */
export const useWalletPayouts = (role: WalletRole, openManage: () => void) => {
  const enabled = role === 'creator';
  const list = usePayoutMethods({ skip: !enabled });
  const { refetch } = list;
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    enabled,
    primary: list.views.find(view => view.isDefault) ?? list.views[0] ?? null,
    isLoading: list.isLoading,
    isError: list.isError,
    retry,
    refetch,
    openManage,
  };
};

export type WalletPayouts = ReturnType<typeof useWalletPayouts>;
