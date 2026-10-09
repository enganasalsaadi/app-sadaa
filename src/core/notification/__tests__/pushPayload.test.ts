import { parsePushPayload } from '../pushPayload';

describe('parsePushPayload', () => {
  it('parses every contract deep link', () => {
    expect(parsePushPayload({ type: 'kyc_approved', entity_id: '', deep_link: 'sada://kyc' })).toEqual({
      type: 'kyc_approved',
      target: { kind: 'kyc' },
    });
    expect(
      parsePushPayload({
        type: 'platform_rejected',
        entity_id: '01J9ZQ4M8X',
        deep_link: 'sada://platforms/01J9ZQ4M8X',
      }),
    ).toEqual({
      type: 'platform_rejected',
      target: { kind: 'platform', platformId: '01J9ZQ4M8X' },
    });
    expect(parsePushPayload({ type: 'test', deep_link: 'sada://notifications' })).toEqual({
      type: 'test',
      target: { kind: 'notifications' },
    });
    expect(
      parsePushPayload({
        type: 'wallet_withdrawal_returned',
        entity_id: '01J9ZQ4M8X',
        deep_link: 'sada://wallet',
      }),
    ).toEqual({ type: 'wallet_withdrawal_returned', target: { kind: 'wallet' } });
    expect(
      parsePushPayload({
        type: 'wallet_top_up_reversed',
        entity_id: '01JB4M8XQZ',
        deep_link: 'sada://wallet/top-ups/01JB4M8XQZ',
      }),
    ).toEqual({ type: 'wallet_top_up_reversed', target: { kind: 'topUp', topUpId: '01JB4M8XQZ' } });
    expect(
      parsePushPayload({
        type: 'wallet_withdrawal_rejected',
        entity_id: '01JC2W7KQZ',
        deep_link: 'sada://wallet/withdrawals/01JC2W7KQZ',
      }),
    ).toEqual({
      type: 'wallet_withdrawal_rejected',
      target: { kind: 'withdrawal', withdrawalId: '01JC2W7KQZ' },
    });
    expect(
      parsePushPayload({
        type: 'wallet_payout_method_added',
        entity_id: '01JB4M8XQZ',
        deep_link: 'sada://wallet/payout-methods',
      }),
    ).toEqual({ type: 'wallet_payout_method_added', target: { kind: 'payoutMethods' } });
  });

  it('keeps an unknown type as null but still reads the link', () => {
    expect(parsePushPayload({ type: 'deal_paid', deep_link: 'sada://kyc' })).toEqual({
      type: null,
      target: { kind: 'kyc' },
    });
  });

  it.each([
    ['a missing link', undefined],
    ['another scheme', 'https://evil.example/kyc'],
    ['an unknown route', 'sada://Main'],
    ['a raw screen name', 'ProfileScreen'],
    ['extra path segments', 'sada://platforms/01J9/delete'],
    ['a platform without id', 'sada://platforms'],
    ['an unknown wallet sub-path', 'sada://wallet/escrows/01J9'],
    ['a withdrawal without id', 'sada://wallet/withdrawals/'],
    ['a withdrawal id with a path', 'sada://wallet/withdrawals/01J9/../x'],
    ['a withdrawal id with a query', 'sada://wallet/withdrawals/01J9?x=1'],
    ['the withdrawal list', 'sada://wallet/withdrawals'],
    ['a top-up without id', 'sada://wallet/top-ups/'],
    ['a top-up id with a path', 'sada://wallet/top-ups/01J9/../x'],
    ['a top-up id with a query', 'sada://wallet/top-ups/01J9?x=1'],
    ['the top-up list', 'sada://wallet/top-ups'],
    ['a payout method id', 'sada://wallet/payout-methods/01J9'],
    ['a payout methods query', 'sada://wallet/payout-methods?x=1'],
    ['an empty platform id', 'sada://platforms/'],
    ['an id with a query', 'sada://platforms/01J9?x=1'],
    ['an id on a fixed route', 'sada://kyc/123'],
    ['a non-string link', 42],
  ])('drops %s', (_, deepLink) => {
    expect(parsePushPayload({ type: 'kyc_approved', deep_link: deepLink }).target).toBeNull();
  });

  it('ignores the legacy `screen` field', () => {
    expect(parsePushPayload({ screen: 'ProfileScreen' })).toEqual({ type: null, target: null });
  });

  it('handles a message without data', () => {
    expect(parsePushPayload(undefined)).toEqual({ type: null, target: null });
  });
});
