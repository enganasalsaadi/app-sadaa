import {
  toCompanyInfoForm,
  toCompanyInfoPatch,
  toPersonalInfoForm,
  toPersonalInfoPatch,
} from '../profilePatch';
import type { UserProfileDetails } from '../../types/profile';

// The auth barrel pulls in navigators; the real social-link helpers are all these mappers need.
jest.mock('@/domains/auth', () => jest.requireActual('@/domains/auth/schemas/brandProfileSchema'));

const influencer: UserProfileDetails = {
  id: 'u1',
  user_type: 'influencer',
  phone: '+963944123456',
  email: null,
  avatar_url: null,
  profile: { full_name: 'Anas', governorate: 'damascus', governorate_label: 'Damascus', area: null },
};

const brand: UserProfileDetails = {
  id: 'u2',
  user_type: 'brand',
  phone: '+963944123457',
  email: 'info@sada.sy',
  avatar_url: null,
  profile: {
    company_name: 'Sada Co',
    governorate: 'aleppo',
    governorate_label: 'Aleppo',
    business_type: 'fnb',
    business_type_label: 'F&B',
    social_links: [
      { platform: 'instagram', url: 'https://instagram.com/sada' },
      { platform: 'myspace', url: 'https://myspace.com/sada' },
    ],
  },
};

describe('toPersonalInfoForm / toPersonalInfoPatch', () => {
  const saved = toPersonalInfoForm(influencer);

  it('prefills the name from the profile and blanks missing optionals', () => {
    expect(saved).toEqual({ fullName: 'Anas', email: '', governorate: 'damascus', area: '' });
  });

  it('sends nothing when nothing changed (whitespace ignored)', () => {
    expect(toPersonalInfoPatch({ ...saved, fullName: ' Anas ' }, saved)).toEqual({});
  });

  it('sends only the changed fields, trimmed', () => {
    expect(
      toPersonalInfoPatch({ ...saved, email: ' a@b.com ', area: 'Mezzeh' }, saved),
    ).toEqual({ email: 'a@b.com', area: 'Mezzeh' });
  });

  it('clears an optional field with null', () => {
    const withArea = { ...saved, area: 'Mezzeh' };
    expect(toPersonalInfoPatch({ ...withArea, area: '  ' }, withArea)).toEqual({ area: null });
  });
});

describe('toCompanyInfoForm / toCompanyInfoPatch', () => {
  const saved = toCompanyInfoForm(brand);

  it('maps company fields and drops unknown link platforms', () => {
    expect(saved.companyName).toBe('Sada Co');
    expect(saved.businessType).toBe('fnb');
    expect(saved.socialLinks.instagram).toBe('https://instagram.com/sada');
    expect(saved.socialLinks.facebook).toBe('');
  });

  it('sends nothing when nothing changed', () => {
    expect(toCompanyInfoPatch(saved, saved)).toEqual({});
  });

  it('replaces the whole link list when one link changes', () => {
    const patch = toCompanyInfoPatch(
      { ...saved, socialLinks: { ...saved.socialLinks, facebook: 'facebook.com/sada' } },
      saved,
    );
    expect(patch).toEqual({
      social_links: [
        { platform: 'instagram', url: 'https://instagram.com/sada' },
        { platform: 'facebook', url: 'https://facebook.com/sada' },
      ],
    });
  });

  it('sends an empty list when every link is removed', () => {
    const patch = toCompanyInfoPatch(
      { ...saved, socialLinks: { ...saved.socialLinks, instagram: '' } },
      saved,
    );
    expect(patch).toEqual({ social_links: [] });
  });

  it('sends changed company fields', () => {
    expect(
      toCompanyInfoPatch({ ...saved, companyName: 'Sada', businessType: 'retail_ecommerce' }, saved),
    ).toEqual({ company_name: 'Sada', business_type: 'retail_ecommerce' });
  });
});
