import {
  classifySlugSaveError,
  normalizeSlugInput,
  previewSlugLink,
  resolveSlugCooldown,
  validateSlugLocally,
} from '../mediaKitSlug';

describe('normalizeSlugInput', () => {
  it('lowercases and drops whitespace', () => {
    expect(normalizeSlugInput(' Anas.Style ')).toBe('anas.style');
    expect(normalizeSlugInput('an as')).toBe('anas');
  });
});

describe('validateSlugLocally', () => {
  it('accepts the §17.2 shape', () => {
    expect(validateSlugLocally('anas')).toBeNull();
    expect(validateSlugLocally('anas.style_1')).toBeNull();
    expect(validateSlugLocally('a1b')).toBeNull();
  });
  it('flags length outside 3–30', () => {
    expect(validateSlugLocally('ab')).toBe('invalid_length');
    expect(validateSlugLocally('a'.repeat(31))).toBe('invalid_length');
    expect(validateSlugLocally('a'.repeat(30))).toBeNull();
  });
  it('flags bad characters, edges and double dots', () => {
    expect(validateSlugLocally('.anas')).toBe('invalid_format');
    expect(validateSlugLocally('anas_')).toBe('invalid_format');
    expect(validateSlugLocally('an-as')).toBe('invalid_format');
    expect(validateSlugLocally('an..as')).toBe('invalid_format');
    expect(validateSlugLocally('أنس')).toBe('invalid_format');
  });
});

describe('resolveSlugCooldown', () => {
  const now = Date.parse('2026-10-06T10:00:00Z');
  it('null when the slug can change now', () => {
    expect(resolveSlugCooldown(null, now)).toBeNull();
    expect(resolveSlugCooldown('2026-10-06T09:00:00Z', now)).toBeNull();
    expect(resolveSlugCooldown('not a date', now)).toBeNull();
  });
  it('returns the end of a future cooldown', () => {
    expect(resolveSlugCooldown('2026-11-05T10:00:00Z', now)?.toISOString()).toBe(
      '2026-11-05T10:00:00.000Z',
    );
  });
});

describe('previewSlugLink', () => {
  it('swaps the slug in the server link', () => {
    expect(previewSlugLink('https://sada.app/c/anas', 'anas', 'anas.style')).toBe(
      'sada.app/c/anas.style',
    );
  });
  it('keeps the server link when its shape is unexpected', () => {
    expect(previewSlugLink('https://sada.app/p/x', 'anas', 'noor')).toBe('sada.app/p/x');
  });
});

describe('classifySlugSaveError', () => {
  const apiError = (status: number, error_code: string, meta: object = {}) => ({
    status,
    data: { success: false, error_code, errors: null, meta: { locale: 'en', ...meta } },
  });

  it('maps slug_unavailable by meta.reason', () => {
    expect(classifySlugSaveError(apiError(422, 'slug_unavailable', { reason: 'reserved' }))).toEqual({
      kind: 'unavailable',
      reason: 'reserved',
    });
    expect(classifySlugSaveError(apiError(409, 'slug_unavailable', { reason: 'taken' }))).toEqual({
      kind: 'unavailable',
      reason: 'taken',
    });
  });
  it('falls back by status when the reason is unknown', () => {
    expect(classifySlugSaveError(apiError(409, 'slug_unavailable'))).toEqual({
      kind: 'unavailable',
      reason: 'taken',
    });
    expect(classifySlugSaveError(apiError(422, 'slug_unavailable', { reason: 'odd' }))).toEqual({
      kind: 'unavailable',
      reason: 'invalid_format',
    });
  });
  it('maps the cooldown 409 with its date', () => {
    const result = classifySlugSaveError(
      apiError(409, 'slug_change_cooldown', {
        retry_after: 3600,
        available_at: '2026-11-05T10:00:00+00:00',
      }),
    );
    expect(result.kind).toBe('cooldown');
    expect(result.kind === 'cooldown' && result.availableAt?.toISOString()).toBe(
      '2026-11-05T10:00:00.000Z',
    );
  });
  it('429 is a real rate limit, anything else failed', () => {
    expect(classifySlugSaveError({ status: 429, data: { success: false } })).toEqual({
      kind: 'rate_limited',
    });
    expect(classifySlugSaveError({ status: 'FETCH_ERROR', error: 'offline' })).toEqual({
      kind: 'failed',
    });
  });
});
