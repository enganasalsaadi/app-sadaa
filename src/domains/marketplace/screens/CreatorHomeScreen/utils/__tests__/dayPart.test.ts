import { resolveDayPart } from '../dayPart';

describe('resolveDayPart', () => {
  it('greets the morning from 05:00 until noon', () => {
    expect(resolveDayPart(5)).toBe('morning');
    expect(resolveDayPart(11)).toBe('morning');
  });

  it('greets the evening from noon through the night', () => {
    expect(resolveDayPart(12)).toBe('evening');
    expect(resolveDayPart(23)).toBe('evening');
    expect(resolveDayPart(0)).toBe('evening');
    expect(resolveDayPart(4)).toBe('evening');
  });
});
