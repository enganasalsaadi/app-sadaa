import { parsePushPayload } from '../pushPayload';

describe('parsePushPayload', () => {
  it('parses every contract deep link', () => {
    expect(parsePushPayload({ type: 'kyc_approved', entity_id: '', deep_link: 'sada://kyc' })).toMatchObject({
      type: 'kyc_approved',
      target: { kind: 'kyc' },
    });
    expect(
      parsePushPayload({
        type: 'platform_rejected',
        entity_id: '01J9ZQ4M8X',
        deep_link: 'sada://platforms/01J9ZQ4M8X',
      }),
    ).toMatchObject({
      type: 'platform_rejected',
      target: { kind: 'platform', platformId: '01J9ZQ4M8X' },
    });
    expect(
      parsePushPayload({
        type: 'brand_domain_verified',
        entity_id: '01JD7V2KQZ',
        deep_link: 'sada://verification',
      }),
    ).toMatchObject({ type: 'brand_domain_verified', target: { kind: 'verification' } });
    expect(parsePushPayload({ type: 'test', deep_link: 'sada://notifications' })).toMatchObject({
      type: 'test',
      target: { kind: 'notifications' },
    });
    expect(
      parsePushPayload({
        type: 'wallet_withdrawal_returned',
        entity_id: '01J9ZQ4M8X',
        deep_link: 'sada://wallet',
      }),
    ).toMatchObject({ type: 'wallet_withdrawal_returned', target: { kind: 'wallet' } });
    expect(
      parsePushPayload({
        type: 'wallet_top_up_reversed',
        entity_id: '01JB4M8XQZ',
        deep_link: 'sada://wallet/top-ups/01JB4M8XQZ',
      }),
    ).toMatchObject({ type: 'wallet_top_up_reversed', target: { kind: 'topUp', topUpId: '01JB4M8XQZ' } });
    expect(
      parsePushPayload({
        type: 'wallet_withdrawal_rejected',
        entity_id: '01JC2W7KQZ',
        deep_link: 'sada://wallet/withdrawals/01JC2W7KQZ',
      }),
    ).toMatchObject({
      type: 'wallet_withdrawal_rejected',
      target: { kind: 'withdrawal', withdrawalId: '01JC2W7KQZ' },
    });
    expect(
      parsePushPayload({
        type: 'wallet_payout_method_added',
        entity_id: '01JB4M8XQZ',
        deep_link: 'sada://wallet/payout-methods',
      }),
    ).toMatchObject({ type: 'wallet_payout_method_added', target: { kind: 'payoutMethods' } });
  });

  it('reads deal links (direct deals M11) whatever the deal kind', () => {
    expect(
      parsePushPayload({
        type: 'deal_draft_submitted',
        entity_id: '01JD5K2PQZ',
        deep_link: 'sada://deals/01JD5K2PQZ',
      }),
    ).toMatchObject({ type: null, target: { kind: 'deal', dealId: '01JD5K2PQZ' } });
    expect(
      parsePushPayload({ type: 'deal_strikes_flag_cleared', deep_link: 'sada://strikes' }).target,
    ).toEqual({ kind: 'strikes' });
  });

  it('reads campaign links by id (Public Campaigns CM11), whatever the campaign push', () => {
    expect(
      parsePushPayload({
        type: 'campaign_approved',
        entity_id: '01JE7Q3RTV',
        deep_link: 'sada://campaigns/01JE7Q3RTV',
      }),
    ).toMatchObject({ type: null, target: { kind: 'campaign', campaignId: '01JE7Q3RTV' } });
  });

  it('keeps the open-ended kind and a plain entity id for per-kind refetches', () => {
    expect(
      parsePushPayload({
        type: 'campaign_selected',
        entity_id: '01JE7Q3RTV',
        deep_link: 'sada://deals/01JD5K2PQZ',
      }),
    ).toEqual({
      type: null,
      kind: 'campaign_selected',
      entityId: '01JE7Q3RTV',
      target: { kind: 'deal', dealId: '01JD5K2PQZ' },
    });
  });

  it.each([
    ['an empty id', ''],
    ['an id with a path', '01J/../x'],
    ['a non-string id', 42],
  ])('drops %s as the entity id', (_label, entity_id) => {
    expect(parsePushPayload({ type: 'campaign_selected', entity_id }).entityId).toBeNull();
  });

  it.each([
    ['upper case', 'Campaign_Selected'],
    ['a path', 'campaign/selected'],
    ['a non-string', 7],
  ])('drops a kind with %s', (_label, type) => {
    expect(parsePushPayload({ type }).kind).toBeNull();
  });

  it.each([
    ['a campaign without id', 'sada://campaigns/'],
    ['the campaign list', 'sada://campaigns'],
    ['the applicants sub-link of the plan', 'sada://campaigns/01JE7/applications'],
    ['a campaign id with a path', 'sada://campaigns/01JE7/../x'],
    ['a campaign id with a query', 'sada://campaigns/01JE7?x=1'],
    ['an application link', 'sada://applications/01JE7'],
  ])('ignores %s', (_label, deep_link) => {
    expect(parsePushPayload({ deep_link }).target).toBeNull();
  });

  it('keeps an unknown type as null but still reads the link', () => {
    expect(parsePushPayload({ type: 'deal_paid', deep_link: 'sada://kyc' })).toMatchObject({
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
    ['an id on the verification route', 'sada://verification/123'],
    ['a deal without id', 'sada://deals/'],
    ['the deal list', 'sada://deals'],
    ['a deal id with a path', 'sada://deals/01J9/../x'],
    ['a deal id with a query', 'sada://deals/01J9?x=1'],
    ['a deal sub-route', 'sada://deals/01J9/contract'],
    ['a strike id', 'sada://strikes/01J9'],
    ['a non-string link', 42],
  ])('drops %s', (_, deepLink) => {
    expect(parsePushPayload({ type: 'kyc_approved', deep_link: deepLink }).target).toBeNull();
  });

  it('ignores the legacy `screen` field', () => {
    expect(parsePushPayload({ screen: 'ProfileScreen' })).toEqual({ type: null, kind: null, entityId: null, target: null });
  });

  it('handles a message without data', () => {
    expect(parsePushPayload(undefined)).toEqual({ type: null, kind: null, entityId: null, target: null });
  });
});
