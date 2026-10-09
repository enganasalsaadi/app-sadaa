import type { PayoutMethodFormValues } from '../../schemas/payoutMethodSchema';
import type { PayoutMethod } from '../../types';
import {
  emptyPayoutMethodForm,
  isValidAccountCode,
  isValidAccountNumber,
  isValidIban,
  maskTail,
  toPayoutDetails,
  toPayoutMethodForm,
  toPayoutMethodPatch,
  toSyrianMobile,
} from '../payoutMethodForm';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const values = (overrides: Partial<PayoutMethodFormValues> = {}): PayoutMethodFormValues => ({
  ...emptyPayoutMethodForm(false),
  holderName: ' Anas Alsaadi ',
  phone: '0944123456',
  governorate: 'damascus',
  city: ' Mezzeh ',
  bankName: 'CBS',
  accountNumber: '0102 4410-3390',
  iban: 'gb82 west 1234 5698 7654 32',
  label: ' Home ',
  ...overrides,
});

const office: PayoutMethod = {
  id: 'pm-1',
  channel: 'haram',
  channel_label: null,
  label: 'Home',
  is_default: true,
  details: { holder_name: 'Anas Alsaadi', phone: '+963944123456', governorate: 'damascus', city: 'Mezzeh' },
  currencies: ['USD', 'SYP'],
};

describe('toSyrianMobile', () => {
  it('accepts Syrian mobiles typed with or without the leading 0', () => {
    expect(toSyrianMobile('0944123456', 'SY')).toBe('+963944123456');
    expect(toSyrianMobile('944123456', 'SY')).toBe('+963944123456');
  });

  it('rejects landlines, short numbers and other countries', () => {
    expect(toSyrianMobile('112345678', 'SY')).toBeNull();
    expect(toSyrianMobile('94412', 'SY')).toBeNull();
    expect(toSyrianMobile('501234567', 'AE')).toBeNull();
  });
});

describe('account number and IBAN', () => {
  it('allows spaces and dashes, 6 to 30 digits or Latin letters', () => {
    expect(isValidAccountNumber('0102 4410-3390')).toBe(true);
    expect(isValidAccountNumber('12345')).toBe(false);
    expect(isValidAccountNumber('1'.repeat(31))).toBe(false);
    expect(isValidAccountNumber('١٢٣٤٥٦٧')).toBe(false);
  });

  it('checks the IBAN shape and its mod-97 digits', () => {
    expect(isValidIban('GB82 WEST 1234 5698 7654 32')).toBe(true);
    expect(isValidIban('de89370400440532013000')).toBe(true);
    expect(isValidIban('GB82WEST12345698765431')).toBe(false);
    expect(isValidIban('SY12')).toBe(false);
  });
});

describe('maskTail', () => {
  it('shows only the last four characters', () => {
    expect(maskTail('+963944123456')).toBe('•••• 3456');
    expect(maskTail('0102-4410')).toBe('•••• 4410');
    expect(maskTail('12')).toBeNull();
    expect(maskTail(undefined)).toBeNull();
  });
});

describe('isValidAccountCode', () => {
  it('takes 4 to 64 Latin letters, digits or dashes, keeping case', () => {
    expect(isValidAccountCode('Sc-0042')).toBe(true);
    expect(isValidAccountCode(' ab12 ')).toBe(true);
    expect(isValidAccountCode('abc')).toBe(false);
    expect(isValidAccountCode('x'.repeat(65))).toBe(false);
    expect(isValidAccountCode('ab_12')).toBe(false);
    expect(isValidAccountCode('١٢٣٤')).toBe(false);
  });
});

describe('toPayoutDetails', () => {
  it('sends only the channel keys, trimmed and in E.164', () => {
    expect(toPayoutDetails(values(), 'haram')).toEqual({
      holder_name: 'Anas Alsaadi',
      phone: '+963944123456',
      governorate: 'damascus',
      city: 'Mezzeh',
    });
    expect(toPayoutDetails(values(), 'mtn_cash')).toEqual({ holder_name: 'Anas Alsaadi', phone: '+963944123456' });
    expect(toPayoutDetails(values({ accountCode: ' Sc-0042 ' }), 'sham_cash')).toEqual({
      holder_name: 'Anas Alsaadi',
      phone: '+963944123456',
      account_code: 'Sc-0042',
    });
  });

  it('normalises bank numbers and leaves an empty IBAN out', () => {
    expect(toPayoutDetails(values(), 'bank')).toEqual({
      holder_name: 'Anas Alsaadi',
      bank_name: 'CBS',
      account_number: '010244103390',
      iban: 'GB82WEST12345698765432',
    });
    expect(toPayoutDetails(values({ iban: ' ' }), 'bank')).not.toHaveProperty('iban');
  });
});

describe('emptyPayoutMethodForm', () => {
  it('prefills the name and a Syrian mobile only', () => {
    const form = emptyPayoutMethodForm(true, { holderName: ' Anas ', phone: '+963944123456' });
    expect(form).toMatchObject({ holderName: 'Anas', phone: '944123456', makeDefault: true });
    expect(emptyPayoutMethodForm(false, { phone: '+971501234567' }).phone).toBe('');
  });
});

describe('toPayoutMethodPatch', () => {
  it('is empty when nothing changed', () => {
    expect(toPayoutMethodPatch(toPayoutMethodForm(office), office)).toEqual({});
  });

  it('clears an emptied label and sends the whole details when one changed', () => {
    const patch = toPayoutMethodPatch({ ...toPayoutMethodForm(office), label: ' ', city: 'Kafr Souseh' }, office);
    expect(patch).toEqual({
      label: null,
      details: { holder_name: 'Anas Alsaadi', phone: '+963944123456', governorate: 'damascus', city: 'Kafr Souseh' },
    });
  });
});
