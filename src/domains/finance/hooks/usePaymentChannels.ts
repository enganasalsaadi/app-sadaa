import { useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useActiveMarket } from '@/core/market';
import type { MarketPaymentChannel } from '@/core/market';
import type { CurrencyCode } from '@/core/money';
import { PAYMENT_CHANNEL_ICON } from '../constants/paymentChannels';
import type { PaymentChannel, PaymentChannelGroup } from '../types';

/** One channel of the user's market, ready for the pickers (name is server-localized). */
export interface PaymentChannelInfo {
  code: PaymentChannel;
  name: string;
  group: PaymentChannelGroup;
  icon: LucideIcon;
  currencies: readonly CurrencyCode[];
  supportsTopUp: boolean;
  supportsPayout: boolean;
}

export const toChannelInfo = (channel: MarketPaymentChannel): PaymentChannelInfo => ({
  code: channel.code,
  name: channel.name,
  group: channel.group,
  icon: PAYMENT_CHANNEL_ICON[channel.icon],
  currencies: channel.currencies,
  supportsTopUp: channel.supportsTopUp,
  supportsPayout: channel.supportsPayout,
});

/**
 * The money channels of the active market (rules from `GET /markets/{code}`, cached for the session).
 * `find` returns `null` for a code the market no longer offers (an old top-up or payout method).
 */
export const usePaymentChannels = () => {
  const { market, isLoading, isError, refetch } = useActiveMarket();

  const channels = useMemo(() => market?.paymentChannels.map(toChannelInfo) ?? [], [market]);
  const payoutChannels = useMemo(() => channels.filter(channel => channel.supportsPayout), [channels]);
  const find = useCallback(
    (code: PaymentChannel | null | undefined): PaymentChannelInfo | null =>
      code ? (channels.find(channel => channel.code === code) ?? null) : null,
    [channels],
  );

  return { market, channels, payoutChannels, find, isLoading, isError, refetch };
};
