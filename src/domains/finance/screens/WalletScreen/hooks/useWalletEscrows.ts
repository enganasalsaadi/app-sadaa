import { useCallback } from 'react';
import { normalizeApiError } from '@/core/api';
import { useGetWalletEscrowsQuery } from '../../../api/walletApi';

/** `explainer`: no active escrow (or a server without the endpoint yet): how escrow works instead. */
export type EscrowSectionStatus = 'loading' | 'error' | 'explainer' | 'ready';

const NOT_FOUND = 404;

export const useWalletEscrows = () => {
  const query = useGetWalletEscrowsQuery();
  const { data, isError, error, refetch } = query;
  const notDeployed = isError && normalizeApiError(error).statusCode === NOT_FOUND;

  const status: EscrowSectionStatus = data
    ? data.items.length > 0
      ? 'ready'
      : 'explainer'
    : notDeployed
      ? 'explainer'
      : isError
        ? 'error'
        : 'loading';

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return { status, escrows: data ?? null, retry, refetch };
};

export type WalletEscrowsModel = ReturnType<typeof useWalletEscrows>;
