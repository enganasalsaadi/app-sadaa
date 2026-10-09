import type { TFunction } from 'i18next';
import type { LucideIcon } from 'lucide-react-native';
import type { CurrencyCode } from '@/core/money';
import { PAYMENT_CHANNEL_DEF } from '../constants/paymentChannels';
import type { PayoutMethod } from '../types';
import { maskTail } from './payoutMethodForm';

const SEPARATOR = ' · ';

/** One saved method as the list, the wallet card and the delete sheet show it. */
export interface PayoutMethodView {
  id: string;
  icon: LucideIcon;
  /** The creator's own name for it, else the channel's. */
  title: string;
  channelName: string;
  /** Channel (when a label took the title) · governorate · bank · masked number. */
  meta: string;
  isDefault: boolean;
  currencies: CurrencyCode[];
}

export const payoutChannelName = (method: PayoutMethod, t: TFunction): string =>
  method.channel_label ?? t(PAYMENT_CHANNEL_DEF[method.channel].labelKey);

export const buildPayoutMethodView = (
  method: PayoutMethod,
  t: TFunction,
  governorateLabel: (value: string) => string | undefined,
): PayoutMethodView => {
  const channelName = payoutChannelName(method, t);
  const { details } = method;
  const parts = [
    method.label ? channelName : null,
    details.governorate ? governorateLabel(details.governorate) ?? null : null,
    details.bank_name ?? null,
    maskTail(details.account_number ?? details.phone),
  ].filter((part): part is string => !!part);

  return {
    id: method.id,
    icon: PAYMENT_CHANNEL_DEF[method.channel].icon,
    title: method.label ?? channelName,
    channelName,
    meta: parts.join(SEPARATOR),
    isDefault: method.is_default,
    currencies: method.currencies,
  };
};
