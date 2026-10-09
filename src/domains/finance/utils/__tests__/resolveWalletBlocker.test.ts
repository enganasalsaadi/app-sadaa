import { resolveWalletBlocker } from '../resolveWalletBlocker';

const blocked = (reason: string) => ({ allowed: false, reason });

describe('resolveWalletBlocker', () => {
  it('puts the wallet state before any capability reason', () => {
    expect(resolveWalletBlocker({ walletStatus: 'closed', capability: blocked('kyc_required') })).toBe(
      'closed',
    );
    expect(resolveWalletBlocker({ walletStatus: 'frozen', capability: blocked('kyc_required') })).toBe(
      'frozen',
    );
    expect(resolveWalletBlocker({ walletStatus: null, capability: undefined })).toBe('unknownStatus');
  });

  it('maps each capability reason', () => {
    const cases = {
      wallet_frozen: 'frozen',
      withdrawals_paused: 'withdrawalsPaused',
      kyc_required: 'kycRequired',
      kyc_pending: 'kycPending',
      kyc_rejected: 'kycRejected',
      onboarding_incomplete: 'onboardingIncomplete',
    } as const;
    Object.entries(cases).forEach(([reason, blocker]) => {
      expect(resolveWalletBlocker({ walletStatus: 'active', capability: blocked(reason) })).toBe(blocker);
    });
  });

  it('shows nothing when allowed, unknown, suspended or still loading', () => {
    expect(resolveWalletBlocker({ walletStatus: 'active', capability: { allowed: true, reason: null } })).toBeNull();
    expect(resolveWalletBlocker({ walletStatus: 'active', capability: blocked('new_reason') })).toBeNull();
    expect(resolveWalletBlocker({ walletStatus: 'active', capability: blocked('account_suspended') })).toBeNull();
    expect(resolveWalletBlocker({ walletStatus: undefined, capability: undefined })).toBeNull();
  });
});
