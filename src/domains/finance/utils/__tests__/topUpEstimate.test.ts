import { estimateCredit, fallbackLimits, parseRate, sypToUsdCents, usdCentsToSyp } from '../topUpEstimate';

// Channel icons in the constants are irrelevant here (lucide ships ESM).
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

describe('parseRate', () => {
  it('reads a decimal string as an exact fraction', () => {
    expect(parseRate('14000')).toEqual({ numerator: BigInt(14000), denominator: BigInt(1) });
    expect(parseRate('1.50')).toEqual({ numerator: BigInt(15), denominator: BigInt(10) });
  });

  it('rejects zero, negatives and anything that is not a plain decimal', () => {
    expect(parseRate('0')).toBeNull();
    expect(parseRate('0.00')).toBeNull();
    expect(parseRate('-5')).toBeNull();
    expect(parseRate('1e4')).toBeNull();
    expect(parseRate('abc')).toBeNull();
  });
});

describe('sypToUsdCents', () => {
  it('floors to whole cents (handoff: floor(amount_syp * 100 / rate))', () => {
    expect(sypToUsdCents(700_000, '14000')).toBe(5_000);
    expect(sypToUsdCents(700_000, '14000.50')).toBe(4_999);
    expect(sypToUsdCents(1, '14000')).toBe(0);
  });

  it('refuses a bad rate or amount', () => {
    expect(sypToUsdCents(700_000, 'x')).toBeNull();
    expect(sypToUsdCents(-1, '14000')).toBeNull();
    expect(sypToUsdCents(1.5, '14000')).toBeNull();
  });
});

describe('usdCentsToSyp', () => {
  it('rounds up for a lower limit and down for an upper one', () => {
    expect(usdCentsToSyp(1_000, '13999.99', 'up')).toBe(140_000);
    expect(usdCentsToSyp(1_000, '13999.99', 'down')).toBe(139_999);
    expect(usdCentsToSyp(1_000, '14000', 'up')).toBe(140_000);
  });
});

describe('estimateCredit', () => {
  it('returns a dollar amount as is', () => {
    const usd = { amount: 5_000, currency: 'USD' } as const;
    expect(estimateCredit(usd, null)).toBe(usd);
  });

  it('converts pounds at the rate, or gives up without one', () => {
    expect(estimateCredit({ amount: 700_000, currency: 'SYP' }, '14000')).toEqual({ amount: 5_000, currency: 'USD' });
    expect(estimateCredit({ amount: 700_000, currency: 'SYP' }, null)).toBeNull();
  });
});

describe('fallbackLimits', () => {
  it('is $10 – $10,000 in dollars', () => {
    expect(fallbackLimits('USD', null)).toEqual({
      min: { amount: 1_000, currency: 'USD' },
      max: { amount: 1_000_000, currency: 'USD' },
    });
  });

  it('keeps the pound range inside the dollar one', () => {
    expect(fallbackLimits('SYP', '13999.99')).toEqual({
      min: { amount: 140_000, currency: 'SYP' },
      max: { amount: 139_999_900, currency: 'SYP' },
    });
  });

  it('has no pound range without a rate', () => {
    expect(fallbackLimits('SYP', null)).toBeNull();
  });
});
