import { detectScript } from '../textScript';

describe('detectScript', () => {
  it('is latin for Latin words and digits', () => {
    expect(detectScript('Recommended')).toBe('latin');
    expect(detectScript('1,250.00 $')).toBe('latin');
  });

  it('is arabic when any Arabic letter is present', () => {
    expect(detectScript('الأحدث')).toBe('arabic');
    expect(detectScript('1,250 ل.س')).toBe('arabic');
    expect(detectScript('ﻻ')).toBe('arabic');
  });

  it('is null for empty or whitespace-only text', () => {
    expect(detectScript('')).toBeNull();
    expect(detectScript('  ')).toBeNull();
  });
});
