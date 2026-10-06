import { buildSparklinePath } from '../sparklinePath';

const FRAME = { width: 104, height: 54, inset: 2, mirror: false };

describe('buildSparklinePath', () => {
  it('returns null with no values or no room to draw', () => {
    expect(buildSparklinePath([], FRAME)).toBeNull();
    expect(buildSparklinePath([1, 2], { ...FRAME, width: 0 })).toBeNull();
  });

  it('scales from 0 to the peak, oldest at the start', () => {
    const geometry = buildSparklinePath([0, 5, 10], FRAME);
    expect(geometry?.line).toBe('M2 52 L52 27 L102 2');
    expect(geometry?.end).toEqual({ x: 102, y: 2 });
  });

  it('closes the area down to the baseline', () => {
    expect(buildSparklinePath([0, 10], FRAME)?.area).toBe(
      'M2 52 L102 2 L102 54 L2 54 Z',
    );
  });

  it('mirrors the time axis in RTL so the latest value sits at the reading end', () => {
    const geometry = buildSparklinePath([0, 5, 10], { ...FRAME, mirror: true });
    expect(geometry?.line).toBe('M102 52 L52 27 L2 2');
    expect(geometry?.end).toEqual({ x: 2, y: 2 });
  });

  it('keeps all zeros on the baseline', () => {
    expect(buildSparklinePath([0, 0, 0], FRAME)?.line).toBe(
      'M2 52 L52 52 L102 52',
    );
  });

  it('draws a single value as a flat line across', () => {
    expect(buildSparklinePath([7], FRAME)?.line).toBe('M2 2 L102 2');
  });
});
