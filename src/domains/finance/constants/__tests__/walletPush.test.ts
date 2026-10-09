import { PUSH_TYPES } from '@/core/notification/pushPayload';
import { walletPushTags } from '../walletPush';

describe('walletPushTags', () => {
  it('refreshes the balance for every wallet push', () => {
    PUSH_TYPES.filter(type => type.startsWith('wallet_')).forEach(type => {
      expect(walletPushTags(type)).toContain('Wallet');
    });
  });

  it('refreshes the wallet tab sections for every wallet push', () => {
    PUSH_TYPES.filter(type => type.startsWith('wallet_')).forEach(type => {
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

  it('ignores other and unknown pushes', () => {
    expect(walletPushTags('kyc_approved')).toEqual([]);
    expect(walletPushTags(null)).toEqual([]);
  });
});
