import { getValidLanguage } from '../language';

describe('getValidLanguage', () => {
  it('keeps supported languages', () => {
    expect(getValidLanguage('en')).toBe('en');
    expect(getValidLanguage('ar')).toBe('ar');
  });

  it('strips region and normalises case', () => {
    expect(getValidLanguage('EN-us')).toBe('en');
  });

  it('falls back to default for unknown or empty input', () => {
    expect(getValidLanguage('fr')).toBe('ar');
    expect(getValidLanguage(undefined)).toBe('ar');
  });
});
