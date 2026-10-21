import { Landmark, Smartphone, Store, type LucideIcon } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import type { MarketChannelIcon } from '@/core/market';
import type { CurrencyCode } from '@/core/money';
import type { PaymentChannelGroup } from '../types';

/** The server's `icon` hint per channel → the kit's icon. */
export const PAYMENT_CHANNEL_ICON = {
  store: Store,
  smartphone: Smartphone,
  landmark: Landmark,
} as const satisfies Record<MarketChannelIcon, LucideIcon>;

/** A section's icon, for rows that only know the group (top-up options). */
export const PAYMENT_GROUP_ICON = {
  exchange_office: Store,
  e_wallet: Smartphone,
  bank: Landmark,
} as const satisfies Record<PaymentChannelGroup, LucideIcon>;

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
