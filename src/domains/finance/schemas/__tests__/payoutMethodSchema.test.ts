import type { TFunction } from 'i18next';
import type { MobileRule } from '@/core/market';
import { emptyPayoutMethodForm, type PayoutChannelRef } from '../../utils/payoutMethodForm';
import { createPayoutMethodSchema, type PayoutMethodFormValues } from '../payoutMethodSchema';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as TFunction;

const SYRIA: MobileRule = { countryCode: 'SY', mobilePattern: '^\\+9639\\d{8}$', mobileExample: '+963944123456' };

const GROUP_OF = {
  syriatel_cash: 'e_wallet',
  mtn_cash: 'e_wallet',
  sham_cash: 'e_wallet',
  haram: 'exchange_office',
  fouad: 'exchange_office',
  bank: 'bank',
} as const;
const ref = (code: keyof typeof GROUP_OF): PayoutChannelRef => ({ code, group: GROUP_OF[code] });

const form = (overrides: Partial<PayoutMethodFormValues> = {}): PayoutMethodFormValues => ({
  ...emptyPayoutMethodForm(false, SYRIA),
  holderName: 'Anas Alsaadi',
  phone: '0944123456',
  ...overrides,
});

const errorsOf = async (channel: PayoutChannelRef, values: PayoutMethodFormValues) => {
  try {
    await createPayoutMethodSchema(t, channel, SYRIA).validate(values, { abortEarly: false });
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
  it('accepts an e-wallet with a name and a mobile of the market, ignoring bank and office fields', async () => {
    expect(await errorsOf(ref('syriatel_cash'), form())).toEqual({});
  });

  it('needs a Sham Cash account code: 4 to 64 letters, digits or dashes', async () => {
    expect(await errorsOf(ref('sham_cash'), form())).toEqual({ accountCode: 'validation.required' });
    expect(await errorsOf(ref('sham_cash'), form({ accountCode: 'ab1' }))).toEqual({
      accountCode: 'finance.payouts.form.errors.accountCode',
    });
    expect(await errorsOf(ref('sham_cash'), form({ accountCode: 'ab_12' }))).toEqual({
      accountCode: 'finance.payouts.form.errors.accountCode',
    });
    expect(await errorsOf(ref('sham_cash'), form({ accountCode: 'x'.repeat(65) }))).toEqual({
      accountCode: 'finance.payouts.form.errors.accountCode',
    });
    expect(await errorsOf(ref('sham_cash'), form({ accountCode: 'Sc-0042' }))).toEqual({});
    expect(await errorsOf(ref('mtn_cash'), form({ accountCode: '' }))).toEqual({});
  });

  it('needs a governorate for exchange offices; the city stays optional', async () => {
    expect(await errorsOf(ref('haram'), form())).toEqual({ governorate: 'validation.selectOne' });
    expect(await errorsOf(ref('fouad'), form({ governorate: 'aleppo' }))).toEqual({});
  });

  it('rejects a mobile typed without the leading 0', async () => {
    expect(await errorsOf(ref('syriatel_cash'), form({ phone: '944123456' }))).toEqual({
      phone: 'finance.payouts.form.errors.phone',
    });
  });

  it('rejects a landline or a number outside the market pattern', async () => {
    expect(await errorsOf(ref('syriatel_cash'), form({ phone: '0112345678' }))).toEqual({
      phone: 'finance.payouts.form.errors.phone',
    });
  });

  it('checks bank name, account number and an optional IBAN for banks', async () => {
    expect(await errorsOf(ref('bank'), form())).toEqual({
      bankName: 'validation.required',
      accountNumber: 'validation.required',
    });
    expect(
      await errorsOf(ref('bank'), form({ bankName: 'CBS', accountNumber: '1234', iban: 'GB00WEST12345698765432' })),
    ).toEqual({
      accountNumber: 'finance.payouts.form.errors.accountNumber',
      iban: 'finance.payouts.form.errors.iban',
    });
    expect(await errorsOf(ref('bank'), form({ bankName: 'CBS', accountNumber: '0102 4410 3390' }))).toEqual({});
  });

  it('limits the holder name and the label', async () => {
    expect(await errorsOf(ref('mtn_cash'), form({ holderName: 'Al', label: 'x'.repeat(41) }))).toEqual({
      holderName: 'validation.minLength',
      label: 'validation.maxLength',
    });
  });
});
