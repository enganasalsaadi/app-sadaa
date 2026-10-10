import { resolveSocialProofLink, toSafeDeepLink } from '../socialProofLink';

describe('toSafeDeepLink', () => {
  it('accepts the allow-listed https hosts per platform', () => {
    expect(
      toSafeDeepLink({
        platform: 'instagram',
        deepLink: 'https://instagram.com/sada.sy',
      }),
    ).toBe('https://instagram.com/sada.sy');
    expect(
      toSafeDeepLink({
        platform: 'facebook',
        deepLink: 'https://m.me/123?text=SADA-4821',
      }),
    ).toBe('https://m.me/123?text=SADA-4821');
    expect(
      toSafeDeepLink({ platform: 'facebook', deepLink: 'https://M.ME/123' }),
    ).toBe('https://M.ME/123');
  });

  it('rejects other hosts, schemes, userinfo, ports and cross-platform links', () => {
    const rejected = [
      { platform: 'instagram', deepLink: 'http://instagram.com/sada.sy' },
      {
        platform: 'instagram',
        deepLink: 'https://instagram.com.evil.example/x',
      },
      {
        platform: 'instagram',
        deepLink: 'https://instagram.com@evil.example/x',
      },
      { platform: 'instagram', deepLink: 'https://instagram.com:8443/x' },
      { platform: 'instagram', deepLink: 'https://m.me/123' },
      { platform: 'facebook', deepLink: 'ftp://m.me/123' },
      { platform: 'facebook', deepLink: 'fb-messenger://user/123' },
      { platform: 'facebook', deepLink: '' },
      { platform: 'facebook', deepLink: null },
      { platform: null, deepLink: 'https://instagram.com/sada.sy' },
    ] as const;
    for (const proof of rejected) expect(toSafeDeepLink(proof)).toBeNull();
  });
});

describe('resolveSocialProofLink', () => {
  it('uses the deep link when it is safe', () => {
    expect(
      resolveSocialProofLink({
        platform: 'facebook',
        deepLink: 'https://m.me/123?text=SADA-1',
      }),
    ).toEqual({ kind: 'facebook', url: 'https://m.me/123?text=SADA-1' });
  });

  it('falls back to the platform home with manual instructions', () => {
    expect(
      resolveSocialProofLink({ platform: 'instagram', deepLink: null }),
    ).toEqual({
      kind: 'none',
      url: 'https://www.instagram.com/',
    });
    expect(
      resolveSocialProofLink({
        platform: 'facebook',
        deepLink: 'https://evil.example/',
      }),
    ).toEqual({ kind: 'none', url: 'https://www.facebook.com/' });
  });

  it('has nothing to open for an unknown platform', () => {
    expect(resolveSocialProofLink({ platform: null, deepLink: null })).toEqual({
      kind: 'none',
      url: null,
    });
  });
});
