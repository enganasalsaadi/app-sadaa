import { useMemo } from 'react';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { useGetWalletQuery } from '../api/walletApi';
import { resolveWalletGlance } from '../utils/resolveWalletGlance';

/**
 * The creator's wallet at a glance for Home: escrow held and the KYC nudge. A failed or slow
 * read just leaves both out; the wallet tab owns the full states.
 */
export const useWalletGlance = () => {
  const user = useAppSelector(selectUser);
  const { data: wallet } = useGetWalletQuery();
  const capability = user?.capabilities?.withdraw_funds;
  return useMemo(() => resolveWalletGlance(wallet, capability), [wallet, capability]);
};
