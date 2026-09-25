import { artworkFor } from './BrandLogo';
import { LOGO_ASPECT } from './logoAspect';

describe('BrandLogo artwork', () => {
  it('picks «صدى» for Arabic and "Sada" for English', () => {
    expect(artworkFor('full', 40, 'ar').aspect).toBe(LOGO_ASPECT.full.ar);
    expect(artworkFor('full', 40, 'en').aspect).toBe(LOGO_ASPECT.full.en);
    expect(artworkFor('wordmark', 40, 'ar').aspect).toBe(LOGO_ASPECT.wordmark.ar);
    expect(artworkFor('wordmark', 40, 'en').aspect).toBe(LOGO_ASPECT.wordmark.en);
  });

  it('shares the symbol tiers across languages', () => {
    expect(artworkFor('symbol', 64, 'en')).toBe(artworkFor('symbol', 64, 'ar'));
    expect(artworkFor('symbol', 64, 'ar')).not.toBe(artworkFor('symbol', 32, 'ar'));
    expect(artworkFor('symbol', 32, 'ar')).not.toBe(artworkFor('symbol', 16, 'ar'));
  });
});
