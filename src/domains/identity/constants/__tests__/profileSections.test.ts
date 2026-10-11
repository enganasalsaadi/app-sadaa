import { PROFILE_SECTIONS } from '../profileSections';

describe('PROFILE_SECTIONS', () => {
  it('shows the brand privacy switch to brands only, right after company details', () => {
    const brand: readonly string[] = PROFILE_SECTIONS.brand;
    expect(brand.indexOf('brandVisibility')).toBe(brand.indexOf('company') + 1);
    const creator: readonly string[] = PROFILE_SECTIONS.influencer;
    expect(creator).not.toContain('brandVisibility');
  });
});
