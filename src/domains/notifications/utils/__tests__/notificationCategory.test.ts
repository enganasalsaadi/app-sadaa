import { inNotificationCategory } from '../notificationCategory';

describe('inNotificationCategory', () => {
  it('keeps everything under "all", wallet and KYC included', () => {
    expect(inNotificationCategory('wallet_top_up_completed', 'all')).toBe(true);
    expect(inNotificationCategory('campaign_approved', 'all')).toBe(true);
  });

  it('splits campaign_ from deal_ by prefix', () => {
    expect(inNotificationCategory('campaign_selected', 'campaigns')).toBe(true);
    expect(inNotificationCategory('campaign_selected', 'deals')).toBe(false);
    expect(inNotificationCategory('deal_return_required', 'deals')).toBe(true);
    expect(inNotificationCategory('deal_return_required', 'campaigns')).toBe(false);
  });

  it('files a deal-prefixed campaign push under deals (the prefix is the whole rule)', () => {
    expect(inNotificationCategory('deal_campaign_announcement', 'deals')).toBe(true);
    expect(inNotificationCategory('deal_campaign_announcement', 'campaigns')).toBe(false);
  });

  it('shows account and money pushes under "all" only', () => {
    expect(inNotificationCategory('wallet_withdrawal_returned', 'campaigns')).toBe(false);
    expect(inNotificationCategory('kyc_approved', 'deals')).toBe(false);
  });
});
