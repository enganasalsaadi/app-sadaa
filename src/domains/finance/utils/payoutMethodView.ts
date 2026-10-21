import { Wallet, type LucideIcon } from 'lucide-react-native';
import type { CurrencyCode } from '@/core/money';
import type { PaymentChannelInfo } from '../hooks/usePaymentChannels';
import type { PaymentChannel, PayoutMethod } from '../types';
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

/** The server's name for the channel, else the market catalog's, else the raw code. */
export const payoutChannelName = (method: PayoutMethod, channel: PaymentChannelInfo | null): string =>
  method.channel_label ?? channel?.name ?? method.channel;

export const buildPayoutMethodView = (
  method: PayoutMethod,
  governorateLabel: (value: string) => string | undefined,
  findChannel: (code: PaymentChannel) => PaymentChannelInfo | null,
): PayoutMethodView => {
  const channel = findChannel(method.channel);
  const channelName = payoutChannelName(method, channel);
  const { details } = method;
  const parts = [
    method.label ? channelName : null,
    details.governorate ? governorateLabel(details.governorate) ?? null : null,
    details.bank_name ?? null,
    maskTail(details.account_number ?? details.phone),
  ].filter((part): part is string => !!part);

  return {
    id: method.id,
    icon: channel?.icon ?? Wallet,
    title: method.label ?? channelName,
    channelName,
    meta: parts.join(SEPARATOR),
    isDefault: method.is_default,
    currencies: method.currencies,
  };
};
