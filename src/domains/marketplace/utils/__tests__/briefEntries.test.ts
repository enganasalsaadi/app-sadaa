import type { TFunction } from 'i18next';
import {
  activeBriefTone,
  BRIEF_TEMPLATES,
  briefTemplateEntries,
  isBriefLink,
  mergeBriefEntries,
  normalizeBriefEntry,
  toggleBriefTone,
} from '../briefEntries';

/** Every key answers itself, so a tone's talking point is its own key. */
const t = ((key: string) => key) as unknown as TFunction;
const POINT = {
  casual: 'marketplace.offer.brief.tone.casual.point',
  luxury: 'marketplace.offer.brief.tone.luxury.point',
} as const;

describe('brief entries', () => {
  it('writes hashtags and mentions the way the post does', () => {
    expect(normalizeBriefEntry('hashtags', ' ##قهوة دمشق ')).toBe('#قهوة_دمشق');
    expect(normalizeBriefEntry('mentions', ' @@brand coffee')).toBe('@brandcoffee');
    expect(normalizeBriefEntry('hashtags', '  ')).toBe('');
  });

  it('trims talking points and don’ts to the server cap', () => {
    expect(normalizeBriefEntry('talkingPoints', `  ${'a'.repeat(400)} `)).toHaveLength(300);
    expect(normalizeBriefEntry('donts', '  no rivals ')).toBe('no rivals');
  });

  it('merges without duplicates and stops at ten', () => {
    expect(mergeBriefEntries(['a'], ['a', 'b'])).toEqual(['a', 'b']);
    const full = Array.from({ length: 9 }, (_, index) => `p${index}`);
    expect(mergeBriefEntries(full, ['x', 'y', 'z'])).toEqual([...full, 'x']);
  });

  it('accepts only full http(s) links', () => {
    expect(isBriefLink('https://sada.app/offer')).toBe(true);
    expect(isBriefLink('http://shop.example.com/a?b=1')).toBe(true);
    expect(isBriefLink('sada.app')).toBe(false);
    expect(isBriefLink('https://nodot')).toBe(false);
    expect(isBriefLink('https://a b.com')).toBe(false);
  });

  it('gives every template points and don’ts', () => {
    BRIEF_TEMPLATES.forEach(key => {
      const { points, donts } = briefTemplateEntries(t, key);
      expect(points.length).toBeGreaterThan(0);
      expect(donts.length).toBeGreaterThan(0);
    });
  });
});

describe('brief tone', () => {
  it('reads the tone from the talking points', () => {
    expect(activeBriefTone(t, ['x', POINT.luxury])).toBe('luxury');
    expect(activeBriefTone(t, ['x'])).toBeNull();
  });

  it('keeps one tone at a time and switches off the one tapped twice', () => {
    expect(toggleBriefTone(t, ['x', POINT.casual], 'luxury')).toEqual(['x', POINT.luxury]);
    expect(toggleBriefTone(t, ['x', POINT.luxury], 'luxury')).toEqual(['x']);
    expect(toggleBriefTone(t, [], 'casual')).toEqual([POINT.casual]);
  });
});
