import type { TFunction } from 'i18next';
import { ONBOARDING_SLIDES } from '../../data';
import { resolveSlides } from '../resolveSlides';

// Echo the key so the mapping itself is what gets asserted.
const t = ((key: string) => key) as unknown as TFunction;

describe('resolveSlides', () => {
  const slides = resolveSlides(ONBOARDING_SLIDES, t);

  it('keeps order and ids', () => {
    expect(slides.map(s => s.id)).toEqual(['brands', 'creators', 'trust']);
  });

  it('resolves every text field through t', () => {
    const [first] = slides;
    expect(first?.title).toBe('onboarding.slides.brands.title');
    expect(first?.subtitle).toBe('onboarding.slides.brands.subtitle');
    expect(first?.cardTop.description).toBe('onboarding.slides.brands.cardTop.description');
    expect(first?.cardBottom.title).toBe('onboarding.slides.brands.cardBottom.title');
  });

  it('uses the money tone only for the wallet card', () => {
    const moneyCards = slides
      .flatMap(s => [s.cardTop, s.cardBottom])
      .filter(c => c.tone === 'money');
    expect(moneyCards).toHaveLength(1);
    expect(moneyCards[0]?.title).toBe('onboarding.slides.trust.cardBottom.title');
  });
});
