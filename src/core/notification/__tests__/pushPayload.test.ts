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
