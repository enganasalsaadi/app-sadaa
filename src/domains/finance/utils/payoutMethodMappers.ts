import { isCurrencyCode, type CurrencyCode } from '@/core/money';
import { PAYMENT_CHANNELS } from '../types';
import type { PayoutDetails, PayoutDetailsDto, PayoutMethod, PayoutMethodDto } from '../types';
import { isOneOf } from './walletMappers';

const text = (value: string | null | undefined): string | undefined => value?.trim() || undefined;

const toDetails = (dto: PayoutDetailsDto | null | undefined): PayoutDetails => {
  const details: PayoutDetails = { holder_name: text(dto?.holder_name) ?? '' };
  const phone = text(dto?.phone);
  const governorate = text(dto?.governorate);
  const city = text(dto?.city);
  const bankName = text(dto?.bank_name);
  const accountNumber = text(dto?.account_number);
  const iban = text(dto?.iban);
  const accountCode = text(dto?.account_code);
  if (phone) details.phone = phone;
  if (governorate) details.governorate = governorate;
  if (city) details.city = city;
  if (bankName) details.bank_name = bankName;
  if (accountNumber) details.account_number = accountNumber;
  if (iban) details.iban = iban;
  if (accountCode) details.account_code = accountCode;
  return details;
};

const pinPrimary = (methods: PayoutMethod[]): PayoutMethod[] => {
  const primary = methods.find(method => method.is_default);
  return primary ? [primary, ...methods.filter(method => method !== primary)] : methods;
};

/** `null` for a channel this build doesn't know (a newer server): the list skips it. */
export const mapPayoutMethod = (dto: PayoutMethodDto): PayoutMethod | null => {
  if (!isOneOf(PAYMENT_CHANNELS, dto.channel)) return null;
  return {
    id: dto.id,
    channel: dto.channel,
    channel_label: text(dto.channel_label) ?? null,
    label: text(dto.label) ?? null,
    is_default: dto.is_default === true,
    details: toDetails(dto.details),
    currencies: (dto.currencies ?? []).filter((code): code is CurrencyCode => isCurrencyCode(code)),
  };
};

/** Server order (primary, then newest), with the primary pinned first even if an old server doesn't. */
export const mapPayoutMethods = (dtos: PayoutMethodDto[] | null | undefined): PayoutMethod[] => {
  const methods = (dtos ?? []).map(mapPayoutMethod).filter((method): method is PayoutMethod => method !== null);
  return pinPrimary(methods);
};

const mapPrimary = (methods: PayoutMethod[], defaultId: string | null): PayoutMethod[] => {
  const flagged = methods.map(method =>
    method.is_default === (method.id === defaultId) ? method : { ...method, is_default: method.id === defaultId },
  );
  return pinPrimary(flagged);
};

/** The list after a delete: the method gone, the server's new primary flagged and first. */
export const removePayoutMethod = (
  methods: PayoutMethod[],
  id: string,
  defaultId: string | null,
): PayoutMethod[] =>
  mapPrimary(
    methods.filter(method => method.id !== id),
    defaultId,
  );


/**
 * Who becomes primary when `id` (the primary) is deleted: the newest remaining one,
 * i.e. the first after it in server order (handoff §7). `null` when it isn't the primary or is the last.
 */
export const nextPrimaryAfterDelete = (methods: PayoutMethod[], id: string): PayoutMethod | null => {
  const target = methods.find(method => method.id === id);
  if (!target?.is_default) return null;
  return methods.find(method => method.id !== id) ?? null;
};
