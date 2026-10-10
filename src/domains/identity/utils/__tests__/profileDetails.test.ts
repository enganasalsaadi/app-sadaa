import type { UserProfileDetails } from '../../types/profile';
import { toSocialLinks, toUserProfileDetails } from '../profileDetails';

jest.mock('@/domains/auth', () => ({}));

const brandDto = (socialLinks: unknown): UserProfileDetails =>
  ({
    id: '01J-brand',
    user_type: 'brand',
    phone: '+963900000000',
    email: null,
    avatar_url: null,
    profile: { company_name: 'Sada', social_links: socialLinks },
  }) as UserProfileDetails;

describe('toSocialLinks', () => {
  it('keeps well-formed links', () => {
    const links = [{ platform: 'instagram', url: 'https://instagram.com/sada' }];
    expect(toSocialLinks(links)).toEqual(links);
  });

  it('drops malformed items', () => {
    expect(toSocialLinks([{ platform: 'instagram' }, null, 'x'])).toEqual([]);
  });

  it('reads a keyed object or null as no links', () => {
    expect(toSocialLinks({ instagram: 'sada' })).toEqual([]);
    expect(toSocialLinks(null)).toEqual([]);
  });
});

describe('toUserProfileDetails', () => {
  it('normalises brand social_links', () => {
    expect(toUserProfileDetails(brandDto({ instagram: 'sada' })).profile.social_links).toEqual([]);
  });

  it('leaves influencer profiles untouched', () => {
    const dto = { ...brandDto(undefined), user_type: 'influencer', profile: { full_name: 'Lina' } } as UserProfileDetails;
    expect(toUserProfileDetails(dto)).toBe(dto);
  });
});
