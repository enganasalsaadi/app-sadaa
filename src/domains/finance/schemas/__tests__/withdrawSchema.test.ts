import type { TFunction } from 'i18next';
import { createWithdrawSchema, type WithdrawFormValues } from '../withdrawSchema';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);
jest.mock('@/core/i18n', () => ({
  formatMoney: ({ amount, currency }: { amount: number; currency: string }) => `${amount} ${currency}`,
}));

const t = ((key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key)) as TFunction;

const available = { amount: 248_050, currency: 'USD' as const };

const valid: WithdrawFormValues = {
  payoutMethodId: 'pm1',
  currency: 'SYP',
  amount: { amount: 20_000, currency: 'USD' },
};

const errorOf = async (values: WithdrawFormValues, path: string, balance = available) => {
  try {
    await createWithdrawSchema(t, { available: balance, lang: 'en' }).validateAt(path, values);
    return null;
  } catch (err) {
    return (err as Error).message;
  }
};

describe('createWithdrawSchema', () => {
  it('accepts a complete request', async () => {
    await expect(createWithdrawSchema(t, { available, lang: 'en' }).validate(valid)).resolves.toEqual(valid);
  });

  it('needs a destination and an amount', async () => {
    expect(await errorOf({ ...valid, payoutMethodId: null }, 'payoutMethodId')).toBe(
      'finance.withdraw.amount.errors.method',
    );
    expect(await errorOf({ ...valid, amount: null }, 'amount')).toBe('finance.withdraw.amount.errors.required');
    expect(await errorOf({ ...valid, amount: { amount: 0, currency: 'USD' } }, 'amount')).toBe(
      'finance.withdraw.amount.errors.required',
    );
  });

  it('applies the default $25 minimum and $500 daily cap', async () => {
    expect(await errorOf({ ...valid, amount: { amount: 2_499, currency: 'USD' } }, 'amount')).toBe(
      'finance.withdraw.amount.errors.min:{"amount":"2500 USD"}',
    );
    expect(await errorOf({ ...valid, amount: { amount: 2_500, currency: 'USD' } }, 'amount')).toBeNull();
    expect(
      await errorOf({ ...valid, amount: { amount: 50_001, currency: 'USD' } }, 'amount', {
        amount: 1_000_000,
        currency: 'USD',
      }),
    ).toBe('finance.withdraw.amount.errors.max:{"amount":"50000 USD"}');
  });

  it('never takes more than the balance, and leaves it to the quote while unknown', async () => {
    expect(
      await errorOf({ ...valid, amount: { amount: 3_000, currency: 'USD' } }, 'amount', {
        amount: 2_900,
        currency: 'USD',
      }),
    ).toBe('finance.withdraw.amount.errors.overBalance:{"amount":"2900 USD"}');
    const unknown = createWithdrawSchema(t, { available: null, lang: 'en' });
    await expect(unknown.validateAt('amount', { ...valid, amount: { amount: 40_000, currency: 'USD' } })).resolves.toEqual({
      amount: 40_000,
      currency: 'USD',
    });
  });
});
