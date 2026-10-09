import { PUSH_TYPES } from '@/core/notification/pushPayload';
import { walletPushTags } from '../walletPush';

// Payout method alerts move no money: they have their own case below.
const MONEY_PUSHES = PUSH_TYPES.filter(
  type => type.startsWith('wallet_') && !type.startsWith('wallet_payout_method_'),
);

describe('walletPushTags', () => {
  it('refreshes the balance for every money push', () => {
    MONEY_PUSHES.forEach(type => {
      expect(walletPushTags(type)).toContain('Wallet');
    });
  });

  it('refreshes the wallet tab sections for every money push', () => {
    MONEY_PUSHES.forEach(type => {
      expect(walletPushTags(type)).toEqual(
        expect.arrayContaining(['Wallet', 'WalletEscrow', 'WalletEarnings']),
      );
    });
  });

  it('refreshes the list the push belongs to', () => {
    expect(walletPushTags('wallet_top_up_completed')).toEqual([
      'Wallet',
      'WalletEscrow',
      'WalletEarnings',
      'WalletTransaction',
      'TopUp',
    ]);
    expect(walletPushTags('wallet_withdrawal_returned')).toEqual([
      'Wallet',
      'WalletEscrow',
      'WalletEarnings',
      'WalletTransaction',
      'Withdrawal',
    ]);
  });

  it('refreshes only the methods list for payout method alerts', () => {
    expect(walletPushTags('wallet_payout_method_added')).toEqual(['PayoutMethod']);
    expect(walletPushTags('wallet_payout_method_changed')).toEqual(['PayoutMethod']);
  });

  it('ignores other and unknown pushes', () => {
    expect(walletPushTags('kyc_approved')).toEqual([]);
    expect(walletPushTags(null)).toEqual([]);
  });
});
