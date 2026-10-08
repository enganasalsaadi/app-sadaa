import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetRateCardCatalogQuery, type RateCardCatalog } from '@/core/api';
import type { InfluencerWizardStackParamList } from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import {
  useGetInfluencerOnboardingProgressQuery,
  useInfluencerStep3RatesMutation,
} from '../../../api';
import type { RateFormRow } from '../../../components/RatePlatformCard';
import { INFLUENCER_WIZARD_STEPS } from '../../../constants/influencerOnboarding';
import { useInfluencerOnboardingFlow } from '../../../hooks/useInfluencerOnboardingFlow';
import {
  createInfluencerRatesSchema,
  DEFAULT_RATE_PRICE_BOUNDS,
  fromPriceUsd,
  toPriceUsd,
  toRatePriceBounds,
} from '../../../schemas';
import type { InfluencerRatesFormValues } from '../../../schemas';
import type { InfluencerOnboardingProgress, QuickRateCardInput } from '../../../store';
import {
  buildRateServiceGroups,
  findCatalogService,
  toPackageKey,
  toPackageValue,
} from '../../../utils/rateCatalog';

type RatesAction = 'save' | 'skip';

interface RatePlatformGroup {
  key: string;
  /** `null` = the in-person group. */
  platform: string | null;
  /** Catalog platform label; `null` for the in-person group. */
  label: string | null;
  username: string | null;
  rows: RateFormRow[];
}

/**
 * One row per catalog service of each linked platform, plus the in-person
 * services. A saved card prefills its service row (first package wins: the
 * quick form prices one package per service).
 */
const buildForm = (
  catalog: RateCardCatalog,
  profile: InfluencerOnboardingProgress['profile'] | undefined,
): { groups: RatePlatformGroup[]; values: InfluencerRatesFormValues } => {
  const saved = profile?.rate_cards ?? [];
  const accounts = profile?.platforms ?? [];
  const rates: InfluencerRatesFormValues['rates'] = [];

  const groups = buildRateServiceGroups(
    catalog,
    accounts.map(account => account.platform),
  ).map<RatePlatformGroup>(group => ({
    key: group.platform ?? 'in_person',
    platform: group.platform,
    label: group.label,
    username: accounts.find(account => account.platform === group.platform)?.username ?? null,
    rows: group.services.map(service => {
      const card = saved.find(c => c.platform === group.platform && c.service.key === service.key);
      rates.push({
        platform: group.platform,
        service: service.key,
        hasPackage: service.package !== null,
        enabled: !!card,
        packageValue: service.package
          ? toPackageKey(card?.package?.value ?? service.package.default)
          : null,
        price: card ? fromPriceUsd(card.price_usd) : null,
      });
      return { index: rates.length - 1, service };
    }),
  }));

  return { groups, values: { rates } };
};

export const useInfluencerRatesScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<InfluencerWizardStackParamList, 'InfluencerRates'>>();

  const catalogQuery = useGetRateCardCatalogQuery();
  const catalog = catalogQuery.data;
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();

  const bounds = useMemo(
    () => (catalog ? toRatePriceBounds(catalog.price_bounds) : DEFAULT_RATE_PRICE_BOUNDS),
    [catalog],
  );
  const schema = useMemo(() => createInfluencerRatesSchema(t, bounds), [t, bounds]);

  const { control, handleSubmit, formState, reset } = useForm<InfluencerRatesFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: { rates: [] },
  });

  // Built once, when the catalog first lands: later re-reads must not shift row indexes.
  const [groups, setGroups] = useState<RatePlatformGroup[] | null>(null);
  useEffect(() => {
    if (groups || !catalog) return;
    const built = buildForm(catalog, progress?.profile);
    setGroups(built.groups);
    reset(built.values);
  }, [catalog, groups, progress?.profile, reset]);

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
      if (!catalog) return;
      // Delivery days, revisions, retention and add-ons take the server defaults (handoff §4.3).
      const rateCards = values.rates.flatMap<QuickRateCardInput>(row => {
        const service = findCatalogService(catalog, row.platform, row.service);
        if (!row.enabled || !row.price || !service) return [];
        return [
          {
            platform: row.platform,
            service: row.service,
            package_value: toPackageValue(service, row.packageValue),
            price_usd: toPriceUsd(row.price),
          },
        ];
      });
      setAction('save');
      await runStep(() => saveRates({ is_skipped: false, rate_cards: rateCards }).unwrap());
      setAction(null);
    })();
  }, [catalog, handleSubmit, runStep, saveRates]);

  const onSkip = useCallback(async () => {
    setAction('skip');
    await runStep(() => saveRates({ is_skipped: true }).unwrap());
    setAction(null);
  }, [runStep, saveRates]);

  const { refetch: refetchCatalog } = catalogQuery;
  const retryCatalog = useCallback(() => {
    refetchCatalog();
  }, [refetchCatalog]);

  const rootError = formState.errors.rates?.root?.message ?? formState.errors.rates?.message;

  return {
    control,
    groups,
    catalog: {
      isLoading: !groups && catalogQuery.isLoading,
      isError: !groups && catalogQuery.isError,
      error: catalogQuery.error,
      retry: retryCatalog,
      isRetrying: catalogQuery.isFetching,
    },
    rootError,
    onSave,
    onSkip,
    isSaving: isBusy && action === 'save',
    isSkipping: isBusy && action === 'skip',
    isBusy,
    error,
  };
};
