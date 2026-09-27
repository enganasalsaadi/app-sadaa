import { isValidSocialUrl, normalizeSocialUrl } from '../socialLinks';

describe('normalizeSocialUrl', () => {
  it.each([
    ['instagram', 'https://instagram.com/brand', 'https://instagram.com/brand'],
    ['instagram', 'instagram.com/brand', 'https://instagram.com/brand'],
    ['instagram', 'http://www.Instagram.com/brand/', 'https://www.instagram.com/brand/'],
    ['instagram', '@brand.sy', 'https://instagram.com/brand.sy'],
    ['instagram', 'brand', 'https://instagram.com/brand'],
    ['tiktok', '@brand', 'https://www.tiktok.com/@brand'],
    ['tiktok', 'https://vm.tiktok.com/ZM123', 'https://vm.tiktok.com/ZM123'],
    ['youtube', 'youtu.be/abc', 'https://youtu.be/abc'],
    ['facebook', 'm.facebook.com/brand', 'https://m.facebook.com/brand'],
    ['telegram', '@brand_channel', 'https://t.me/brand_channel'],
    ['website', 'brand.sy', 'https://brand.sy'],
    ['website', 'https://shop.brand.com/ar?x=1', 'https://shop.brand.com/ar?x=1'],
  ] as const)('%s: %s → %s', (platform, input, expected) => {
    expect(normalizeSocialUrl(platform, input)).toBe(expected);
  });

  it.each([
    ['instagram', ''],
    ['instagram', '   '],
    ['instagram', 'https://evil.com/instagram.com/brand'],
    ['instagram', 'https://instagram.com.evil.com/brand'],
    ['instagram', 'https://instagram.com'],
    ['instagram', 'https://instagram.com/'],
    ['instagram', '@bad handle'],
    ['facebook', 'ftp://facebook.com/brand'],
    ['telegram', 'https://telegram.org/brand'],
    ['website', 'brand'],
    ['website', '@brand'],
    ['website', 'https://brand .com'],
  ] as const)('%s rejects %p', (platform, input) => {
    expect(normalizeSocialUrl(platform, input)).toBeNull();
    expect(isValidSocialUrl(platform, input)).toBe(false);
  });
});
