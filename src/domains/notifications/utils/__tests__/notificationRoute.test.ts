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
  it('opens KYC for both roles', () => {
    expect(resolveNotificationRoute({ kind: 'kyc' }, 'brand')).toEqual({ screen: 'KycScreen' });
    expect(resolveNotificationRoute({ kind: 'kyc' }, 'influencer')).toEqual({ screen: 'KycScreen' });
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

  it('rebuilds the link from the type when none was sent', () => {
    expect(notificationTarget(item({ type: 'kyc_rejected' }))).toEqual({ kind: 'kyc' });
    expect(
      notificationTarget(item({ type: 'platform_approved', data: { entity_id: '01J9ABC' } })),
    ).toEqual({ kind: 'platform', platformId: '01J9ABC' });
    expect(
      notificationTarget(item({ type: 'wallet_top_up_reversed', data: { entity_id: '01JB4M8X' } })),
    ).toEqual({ kind: 'topUp', topUpId: '01JB4M8X' });
    expect(notificationTarget(item({ type: 'test' }))).toBeNull();
  });
});

describe('toTabParams', () => {
  it('keeps Profile under the opened screen', () => {
    expect(toTabParams({ screen: 'KycScreen' })).toEqual({
      screen: 'SettingsTab',
      params: { screen: 'KycScreen', initial: false },
    });
    expect(toTabParams({ screen: 'PlatformDetailScreen', platformId: 'p1' })).toEqual({
      screen: 'SettingsTab',
      params: { screen: 'PlatformDetailScreen', params: { platformId: 'p1' }, initial: false },
    });
  });

  it('switches to the wallet tab', () => {
    expect(toTabParams({ screen: 'WalletTab' })).toEqual({ screen: 'WalletTab' });
  });

  it('opens a top-up over the wallet home', () => {
    expect(toTabParams({ screen: 'TopUpDetail', topUpId: 'tu1' })).toEqual({
      screen: 'WalletTab',
      params: { screen: 'TopUpDetail', params: { id: 'tu1' }, initial: false },
    });
  });
});
