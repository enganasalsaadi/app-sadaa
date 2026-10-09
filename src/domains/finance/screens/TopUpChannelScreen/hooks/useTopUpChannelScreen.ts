import { useCallback, useMemo } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';
import type { TopUpStackScreenProps } from '@/core/navigation';
import { channelCurrenciesKey, PAYMENT_CHANNEL_DEF } from '../../../constants/paymentChannels';
import { useTopUpFlow } from '../../../hooks/useTopUpFlow';
import { TOP_UP_STEP_FIELDS, type TopUpFormValues } from '../../../schemas/topUpSchema';
import { PAYMENT_CHANNEL_GROUPS } from '../../../types';
import type { PaymentChannel, TopUpChannelOption } from '../../../types';

type Navigation = TopUpStackScreenProps<'TopUpChannel'>['navigation'];

export interface ChannelOptionView {
  channel: PaymentChannel;
  label: string;
  caption: string;
  enabled: boolean;
  icon: LucideIcon;
}

export interface ChannelGroupView {
  key: string;
  label: string;
  options: ChannelOptionView[];
}

const RATE_REASONS: readonly (string | null)[] = ['fx_rate_stale', 'fx_rate_unavailable'];

/**
 * Step 1: where the brand sends the money from, grouped (offices, e-wallets, banks).
 * A dimmed channel says why (paused, the rate being updated); the stale-rate notice
 * explains that dollars still work.
 */
export const useTopUpChannelScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const flow = useTopUpFlow();
  const { control, setValue, trigger, setError } = useFormContext<TopUpFormValues>();
  const channel = useWatch({ control, name: 'channel' });
  const { errors } = useFormState({ control, name: 'channel' });

  const captionOf = useCallback(
    (option: TopUpChannelOption): string => {
      if (!option.enabled) return option.disabledLabel ?? t('finance.topUp.disabled.channelPaused');
      const currencies = t(channelCurrenciesKey(option.currencies));
      return option.processingTimeLabel ? `${currencies} · ${option.processingTimeLabel}` : currencies;
    },
    [t],
  );

  const options = flow.channels?.channels;
  const groups = useMemo<ChannelGroupView[]>(() => {
    if (!options) return [];
    return PAYMENT_CHANNEL_GROUPS.flatMap(group => {
      const members = options.filter(option => option.group === group);
      const first = members[0];
      if (!first) return [];
      return [
        {
          key: group,
          label: first.groupLabel,
          options: members.map(option => ({
            channel: option.channel,
            label: option.label,
            caption: captionOf(option),
            enabled: option.enabled,
            icon: PAYMENT_CHANNEL_DEF[option.channel].icon,
          })),
        },
      ];
    });
  }, [captionOf, options]);

  const rateNotice = useMemo(
    () => options?.some(option => !option.enabled && RATE_REASONS.includes(option.disabledReason)) ?? false,
    [options],
  );

  const { setNotice } = flow;
  const onSelect = useCallback(
    (value: PaymentChannel) => {
      setValue('channel', value, { shouldDirty: true, shouldValidate: true });
      setNotice(null);
    },
    [setNotice, setValue],
  );

  const enabled = flow.selected?.enabled ?? false;
  const onContinue = useCallback(async () => {
    const valid = await trigger(TOP_UP_STEP_FIELDS.channel);
    if (!valid) return;
    // A channel paused since it was picked (or prefilled) can't be used.
    if (!enabled) {
      setError('channel', { message: t('finance.topUp.channel.required') });
      return;
    }
    navigation.navigate('TopUpAmount');
  }, [enabled, navigation, setError, t, trigger]);

  return {
    status: flow.channelsStatus,
    retry: flow.refetchChannels,
    groups,
    selected: enabled ? channel : null,
    onSelect,
    error: errors.channel?.message ?? null,
    rateNotice,
    pausedNotice: flow.notice === 'channelPaused',
    onContinue,
  };
};

export type TopUpChannelScreenModel = ReturnType<typeof useTopUpChannelScreen>;
