import { shadowBleed } from '../shadowBleed';

describe('shadowBleed', () => {
  it('reaches the radius all round, shifted down by the offset', () => {
    expect(shadowBleed({ shadowOffset: { width: 0, height: 8 }, shadowRadius: 16 })).toEqual({
      top: 8,
      bottom: 24,
      side: 16,
    });
  });

  it('never bleeds a negative amount when the offset outruns the blur', () => {
    expect(shadowBleed({ shadowOffset: { width: 0, height: 10 }, shadowRadius: 4 }).top).toBe(0);
  });

  it('widens the sides by a sideways offset', () => {
    expect(shadowBleed({ shadowOffset: { width: -3, height: 0 }, shadowRadius: 5 }).side).toBe(8);
  });

  it('is zero for no shadow', () => {
    expect(shadowBleed({})).toEqual({ top: 0, bottom: 0, side: 0 });
  });
});
