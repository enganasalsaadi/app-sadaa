import type { TFunction } from 'i18next';
import { createTopUpSchema, type TopUpFormValues } from '../topUpSchema';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);
jest.mock('@/core/i18n', () => ({
  formatMoney: ({ amount, currency }: { amount: number; currency: string }) => `${amount} ${currency}`,
}));

const t = ((key: string, options?: object) => (options ? `${key}:${JSON.stringify(options)}` : key)) as TFunction;

const limits = {
  min: { amount: 1_000, currency: 'USD' as const },
  max: { amount: 1_000_000, currency: 'USD' as const },
};

const valid: TopUpFormValues = {
  channel: 'haram',
  currency: 'USD',
  amount: { amount: 5_000, currency: 'USD' },
  transferReference: ' 482913 ',
  receipt: { uri: 'file:///r.jpg', name: 'r.jpg', type: 'image/jpeg' },
};

const errorOf = async (values: TopUpFormValues, path: string) => {
  try {
    await createTopUpSchema(t, { limits, lang: 'en' }).validateAt(path, values);
    return null;
  } catch (err) {
    return (err as Error).message;
  }
};

describe('createTopUpSchema', () => {
  it('accepts a complete request and trims the reference', async () => {
    const result = await createTopUpSchema(t, { limits, lang: 'en' }).validate(valid);
    expect(result.transferReference).toBe('482913');
  });

  it('needs a channel, an amount, a reference and a receipt', async () => {
    expect(await errorOf({ ...valid, channel: null }, 'channel')).toBe('finance.topUp.channel.required');
    expect(await errorOf({ ...valid, amount: null }, 'amount')).toBe('finance.topUp.amount.errors.required');
    expect(await errorOf({ ...valid, transferReference: '   ' }, 'transferReference')).toBe(
      'finance.topUp.transfer.referenceRequired',
    );
    expect(await errorOf({ ...valid, receipt: null }, 'receipt')).toBe('finance.topUp.transfer.receiptRequired');
  });

  it('checks the amount against the channel range', async () => {
    expect(await errorOf({ ...valid, amount: { amount: 999, currency: 'USD' } }, 'amount')).toBe(
      'finance.topUp.amount.errors.min:{"amount":"1000 USD"}',
    );
    expect(await errorOf({ ...valid, amount: { amount: 1_000_001, currency: 'USD' } }, 'amount')).toBe(
      'finance.topUp.amount.errors.max:{"amount":"1000000 USD"}',
    );
    expect(await errorOf({ ...valid, amount: { amount: 1_000, currency: 'USD' } }, 'amount')).toBeNull();
  });

  it('leaves the range to the server when it is unknown or in another currency', async () => {
    const amount = { amount: 1, currency: 'SYP' as const };
    expect(await errorOf({ ...valid, currency: 'SYP', amount }, 'amount')).toBeNull();
    await expect(
      createTopUpSchema(t, { limits: null, lang: 'en' }).validateAt('amount', { ...valid, amount: { amount: 1, currency: 'USD' } }),
    ).resolves.toBeDefined();
  });

  it('caps the reference at 100 characters', async () => {
    expect(await errorOf({ ...valid, transferReference: 'x'.repeat(101) }, 'transferReference')).toBe(
      'validation.maxLength:{"count":100}',
    );
  });
});
