import { CARD_WIDTH_RATIO, measureCardHeight, placeCard } from '../cardLayout';

const base = { canvasWidth: 300, canvasHeight: 340, cardHeight: 150, inset: 8 };
const width = 300 * CARD_WIDTH_RATIO;

describe('placeCard', () => {
  it('puts the top card on the start side (left in LTR)', () => {
    expect(placeCard({ ...base, placement: 'top', isRTL: false })).toEqual({
      x: 0,
      y: 8,
      width,
      height: 150,
    });
  });

  it('mirrors both cards in RTL', () => {
    expect(placeCard({ ...base, placement: 'top', isRTL: true }).x).toBeCloseTo(300 - width);
    expect(placeCard({ ...base, placement: 'bottom', isRTL: true }).x).toBe(0);
  });

  it('anchors the bottom card to the bottom inset', () => {
    const frame = placeCard({ ...base, placement: 'bottom', isRTL: false });
    expect(frame.y + frame.height).toBe(340 - 8);
    expect(frame.x).toBeCloseTo(300 - width);
  });
});

describe('measureCardHeight', () => {
  it('sums padding, badge, gaps and text blocks', () => {
    expect(
      measureCardHeight({
        padding: 16,
        badgeSize: 44,
        badgeGap: 12,
        titleGap: 4,
        titleHeight: 26,
        descriptionHeight: 48,
      }),
    ).toBe(16 * 2 + 44 + 12 + 26 + 4 + 48);
  });
});
