import type { AppNotification } from '../../types';
import { notificationTarget, resolveNotificationRoute, toTabParams } from '../notificationRoute';

// Both barrels pull in native modules; only types and the payload parser are used here.
jest.mock('@/domains/auth', () => ({}));
jest.mock('@/core/notification', () => jest.requireActual('@/core/notification/pushPayload'));

const item = (overrides: Partial<AppNotification>): AppNotification => ({
  id: 'n1',
  type: 'test',
  title: 'title',
  body: 'body',
  data: null,
  read_at: null,
  created_at: '2026-10-04T10:00:00Z',
  ...overrides,
});

describe('resolveNotificationRoute', () => {
  it('opens KYC for a creator, the verification picker for a brand', () => {
    expect(resolveNotificationRoute({ kind: 'kyc' }, 'brand')).toEqual({ screen: 'CompanyVerification' });
    expect(resolveNotificationRoute({ kind: 'kyc' }, 'influencer')).toEqual({ screen: 'KycScreen' });
  });

  it('opens the verification picker for a brand only, the inbox for anyone else', () => {
    const target = { kind: 'verification' } as const;
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'CompanyVerification' });
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({ screen: 'NotificationsScreen' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'NotificationsScreen' });
  });

  it('opens a platform for a creator only, the inbox for a brand', () => {
    const target = { kind: 'platform', platformId: '01J9ABC' } as const;
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({
      screen: 'PlatformDetailScreen',
      platformId: '01J9ABC',
    });
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'NotificationsScreen' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'NotificationsScreen' });
  });

  it('opens the wallet tab for both roles', () => {
    expect(resolveNotificationRoute({ kind: 'wallet' }, 'brand')).toEqual({ screen: 'WalletTab' });
    expect(resolveNotificationRoute({ kind: 'wallet' }, 'influencer')).toEqual({
      screen: 'WalletTab',
    });
  });

  it('opens a top-up for a brand, the wallet tab for anyone else', () => {
    const target = { kind: 'topUp', topUpId: '01JB4M8X' } as const;
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'TopUpDetail', topUpId: '01JB4M8X' });
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({ screen: 'WalletTab' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'WalletTab' });
  });

  it('opens a withdrawal for a creator, the wallet tab for anyone else', () => {
    const target = { kind: 'withdrawal', withdrawalId: '01JC2W7K' } as const;
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({
      screen: 'WithdrawalDetail',
      withdrawalId: '01JC2W7K',
    });
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'WalletTab' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'WalletTab' });
  });

  it('opens payout methods for a creator, the wallet tab for anyone else', () => {
    const target = { kind: 'payoutMethods' } as const;
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({ screen: 'PayoutMethods' });
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'WalletTab' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'WalletTab' });
  });

  it('opens a deal for both roles', () => {
    const target = { kind: 'deal', dealId: '01JD5K2P' } as const;
    const route = { screen: 'DealDetail', dealId: '01JD5K2P' };
    expect(resolveNotificationRoute(target, 'brand')).toEqual(route);
    expect(resolveNotificationRoute(target, 'influencer')).toEqual(route);
  });

  it('opens strikes for a creator only, the inbox for anyone else', () => {
    const target = { kind: 'strikes' } as const;
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({ screen: 'Strikes' });
    expect(resolveNotificationRoute(target, 'brand')).toEqual({ screen: 'NotificationsScreen' });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'NotificationsScreen' });
  });

  it('opens a campaign by role, the inbox when the role is unknown', () => {
    const target = { kind: 'campaign', campaignId: '01JE7Q3RTV' } as const;
    expect(resolveNotificationRoute(target, 'brand')).toEqual({
      screen: 'CampaignDetail',
      campaignId: '01JE7Q3RTV',
      role: 'brand',
    });
    expect(resolveNotificationRoute(target, 'influencer')).toEqual({
      screen: 'CampaignDetail',
      campaignId: '01JE7Q3RTV',
      role: 'creator',
    });
    expect(resolveNotificationRoute(target, null)).toEqual({ screen: 'NotificationsScreen' });
  });

  it('does nothing without a target', () => {
    expect(resolveNotificationRoute(null, 'influencer')).toBeNull();
  });
});

describe('notificationTarget', () => {
  it('reads the allow-listed deep link', () => {
    expect(notificationTarget(item({ data: { deep_link: 'sada://platforms/01J9ABC' } }))).toEqual({
      kind: 'platform',
      platformId: '01J9ABC',
    });
  });

  it('rejects a foreign or malformed link', () => {
    expect(notificationTarget(item({ data: { deep_link: 'https://evil.example/kyc' } }))).toBeNull();
    expect(
      notificationTarget(item({ type: 'platform_rejected', data: { entity_id: '../x' } })),
    ).toBeNull();
  });

  it('reads a deal inbox entry', () => {
    expect(
      notificationTarget(
        item({ type: 'deal_offer_sent', data: { entity_id: '01JD5K2P', deep_link: 'sada://deals/01JD5K2P' } }),
      ),
    ).toEqual({ kind: 'deal', dealId: '01JD5K2P' });
  });

  it('rebuilds the link from the type when none was sent', () => {
    expect(notificationTarget(item({ type: 'kyc_rejected' }))).toEqual({ kind: 'kyc' });
    expect(notificationTarget(item({ type: 'brand_social_proof_rejected' }))).toEqual({
      kind: 'verification',
    });
    expect(
      notificationTarget(item({ type: 'platform_approved', data: { entity_id: '01J9ABC' } })),
    ).toEqual({ kind: 'platform', platformId: '01J9ABC' });
    expect(
      notificationTarget(item({ type: 'wallet_top_up_reversed', data: { entity_id: '01JB4M8X' } })),
    ).toEqual({ kind: 'topUp', topUpId: '01JB4M8X' });
    expect(
      notificationTarget(item({ type: 'wallet_withdrawal_completed', data: { entity_id: '01JC2W7K' } })),
    ).toEqual({ kind: 'withdrawal', withdrawalId: '01JC2W7K' });
    expect(notificationTarget(item({ type: 'wallet_payout_method_changed', data: { entity_id: 'pm1' } }))).toEqual({
      kind: 'payoutMethods',
    });
    expect(notificationTarget(item({ type: 'test' }))).toBeNull();
  });
});

describe('toTabParams', () => {
  it('keeps Profile under the opened screen', () => {
    expect(toTabParams({ screen: 'KycScreen' })).toEqual({
      screen: 'SettingsTab',
      params: { screen: 'KycScreen', initial: false },
    });
    expect(toTabParams({ screen: 'CompanyVerification' })).toEqual({
      screen: 'SettingsTab',
      params: { screen: 'CompanyVerification', initial: false },
    });
    expect(toTabParams({ screen: 'PlatformDetailScreen', platformId: 'p1' })).toEqual({
      screen: 'SettingsTab',
      params: { screen: 'PlatformDetailScreen', params: { platformId: 'p1' }, initial: false },
    });
  });

  it('switches to the wallet tab', () => {
    expect(toTabParams({ screen: 'WalletTab' })).toEqual({ screen: 'WalletTab' });
  });

  it('opens payout methods over the wallet home', () => {
    expect(toTabParams({ screen: 'PayoutMethods' })).toEqual({
      screen: 'WalletTab',
      params: { screen: 'PayoutMethods', initial: false },
    });
  });

  it('opens a top-up over the wallet home', () => {
    expect(toTabParams({ screen: 'TopUpDetail', topUpId: 'tu1' })).toEqual({
      screen: 'WalletTab',
      params: { screen: 'TopUpDetail', params: { id: 'tu1' }, initial: false },
    });
  });

  it('opens a withdrawal over the wallet home', () => {
    expect(toTabParams({ screen: 'WithdrawalDetail', withdrawalId: 'wd1' })).toEqual({
      screen: 'WalletTab',
      params: { screen: 'WithdrawalDetail', params: { id: 'wd1' }, initial: false },
    });
  });

  it('opens a deal over the deals list', () => {
    expect(toTabParams({ screen: 'DealDetail', dealId: 'd1' })).toEqual({
      screen: 'DealsTab',
      params: { screen: 'DealDetail', params: { id: 'd1' }, initial: false },
    });
  });

  it('opens a brand campaign in the deals tab, a creator one in the opportunities tab', () => {
    const params = { screen: 'CampaignDetail', params: { id: 'c1' }, initial: false };
    expect(toTabParams({ screen: 'CampaignDetail', campaignId: 'c1', role: 'brand' })).toEqual({
      screen: 'DealsTab',
      params,
    });
    expect(toTabParams({ screen: 'CampaignDetail', campaignId: 'c1', role: 'creator' })).toEqual({
      screen: 'OpportunitiesTab',
      params,
    });
  });

  it('opens strikes over the deals list', () => {
    expect(toTabParams({ screen: 'Strikes' })).toEqual({
      screen: 'DealsTab',
      params: { screen: 'Strikes', initial: false },
    });
  });
});

// Public campaigns CM11 (§7): every inbox entry resolves through its own `data.deep_link`.
describe('public campaign pushes (contract §7)', () => {
  const entry = (type: string, deep_link: string, entity_id = 'c1') =>
    item({ type, data: { type, entity_id, deep_link } });
  const routeOf = (it: AppNotification, role: 'brand' | 'influencer') =>
    resolveNotificationRoute(notificationTarget(it), role);

  it.each([
    'campaign_approved',
    'campaign_changes_requested',
    'campaign_rejected',
    'campaign_removed',
    'campaign_new_applications',
    'campaign_ghost_warning',
    'campaign_suspended',
    'campaign_suspension_final_warning',
    'campaign_deadline_reached',
    'campaign_zero_applicants',
    'campaign_zero_applicants_final_warning',
    'campaign_filled',
    'campaign_closed',
    'campaign_cancelled',
    'campaign_seat_freed',
    'campaign_seat_reopened',
    'campaign_drop_summary_1440',
    'campaign_drop_summary_120',
    'campaign_drop_summary_0',
  ])('opens the brand campaign for %s', type => {
    expect(routeOf(entry(type, 'sada://campaigns/c1'), 'brand')).toEqual({
      screen: 'CampaignDetail',
      campaignId: 'c1',
      role: 'brand',
    });
  });

  it.each([
    'campaign_invited',
    'campaign_shortlisted',
    'campaign_not_selected',
    'campaign_application_rejected',
    'campaign_application_expired',
    'campaign_application_cancelled',
  ])('opens the creator campaign for %s', type => {
    expect(routeOf(entry(type, 'sada://campaigns/c1'), 'influencer')).toEqual({
      screen: 'CampaignDetail',
      campaignId: 'c1',
      role: 'creator',
    });
  });

  it.each(['campaign_selected', 'campaign_drop_reminder_1440', 'campaign_drop_reminder_120', 'campaign_drop_reminder_0'])(
    'opens the linked deal, not the campaign, for %s',
    type => {
      expect(routeOf(entry(type, 'sada://deals/d1'), 'influencer')).toEqual({
        screen: 'DealDetail',
        dealId: 'd1',
      });
    },
  );

  it.each([
    'deal_campaign_announcement',
    'deal_return_lock_lifted',
    'deal_return_required',
    'deal_return_received',
    'deal_return_waived',
    'deal_return_issue',
    'deal_return_overdue',
    'deal_return_shipped',
    'deal_return_overdue_brand',
  ])('opens the deal for %s', type => {
    expect(routeOf(entry(type, 'sada://deals/d1', 'd1'), 'influencer')).toEqual({
      screen: 'DealDetail',
      dealId: 'd1',
    });
  });

  it('opens the strikes of a creator for the apply ban and its lifting, the inbox for anyone else', () => {
    for (const type of ['deal_public_apply_ban', 'deal_public_apply_ban_lifted']) {
      const it_ = item({ type, data: { type, deep_link: 'sada://strikes' } });
      expect(routeOf(it_, 'influencer')).toEqual({ screen: 'Strikes' });
      expect(routeOf(it_, 'brand')).toEqual({ screen: 'NotificationsScreen' });
    }
  });
});
