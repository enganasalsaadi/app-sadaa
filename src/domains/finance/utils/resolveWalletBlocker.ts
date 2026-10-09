import type { WalletBlocker } from '../constants';
import type { WalletStatus } from '../types';

/** `/me` capability as the wallet reads it (auth's `Capability`, kept structural so finance needs no auth types). */
export interface WalletCapability {
  allowed: boolean;
  reason: string | null;
}

export interface WalletBlockerInput {
  /** `undefined` while `/wallet` loads; `null` = a status this build doesn't know. */
  walletStatus: WalletStatus | null | undefined;
  /** `withdraw_funds` (creator) or `top_up_wallet` (brand); `undefined` before `/me` has it. */
  capability: WalletCapability | undefined;
}

const REASON_BLOCKER: Record<string, WalletBlocker | null> = {
  wallet_frozen: 'frozen',
  withdrawals_paused: 'withdrawalsPaused',
  kyc_required: 'kycRequired',
  kyc_pending: 'kycPending',
  kyc_rejected: 'kycRejected',
  onboarding_incomplete: 'onboardingIncomplete',
  // The suspended gate replaces the whole app; nothing to say here.
  account_suspended: null,
};

/**
 * The one blocker the wallet hero shows: the wallet's own state first (closed, frozen,
 * unknown), then why `/me` turns the role's action off. An unknown reason shows nothing:
 * the server re-checks the action anyway.
 */
export const resolveWalletBlocker = ({
  walletStatus,
  capability,
}: WalletBlockerInput): WalletBlocker | null => {
  if (walletStatus === 'closed') return 'closed';
  if (walletStatus === 'frozen') return 'frozen';
  if (walletStatus === null) return 'unknownStatus';
  if (!capability || capability.allowed || !capability.reason) return null;
  return REASON_BLOCKER[capability.reason] ?? null;
};
