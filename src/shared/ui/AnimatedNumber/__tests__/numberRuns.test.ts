import { isRtlNumber, splitNumberRuns } from '../numberRuns';

describe('splitNumberRuns', () => {
  it('keeps the Arabic compact word whole after the number', () => {
    expect(splitNumberRuns('139.7 ألف')).toEqual([
      { kind: 'number', text: '139.7' },
      { kind: 'text', text: ' ألف' },
    ]);
  });

  it('drops bidi marks and keeps the currency symbol whole', () => {
    expect(splitNumberRuns('‏1,500 ل.س.‏')).toEqual([
      { kind: 'number', text: '1,500' },
      { kind: 'text', text: ' ل.س.' },
    ]);
  });

  it('keeps sign, separators and percent inside the number cluster', () => {
    expect(splitNumberRuns('-$1,250.00')).toEqual([
      { kind: 'text', text: '-$' },
      { kind: 'number', text: '1,250.00' },
    ]);
    expect(splitNumberRuns('-12.5%')).toEqual([{ kind: 'number', text: '-12.5%' }]);
  });

  it('splits Latin compact suffixes', () => {
    expect(splitNumberRuns('48.2K')).toEqual([
      { kind: 'number', text: '48.2' },
      { kind: 'text', text: 'K' },
    ]);
  });
});

describe('isRtlNumber', () => {
  it('is RTL only when Arabic letters surround the number', () => {
    expect(isRtlNumber('139.7 ألف')).toBe(true);
    expect(isRtlNumber('1,500 ل.س.')).toBe(true);
    expect(isRtlNumber('48.2K')).toBe(false);
    expect(isRtlNumber('1,250')).toBe(false);
  });
});
