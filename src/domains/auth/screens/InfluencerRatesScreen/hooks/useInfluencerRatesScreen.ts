import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLookupItems } from '@/core/api';
import type { InfluencerWizardStackParamList } from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import {
  useGetInfluencerOnboardingProgressQuery,
  useInfluencerStep3RatesMutation,
} from '../../../api';
import { INFLUENCER_WIZARD_STEPS } from '../../../constants/influencerOnboarding';
import { useInfluencerOnboardingFlow } from '../../../hooks/useInfluencerOnboardingFlow';
import {
  createInfluencerRatesSchema,
  fromPriceUsd,
  isInfluencerPlatform,
  toPriceUsd,
} from '../../../schemas';
import type { InfluencerPlatform, InfluencerRatesFormValues } from '../../../schemas';
import { SERVICE_TYPES } from '../../../store';
import type { InfluencerOnboardingProgress, RateCardEntry, ServiceType } from '../../../store';

type RatesAction = 'save' | 'skip';

export interface RatePlatformGroup {
  platform: InfluencerPlatform;
  username: string;
  /** Row indexes into `rates`, one per service, in SERVICE_TYPES order. */
  rows: { index: number; service: ServiceType }[];
}

const buildForm = (
  profile: InfluencerOnboardingProgress['profile'] | undefined,
): { groups: RatePlatformGroup[]; values: InfluencerRatesFormValues } => {
  const saved = profile?.rate_cards ?? [];
  const groups: RatePlatformGroup[] = [];
  const rates: InfluencerRatesFormValues['rates'] = [];

  for (const account of profile?.platforms ?? []) {
    if (!isInfluencerPlatform(account.platform)) continue;
    const platform = account.platform;
    const rows = SERVICE_TYPES.map(service => {
      const card = saved.find(c => c.platform === platform && c.service_type === service);
      rates.push({
        platform,
        service,
        enabled: !!card,
        price: card ? fromPriceUsd(card.price_usd) : null,
      });
      return { index: rates.length - 1, service };
    });
    groups.push({ platform, username: account.username, rows });
  }
  return { groups, values: { rates } };
};

export const useInfluencerRatesScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<InfluencerWizardStackParamList, 'InfluencerRates'>>();
  const schema = useMemo(() => createInfluencerRatesSchema(t), [t]);

  // One rate row per (saved platform × service); prefilled when resuming.
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const [{ groups, values: defaultValues }] = useState(() => buildForm(progress?.profile));

  const { control, handleSubmit, formState } = useForm<InfluencerRatesFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const services = useLookupItems('service_types');
  const serviceLabel = useCallback(
    (service: ServiceType) =>
      services.items.find(item => item.value === service)?.label ?? service,
    [services.items],
  );

  const [action, setAction] = useState<RatesAction | null>(null);
  const [saveRates] = useInfluencerStep3RatesMutation();
  const { runStep, isBusy, error } = useInfluencerOnboardingFlow('rates');

  // Back edits socials: pop when underneath, otherwise (resumed here) swap it in.
  const onBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('InfluencerSocials', { fromBack: true });
  }, [navigation]);

  const step = INFLUENCER_WIZARD_STEPS.rates;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack,
  });

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      const rateCards = values.rates.flatMap<RateCardEntry>(row =>
        row.enabled && row.price
          ? [{ platform: row.platform, service_type: row.service, price_usd: toPriceUsd(row.price) }]
          : [],
      );
      setAction('save');
      await runStep(() => saveRates({ is_skipped: false, rate_cards: rateCards }).unwrap());
      setAction(null);
    })();
  }, [handleSubmit, runStep, saveRates]);

  const onSkip = useCallback(async () => {
    setAction('skip');
    await runStep(() => saveRates({ is_skipped: true }).unwrap());
    setAction(null);
  }, [runStep, saveRates]);

  const rootError = formState.errors.rates?.root?.message ?? formState.errors.rates?.message;

  return {
    control,
    groups,
    serviceLabel,
    rootError,
    onSave,
    onSkip,
    isSaving: isBusy && action === 'save',
    isSkipping: isBusy && action === 'skip',
    isBusy,
    error,
  };
};
