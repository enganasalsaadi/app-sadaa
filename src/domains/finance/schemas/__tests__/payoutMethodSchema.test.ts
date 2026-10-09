import type { TFunction } from 'i18next';
import { emptyPayoutMethodForm } from '../../utils/payoutMethodForm';
import { createPayoutMethodSchema, type PayoutMethodFormValues } from '../payoutMethodSchema';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as TFunction;

const form = (overrides: Partial<PayoutMethodFormValues> = {}): PayoutMethodFormValues => ({
  ...emptyPayoutMethodForm(false),
  holderName: 'Anas Alsaadi',
  phone: '944123456',
  ...overrides,
});

const errorsOf = async (channel: Parameters<typeof createPayoutMethodSchema>[1], values: PayoutMethodFormValues) => {
  try {
    await createPayoutMethodSchema(t, channel).validate(values, { abortEarly: false });
    return {};
  } catch (err) {
    const { inner } = err as { inner: { path: string; message: string }[] };
    // First message per field, as the form shows it.
    const first: Record<string, string> = {};
    for (const { path, message } of inner) first[path] ??= message;
    return first;
  }
};

describe('createPayoutMethodSchema', () => {
  it('accepts an e-wallet with a name and a Syrian mobile, ignoring bank and office fields', async () => {
    expect(await errorsOf('sham_cash', form())).toEqual({});
  });

  it('needs a governorate for exchange offices; the city stays optional', async () => {
    expect(await errorsOf('haram', form())).toEqual({ governorate: 'validation.selectOne' });
    expect(await errorsOf('fouad', form({ governorate: 'aleppo' }))).toEqual({});
  });

  it('rejects a non-Syrian or landline phone', async () => {
    expect(await errorsOf('syriatel_cash', form({ phone: '112345678' }))).toEqual({
      phone: 'finance.payouts.form.errors.phone',
    });
  });

  it('checks bank name, account number and an optional IBAN for banks', async () => {
    expect(await errorsOf('bank', form())).toEqual({
      bankName: 'validation.required',
      accountNumber: 'validation.required',
    });
    expect(
      await errorsOf('bank', form({ bankName: 'CBS', accountNumber: '1234', iban: 'GB00WEST12345698765432' })),
    ).toEqual({
      accountNumber: 'finance.payouts.form.errors.accountNumber',
      iban: 'finance.payouts.form.errors.iban',
    });
    expect(await errorsOf('bank', form({ bankName: 'CBS', accountNumber: '0102 4410 3390' }))).toEqual({});
  });

  it('limits the holder name and the label', async () => {
    expect(await errorsOf('mtn_cash', form({ holderName: 'Al', label: 'x'.repeat(41) }))).toEqual({
      holderName: 'validation.minLength',
      label: 'validation.maxLength',
    });
  });
});
