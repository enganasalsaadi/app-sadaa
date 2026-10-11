import { hasBioContactDetails } from '../bioRules';

describe('hasBioContactDetails', () => {
  it.each([
    'صانعة محتوى طعام ولايف ستايل من دمشق',
    'Food creator based in Damascus',
    'Cooking since 2015, 3 cookbooks. Mother of 2.',
    'أحب الطبخ والسفر',
  ])('allows a clean bio: %s', bio => {
    expect(hasBioContactDetails(bio)).toBe(false);
  });

  it.each([
    ['URL', 'visit https://example.com now'],
    ['www', 'www . mysite'],
    ['bare domain', 'follow me on bit.ly'],
    ['spaced domain', 'insta . com'],
    ['dot word', 'wa(dot)me'],
    ['arabic dot word', 'shop نقطة com'],
    ['email', 'write to rama@food.sy'],
    ['handle', 'find me @rama.food'],
    ['western digits', 'call 0944123456'],
    ['arabic-indic digits', 'اتصل ٠٩٤٤١٢٣٤٥٦'],
    ['persian digits', 'تماس ۰۹۴۴۱۲۳۴۵۶'],
    ['split digits', 'call 0944 123-456'],
    ['bracketed digits', '(094) 412 3456'],
  ])('blocks %s', (_name, bio) => {
    expect(hasBioContactDetails(bio)).toBe(true);
  });

  it('allows a short digit run', () => {
    expect(hasBioContactDetails('since 123456')).toBe(false);
  });
});
