import type { Money } from '@/core/money';
import type { Wallet } from '../types';
import { resolveWalletBlocker, type WalletCapability } from './resolveWalletBlocker';

/** What Creator Home shows of the wallet: money held for the creator, and the KYC nudge. */
export interface WalletGlance {
  /** Net held on active deals; `null` when nothing is held or the server doesn't send it. */
  escrow: Money | null;
  /** Money is waiting to be withdrawn but the withdrawal needs ID verification first. */
  kycNudge: boolean;
}

/**
 * Figures come straight from `GET /wallet` (rule 06). The nudge needs both a withdrawable
 * balance and the server's `kyc_required` reason, so it never competes with other blockers.
 */
export const resolveWalletGlance = (
  wallet: Wallet | undefined,
  capability: WalletCapability | undefined,
): WalletGlance => {
  if (!wallet) return { escrow: null, kycNudge: false };
  const escrow = wallet.summary.escrow;
  return {
    escrow: escrow && escrow.amount > 0 ? escrow : null,
    kycNudge:
      wallet.available.amount > 0 &&
      resolveWalletBlocker({ walletStatus: wallet.status, capability }) === 'kycRequired',
  };
};
