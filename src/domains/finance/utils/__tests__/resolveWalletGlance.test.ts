import type { Wallet } from '../../types';
import { resolveWalletGlance } from '../resolveWalletGlance';

const usd = (amount: number) => ({ amount, currency: 'USD' as const });

const wallet = (over: { available?: number; escrow?: number | null } = {}): Wallet => ({
  id: 'w1',
  status: 'active',
  status_label: 'Active',
  currency: 'USD',
  available: usd(over.available ?? 0),
  pending: usd(0),
  total: usd(0),
  summary: {
    month_in: null,
    escrow: over.escrow == null ? null : usd(over.escrow),
    pending_top_ups: null,
  },
});

const kyc = { allowed: false, reason: 'kyc_required' };

describe('resolveWalletGlance', () => {
  it('shows nothing before the wallet loads', () => {
    expect(resolveWalletGlance(undefined, kyc)).toEqual({ escrow: null, kycNudge: false });
  });

  it('shows the escrow only when something is held', () => {
    expect(resolveWalletGlance(wallet({ escrow: 4500 }), undefined).escrow).toEqual(usd(4500));
    expect(resolveWalletGlance(wallet({ escrow: 0 }), undefined).escrow).toBeNull();
    expect(resolveWalletGlance(wallet({ escrow: null }), undefined).escrow).toBeNull();
  });

  it('nudges KYC only with a withdrawable balance and kyc_required', () => {
    expect(resolveWalletGlance(wallet({ available: 1000 }), kyc).kycNudge).toBe(true);
    expect(resolveWalletGlance(wallet({ available: 0 }), kyc).kycNudge).toBe(false);
    expect(
      resolveWalletGlance(wallet({ available: 1000 }), { allowed: false, reason: 'kyc_pending' }).kycNudge,
    ).toBe(false);
    expect(resolveWalletGlance(wallet({ available: 1000 }), { allowed: true, reason: null }).kycNudge).toBe(
      false,
    );
    expect(resolveWalletGlance(wallet({ available: 1000 }), undefined).kycNudge).toBe(false);
  });

  it('leaves the nudge to the wallet when it is frozen', () => {
    expect(
      resolveWalletGlance({ ...wallet({ available: 1000 }), status: 'frozen' }, kyc).kycNudge,
    ).toBe(false);
  });
});
