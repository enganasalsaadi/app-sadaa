import {
  buildShareUrl,
  classifyShareError,
  createShareAttempts,
  resolveShareChannel,
} from '../mediaKitShare';

describe('buildShareUrl', () => {
  it('appends ?src=link', () => {
    expect(buildShareUrl('https://sada.app/c/noor')).toBe('https://sada.app/c/noor?src=link');
  });
  it('appends with & when a query exists', () => {
    expect(buildShareUrl('https://sada.app/c/noor?x=1')).toBe('https://sada.app/c/noor?x=1&src=link');
  });
  it('replaces an existing src', () => {
    expect(buildShareUrl('https://sada.app/c/noor?src=web&x=1')).toBe(
      'https://sada.app/c/noor?src=link&x=1',
    );
  });
  it('keeps the hash last', () => {
    expect(buildShareUrl('https://sada.app/c/noor#top')).toBe('https://sada.app/c/noor?src=link#top');
  });
});

describe('resolveShareChannel', () => {
  it('returns null when dismissed', () => {
    expect(resolveShareChannel('ios', { action: 'dismissedAction' })).toBeNull();
    expect(resolveShareChannel('android', { action: 'dismissedAction' })).toBeNull();
  });
  it('Android is always other', () => {
    expect(
      resolveShareChannel('android', { action: 'sharedAction', activityType: 'net.whatsapp.WhatsApp' }),
    ).toBe('other');
    expect(resolveShareChannel('android', { action: 'sharedAction' })).toBe('other');
  });
  it('iOS maps whatsapp / telegram, else other', () => {
    expect(
      resolveShareChannel('ios', { action: 'sharedAction', activityType: 'net.whatsapp.WhatsApp.ShareExtension' }),
    ).toBe('whatsapp');
    expect(
      resolveShareChannel('ios', { action: 'sharedAction', activityType: 'ph.telegra.Telegraph.Share' }),
    ).toBe('telegram');
    expect(
      resolveShareChannel('ios', { action: 'sharedAction', activityType: 'com.apple.UIKit.activity.Message' }),
    ).toBe('other');
    expect(resolveShareChannel('ios', { action: 'sharedAction' })).toBe('other');
  });
});

describe('classifyShareError', () => {
  it('409 media_kit_private → private', () => {
    expect(
      classifyShareError({ status: 409, data: { success: false, error_code: 'media_kit_private' } }),
    ).toBe('private');
  });
  it('429 → rate_limited', () => {
    expect(classifyShareError({ status: 429, data: { success: false } })).toBe('rate_limited');
  });
  it('network / 5xx → failed (retryable)', () => {
    expect(classifyShareError({ status: 'FETCH_ERROR', error: 'Network request failed' })).toBe('failed');
    expect(classifyShareError({ status: 503, data: { success: false } })).toBe('failed');
  });
});

describe('createShareAttempts', () => {
  const keys = () => {
    let n = 0;
    return () => `key-${++n}`;
  };

  it('mints a new key per tap', () => {
    const a = createShareAttempts(keys());
    expect(a.begin()).toBe('key-1');
    expect(a.begin()).toBe('key-2');
  });

  it('keeps the failed attempt (same key) for retry', () => {
    const a = createShareAttempts(keys());
    const attempt = { channel: 'whatsapp' as const, idempotencyKey: a.begin() };
    a.fail(attempt);
    expect(a.getPending()).toEqual({ channel: 'whatsapp', idempotencyKey: 'key-1' });
  });

  it('a new tap drops the pending attempt; clear drops it too', () => {
    const a = createShareAttempts(keys());
    a.fail({ channel: 'other', idempotencyKey: a.begin() });
    a.begin();
    expect(a.getPending()).toBeNull();
    a.fail({ channel: 'other', idempotencyKey: 'x' });
    a.clear();
    expect(a.getPending()).toBeNull();
  });
});
