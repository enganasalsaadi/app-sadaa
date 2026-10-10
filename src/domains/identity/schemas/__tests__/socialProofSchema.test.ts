import type { TFunction } from 'i18next';
import {
  createSocialProofSchema,
  toSocialProofPageUrl,
  toStartSocialProofRequest,
  type SocialProofFormValues,
} from '../socialProofSchema';

const t = ((key: string) => key) as unknown as TFunction;
const schema = createSocialProofSchema(t);

const messageOf = (values: SocialProofFormValues) => {
  try {
    schema.validateSync(values);
    return null;
  } catch (error) {
    return (error as { message: string }).message;
  }
};

describe('toSocialProofPageUrl', () => {
  it.each([
    ['instagram', 'https://instagram.com/mybrand', 'https://instagram.com/mybrand'],
    ['instagram', 'www.instagram.com/mybrand/', 'https://www.instagram.com/mybrand/'],
    ['instagram', '@my.brand', 'https://instagram.com/my.brand'],
    ['facebook', 'http://m.facebook.com/mybrand', 'https://m.facebook.com/mybrand'],
    ['facebook', 'fb.com/mybrand', 'https://fb.com/mybrand'],
  ] as const)('%s accepts %s', (platform, raw, expected) => {
    expect(toSocialProofPageUrl(platform, raw)).toBe(expected);
  });

  it.each([
    ['instagram', 'https://facebook.com/mybrand'],
    ['instagram', 'https://instagr.am/mybrand'],
    ['instagram', 'https://l.instagram.com/mybrand'],
    ['instagram', 'https://instagram.com'],
    ['facebook', 'https://fb.me/mybrand'],
    ['facebook', 'https://evilfacebook.com/mybrand'],
    ['facebook', ''],
  ] as const)('%s rejects %s', (platform, raw) => {
    expect(toSocialProofPageUrl(platform, raw)).toBeNull();
  });
});

describe('createSocialProofSchema', () => {
  it('passes a page on the picked platform', () => {
    expect(messageOf({ platform: 'instagram', pageUrl: 'instagram.com/mybrand' })).toBeNull();
  });

  it('requires a link', () => {
    expect(messageOf({ platform: 'instagram', pageUrl: '  ' })).toBe(
      'account.verification.social.errors.urlRequired',
    );
  });

  it('rejects a link from the other platform', () => {
    expect(messageOf({ platform: 'facebook', pageUrl: 'https://instagram.com/mybrand' })).toBe(
      'account.verification.social.errors.urlInvalid',
    );
  });

  it('caps the canonical URL at 255 characters', () => {
    const pageUrl = `https://instagram.com/${'a'.repeat(240)}`;
    expect(messageOf({ platform: 'instagram', pageUrl })).toBe('validation.maxLength');
  });
});

describe('toStartSocialProofRequest', () => {
  it('sends the canonical https URL', () => {
    expect(toStartSocialProofRequest({ platform: 'instagram', pageUrl: ' @mybrand ' })).toEqual({
      platform: 'instagram',
      page_url: 'https://instagram.com/mybrand',
    });
  });
});
