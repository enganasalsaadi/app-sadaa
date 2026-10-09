import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { PAYMENT_CHANNEL_DEF } from '../constants/paymentChannels';
import {
  PAYOUT_CHANNEL_EXTRA_FIELDS,
  PAYOUT_FIELD_LIMITS,
  PAYOUT_GROUP_DEF,
  type PayoutField,
} from '../constants/payoutMethods';
import type { PayoutMethodFormValues } from '../schemas/payoutMethodSchema';
import type { PaymentChannel, PayoutDetails, PayoutMethod, PayoutMethodPatch } from '../types';

/** The only phones a payout can go to: Syrian mobiles, `+9639XXXXXXXX` (handoff §7). */
const SYRIAN_MOBILE = /^\+9639\d{8}$/;
const ACCOUNT_NUMBER = /^[A-Z0-9]+$/;
const IBAN_SHAPE = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
const IBAN_MODULUS = 97;
const ACCOUNT_CODE = /^[A-Za-z0-9-]+$/;
const SPACES = /\s+/g;
const SPACES_AND_DASHES = /[\s-]+/g;
const MASK = '••••';
const TAIL_LENGTH = 4;

export const payoutFields = (channel: PaymentChannel): readonly PayoutField[] => [
  ...PAYOUT_GROUP_DEF[PAYMENT_CHANNEL_DEF[channel].group].fields,
  ...(PAYOUT_CHANNEL_EXTRA_FIELDS[channel] ?? []),
];

/** E.164 of a typed Syrian mobile ("0944…", "944…"), or `null` for anything else. */
export const toSyrianMobile = (national: string, country: CountryCode): string | null => {
  const e164 = parsePhoneNumberFromString(national, country)?.number;
  return e164 && SYRIAN_MOBILE.test(e164) ? e164 : null;
};

export const normalizeAccountNumber = (value: string): string =>
  value.replace(SPACES_AND_DASHES, '').toUpperCase();

export const isValidAccountNumber = (value: string): boolean => {
  const normalized = normalizeAccountNumber(value);
  const { min, max } = PAYOUT_FIELD_LIMITS.accountNumber;
  return ACCOUNT_NUMBER.test(normalized) && normalized.length >= min && normalized.length <= max;
};

export const normalizeIban = (value: string): string => value.replace(SPACES, '').toUpperCase();

/** ISO 13616 shape + mod-97 check digits: catches typos before the bank rejects the transfer. */
export const isValidIban = (value: string): boolean => {
  const iban = normalizeIban(value);
  const { min, max } = PAYOUT_FIELD_LIMITS.iban;
  if (iban.length < min || iban.length > max || !IBAN_SHAPE.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % IBAN_MODULUS;
  }
  return remainder === 1;
};

export const normalizeAccountCode = (value: string): string => value.replace(SPACES, '');

/** Sham Cash account code: 4–64 Latin letters, digits or dashes; case kept as typed. */
export const isValidAccountCode = (value: string): boolean => {
  const code = normalizeAccountCode(value);
  const { min, max } = PAYOUT_FIELD_LIMITS.accountCode;
  return ACCOUNT_CODE.test(code) && code.length >= min && code.length <= max;
};

/** "•••• 4567": enough to tell methods apart, never the full number on screen. */
export const maskTail = (value: string | undefined): string | null => {
  const compact = value?.replace(SPACES_AND_DASHES, '') ?? '';
  return compact.length >= TAIL_LENGTH ? `${MASK} ${compact.slice(-TAIL_LENGTH)}` : null;
};

/** National digits of a stored E.164 phone, for the phone field. */
const toNationalPhone = (e164: string | undefined): string =>
  (e164 && parsePhoneNumberFromString(e164)?.nationalNumber) || '';

interface PayoutFormPrefill {
  holderName?: string;
  /** The account phone (E.164); used only when it is a Syrian mobile. */
  phone?: string;
}

export const emptyPayoutMethodForm = (makeDefault: boolean, prefill: PayoutFormPrefill = {}): PayoutMethodFormValues => ({
  holderName: prefill.holderName?.trim() ?? '',
  countryCode: DEFAULT_PHONE_COUNTRY,
  phone: prefill.phone && SYRIAN_MOBILE.test(prefill.phone) ? toNationalPhone(prefill.phone) : '',
  governorate: '',
  city: '',
  bankName: '',
  accountNumber: '',
  iban: '',
  accountCode: '',
  label: '',
  makeDefault,
});

export const toPayoutMethodForm = (method: PayoutMethod): PayoutMethodFormValues => ({
  holderName: method.details.holder_name,
  countryCode: DEFAULT_PHONE_COUNTRY,
  phone: toNationalPhone(method.details.phone),
  governorate: method.details.governorate ?? '',
  city: method.details.city ?? '',
  bankName: method.details.bank_name ?? '',
  accountNumber: method.details.account_number ?? '',
  iban: method.details.iban ?? '',
  accountCode: method.details.account_code ?? '',
  label: method.label ?? '',
  makeDefault: method.is_default,
});

/** Only the channel's keys, trimmed; empty optional ones left out (the server drops unknown keys anyway). */
export const toPayoutDetails = (values: PayoutMethodFormValues, channel: PaymentChannel): PayoutDetails => {
  const details: PayoutDetails = { holder_name: values.holderName.trim() };
  for (const field of payoutFields(channel)) {
    switch (field) {
      case 'holderName':
        break;
      case 'phone': {
        const phone = toSyrianMobile(values.phone, values.countryCode);
        if (phone) details.phone = phone;
        break;
      }
      case 'governorate':
        if (values.governorate) details.governorate = values.governorate;
        break;
      case 'city':
        if (values.city.trim()) details.city = values.city.trim();
        break;
      case 'bankName':
        details.bank_name = values.bankName.trim();
        break;
      case 'accountNumber':
        details.account_number = normalizeAccountNumber(values.accountNumber);
        break;
      case 'iban':
        if (values.iban.trim()) details.iban = normalizeIban(values.iban);
        break;
      case 'accountCode':
        details.account_code = normalizeAccountCode(values.accountCode);
        break;
      default: {
        const _exhaustive: never = field;
        return _exhaustive;
      }
    }
  }
  return details;
};

const DETAIL_KEYS = [
  'holder_name',
  'phone',
  'governorate',
  'city',
  'bank_name',
  'account_number',
  'iban',
  'account_code',
] as const satisfies readonly (keyof PayoutDetails)[];

const sameDetails = (a: PayoutDetails, b: PayoutDetails): boolean =>
  DETAIL_KEYS.every(key => (a[key] ?? '') === (b[key] ?? ''));

/** What changed: the label (empty clears it) and/or the whole details object. */
export const toPayoutMethodPatch = (values: PayoutMethodFormValues, method: PayoutMethod): PayoutMethodPatch => {
  const patch: PayoutMethodPatch = {};
  const label = values.label.trim();
  if (label !== (method.label ?? '')) patch.label = label || null;
  const details = toPayoutDetails(values, method.channel);
  if (!sameDetails(details, method.details)) patch.details = details;
  return patch;
};
