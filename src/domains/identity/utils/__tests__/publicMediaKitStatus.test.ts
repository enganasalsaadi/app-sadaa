import { resolvePublicMediaKitStatus } from '../publicMediaKitStatus';

const notFound = { status: 404, data: { success: false, error_code: 'not_found' } };
const throttled = { status: 429, data: { success: false, error_code: 'too_many_requests' } };

describe('resolvePublicMediaKitStatus', () => {
  it('loading until the first answer', () => {
    expect(
      resolvePublicMediaKitStatus({ hasData: false, error: undefined, isFetching: true }),
    ).toBe('loading');
  });

  it('ready with data', () => {
    expect(
      resolvePublicMediaKitStatus({ hasData: true, error: undefined, isFetching: false }),
    ).toBe('ready');
  });

  it('404 = not available, even over stale data (kit hidden since)', () => {
    expect(resolvePublicMediaKitStatus({ hasData: false, error: notFound, isFetching: false })).toBe(
      'not_found',
    );
    expect(resolvePublicMediaKitStatus({ hasData: true, error: notFound, isFetching: false })).toBe(
      'not_found',
    );
  });

  it('other errors offer a retry; stale data stays on screen', () => {
    expect(
      resolvePublicMediaKitStatus({ hasData: false, error: throttled, isFetching: false }),
    ).toBe('error');
    expect(resolvePublicMediaKitStatus({ hasData: true, error: throttled, isFetching: false })).toBe(
      'ready',
    );
  });

  it('a retry in flight shows loading again', () => {
    expect(resolvePublicMediaKitStatus({ hasData: false, error: notFound, isFetching: true })).toBe(
      'loading',
    );
  });
});
