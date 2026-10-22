import type { MobileRule } from '@/core/market';
import type { PayoutMethodFormValues } from '../../schemas/payoutMethodSchema';
import type { PayoutMethod } from '../../types';
import {
  emptyPayoutMethodForm,
  isValidAccountCode,
  isValidAccountNumber,
  isValidIban,
  inferPayoutGroup,
  maskTail,
  type PayoutChannelRef,
  toPayoutDetails,
  toPayoutMethodForm,
  toPayoutMethodPatch,
} from '../payoutMethodForm';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const SYRIA: MobileRule = { countryCode: 'SY', mobilePattern: '^\\+9639\\d{8}$', mobileExample: '+963944123456' };

const HARAM: PayoutChannelRef = { code: 'haram', group: 'exchange_office' };
const MTN: PayoutChannelRef = { code: 'mtn_cash', group: 'e_wallet' };
const SHAM: PayoutChannelRef = { code: 'sham_cash', group: 'e_wallet' };
const BANK: PayoutChannelRef = { code: 'bank', group: 'bank' };

const values = (overrides: Partial<PayoutMethodFormValues> = {}): PayoutMethodFormValues => ({
  ...emptyPayoutMethodForm(false, SYRIA),
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
    expect(toPayoutDetails(values(), HARAM, SYRIA)).toEqual({
      holder_name: 'Anas Alsaadi',
      phone: '+963944123456',
      governorate: 'damascus',
      city: 'Mezzeh',
    });
    expect(toPayoutDetails(values(), MTN, SYRIA)).toEqual({ holder_name: 'Anas Alsaadi', phone: '+963944123456' });
    expect(toPayoutDetails(values({ accountCode: ' Sc-0042 ' }), SHAM, SYRIA)).toEqual({
      holder_name: 'Anas Alsaadi',
      phone: '+963944123456',
      account_code: 'Sc-0042',
    });
  });

  it('normalises bank numbers and leaves an empty IBAN out', () => {
    expect(toPayoutDetails(values(), BANK, SYRIA)).toEqual({
      holder_name: 'Anas Alsaadi',
      bank_name: 'CBS',
      account_number: '010244103390',
      iban: 'GB82WEST12345698765432',
    });
    expect(toPayoutDetails(values({ iban: ' ' }), BANK, SYRIA)).not.toHaveProperty('iban');
  });
});

describe('emptyPayoutMethodForm', () => {
  it('prefills the name and a mobile of the market only', () => {
    const form = emptyPayoutMethodForm(true, SYRIA, { holderName: ' Anas ', phone: '+963944123456' });
    expect(form).toMatchObject({ holderName: 'Anas', phone: '0944123456', makeDefault: true });
    expect(emptyPayoutMethodForm(false, SYRIA, { phone: '+971501234567' }).phone).toBe('');
  });
});

describe('toPayoutMethodPatch', () => {
  it('is empty when nothing changed', () => {
    expect(toPayoutMethodPatch(toPayoutMethodForm(office, SYRIA), office, HARAM, SYRIA)).toEqual({});
  });

  it('clears an emptied label and sends the whole details when one changed', () => {
    const patch = toPayoutMethodPatch({ ...toPayoutMethodForm(office, SYRIA), label: ' ', city: 'Kafr Souseh' }, office, HARAM, SYRIA);
    expect(patch).toEqual({
      label: null,
      details: { holder_name: 'Anas Alsaadi', phone: '+963944123456', governorate: 'damascus', city: 'Kafr Souseh' },
    });
  });
});

describe('inferPayoutGroup', () => {
  it('reads the kind of details off a method whose channel left the catalog', () => {
    expect(inferPayoutGroup({ holder_name: 'A', bank_name: 'CBS', account_number: '123456' })).toBe('bank');
    expect(inferPayoutGroup({ holder_name: 'A', phone: '+963944123456', governorate: 'damascus' })).toBe('exchange_office');
    expect(inferPayoutGroup({ holder_name: 'A', phone: '+963944123456' })).toBe('e_wallet');
  });
});
