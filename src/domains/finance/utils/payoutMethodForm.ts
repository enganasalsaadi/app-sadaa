import { matchesMobilePattern, toMarketMobile, toNationalDigits, type MobileRule } from '@/core/market';
import {
  PAYOUT_CHANNEL_EXTRA_FIELDS,
  PAYOUT_FIELD_LIMITS,
  PAYOUT_GROUP_DEF,
  type PayoutField,
} from '../constants/payoutMethods';
import type { PayoutMethodFormValues } from '../schemas/payoutMethodSchema';
import type { PaymentChannel, PaymentChannelGroup, PayoutDetails, PayoutMethod, PayoutMethodPatch } from '../types';

const ACCOUNT_NUMBER = /^[A-Z0-9]+$/;
const IBAN_SHAPE = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
const IBAN_MODULUS = 97;
const ACCOUNT_CODE = /^[A-Za-z0-9-]+$/;
const SPACES = /\s+/g;
const SPACES_AND_DASHES = /[\s-]+/g;
const MASK = '••••';
const TAIL_LENGTH = 4;

/** What the form needs to know about the channel: its code and which kind of details it takes. */
export interface PayoutChannelRef {
  code: PaymentChannel;
  group: PaymentChannelGroup;
}

export const payoutFields = (channel: PayoutChannelRef): readonly PayoutField[] => [
  ...PAYOUT_GROUP_DEF[channel.group].fields,
  ...(PAYOUT_CHANNEL_EXTRA_FIELDS[channel.code] ?? []),
];

/**
 * The kind of details a saved method holds when its channel is no longer in the market's
 * catalog: read off the details themselves, so the method can still be shown and deleted.
 */
export const inferPayoutGroup = (details: PayoutDetails): PaymentChannelGroup => {
  if (details.bank_name || details.account_number || details.iban) return 'bank';
  if (details.governorate || details.city) return 'exchange_office';
  return 'e_wallet';
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

interface PayoutFormPrefill {
  holderName?: string;
  /** The account phone (E.164); used only when it is a mobile of the market. */
  phone?: string;
}

export const emptyPayoutMethodForm = (
  makeDefault: boolean,
  mobile: MobileRule,
  prefill: PayoutFormPrefill = {},
): PayoutMethodFormValues => ({
  holderName: prefill.holderName?.trim() ?? '',
  countryCode: mobile.countryCode,
  phone: prefill.phone && matchesMobilePattern(prefill.phone, mobile.mobilePattern) ? toNationalDigits(prefill.phone) : '',
  governorate: '',
  city: '',
  bankName: '',
  accountNumber: '',
  iban: '',
  accountCode: '',
  label: '',
  makeDefault,
});

export const toPayoutMethodForm = (method: PayoutMethod, mobile: MobileRule): PayoutMethodFormValues => ({
  holderName: method.details.holder_name,
  countryCode: mobile.countryCode,
  phone: toNationalDigits(method.details.phone),
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
export const toPayoutDetails = (
  values: PayoutMethodFormValues,
  channel: PayoutChannelRef,
  mobile: MobileRule | null,
): PayoutDetails => {
  const details: PayoutDetails = { holder_name: values.holderName.trim() };
  for (const field of payoutFields(channel)) {
    switch (field) {
      case 'holderName':
        break;
      case 'phone': {
        const phone = toMarketMobile(values.phone, mobile);
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
export const toPayoutMethodPatch = (
  values: PayoutMethodFormValues,
  method: PayoutMethod,
  channel: PayoutChannelRef,
  mobile: MobileRule | null,
): PayoutMethodPatch => {
  const patch: PayoutMethodPatch = {};
  const label = values.label.trim();
  if (label !== (method.label ?? '')) patch.label = label || null;
  const details = toPayoutDetails(values, channel, mobile);
  if (!sameDetails(details, method.details)) patch.details = details;
  return patch;
};
