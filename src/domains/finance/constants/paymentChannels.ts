import { Landmark, Smartphone, Store, type LucideIcon } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import type { CurrencyCode } from '@/core/money';
import type { PaymentChannel, PaymentChannelGroup } from '../types';

interface PaymentChannelDef {
  group: PaymentChannelGroup;
  icon: LucideIcon;
  labelKey: ParseKeys;
  /** What the channel takes when the rate is fresh; Syriatel and MTN are SYP only. */
  currencies: readonly CurrencyCode[];
}

/** The app's own words and icons per channel, for top-ups and payouts; server labels win when they come. */
export const PAYMENT_CHANNEL_DEF = {
  haram: { group: 'exchange_office', icon: Store, labelKey: 'finance.channels.names.haram', currencies: ['USD', 'SYP'] },
  fouad: { group: 'exchange_office', icon: Store, labelKey: 'finance.channels.names.fouad', currencies: ['USD', 'SYP'] },
  syriatel_cash: {
    group: 'e_wallet',
    icon: Smartphone,
    labelKey: 'finance.channels.names.syriatelCash',
    currencies: ['SYP'],
  },
  mtn_cash: { group: 'e_wallet', icon: Smartphone, labelKey: 'finance.channels.names.mtnCash', currencies: ['SYP'] },
  sham_cash: {
    group: 'e_wallet',
    icon: Smartphone,
    labelKey: 'finance.channels.names.shamCash',
    currencies: ['USD', 'SYP'],
  },
  bank: { group: 'bank', icon: Landmark, labelKey: 'finance.channels.names.bank', currencies: ['USD', 'SYP'] },
} as const satisfies Record<PaymentChannel, PaymentChannelDef>;

export const PAYMENT_GROUP_LABEL = {
  exchange_office: 'finance.channels.groups.exchangeOffice',
  e_wallet: 'finance.channels.groups.eWallet',
  bank: 'finance.channels.groups.bank',
} as const satisfies Record<PaymentChannelGroup, ParseKeys>;

/** "USD or SYP" / "SYP only" under a channel in the pickers. */
export const channelCurrenciesKey = (currencies: readonly CurrencyCode[]): ParseKeys => {
  const usd = currencies.includes('USD');
  const syp = currencies.includes('SYP');
  if (usd && syp) return 'finance.channels.currencies.both';
  return usd ? 'finance.channels.currencies.usdOnly' : 'finance.channels.currencies.sypOnly';
};
