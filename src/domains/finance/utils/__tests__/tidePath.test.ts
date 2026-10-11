import { buildTidePath } from '../tidePath';

const FRAME = { width: 220, top: 20, base: 120, inset: 10, mirror: false };

describe('buildTidePath', () => {
  it('returns null without values or room', () => {
    expect(buildTidePath([], FRAME)).toBeNull();
    expect(buildTidePath([1, 2], { ...FRAME, width: 10 })).toBeNull();
    expect(buildTidePath([1, 2], { ...FRAME, base: 20 })).toBeNull();
  });

  it('spreads months from the reading start and scales from zero with headroom', () => {
    const geometry = buildTidePath([0, 100, 50], FRAME);
    expect(geometry?.points.map(p => p.x)).toEqual([10, 110, 210]);
    expect(geometry?.points[0]?.y).toBe(120);
    // 100 / (100 * 1.18) of the 100-unit height above the baseline.
    expect(geometry?.points[1]?.y).toBeCloseTo(120 - 100 / 1.18, 1);
    expect(geometry?.area.endsWith('L210 120 L10 120 Z')).toBe(true);
  });

  it('mirrors x in RTL but keeps the distance from the reading start', () => {
    const geometry = buildTidePath([10, 20], { ...FRAME, mirror: true });
    expect(geometry?.points.map(p => p.x)).toEqual([210, 10]);
    expect(geometry?.points.map(p => p.fromStart)).toEqual([10, 210]);
  });

  it('keeps all-zero months on the baseline', () => {
    const geometry = buildTidePath([0, 0, 0], FRAME);
    expect(geometry?.points.every(p => p.y === 120)).toBe(true);
  });

  it('draws one month as a flat line with one point', () => {
    const geometry = buildTidePath([40], FRAME);
    expect(geometry?.points).toHaveLength(1);
    expect(geometry?.points[0]?.x).toBe(210);
  });
});
