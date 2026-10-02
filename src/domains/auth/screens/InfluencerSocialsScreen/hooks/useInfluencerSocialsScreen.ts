import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import {
  applyServerFieldErrors,
  extractServerFieldErrors,
  useGetLookupsQuery,
  useLookupItems,
} from '@/core/api';
import { useAppSelector } from '@/core/store';
import { useWizardHeader } from '@/shared/ui';
import {
  useGetInfluencerOnboardingProgressQuery,
  useInfluencerStep2SocialsMutation,
} from '../../../api';
import {
  INFLUENCER_MAX_NICHES,
  INFLUENCER_WIZARD_STEPS,
} from '../../../constants/influencerOnboarding';
import { useFollowerTierOptions } from '../../../hooks/useFollowerTierOptions';
import { useInfluencerOnboardingFlow } from '../../../hooks/useInfluencerOnboardingFlow';
import {
  createInfluencerSocialsSchema,
  INFLUENCER_PLATFORMS,
  isFollowerTier,
  isInfluencerPlatform,
} from '../../../schemas';
import type {
  InfluencerPlatform,
  InfluencerSocialsFormValues,
  PlatformAccountFormValues,
} from '../../../schemas';
import { selectPendingPhone } from '../../../store';
import type { InfluencerOnboardingProgress } from '../../../store';
import { platformRowErrors } from '../../../utils/socialLookup';
import { socialsDraftStorage } from '../../../utils/socialsDraft';

const SERVER_FIELD_MAP = {
  niches: 'niches',
  platforms: 'platforms',
} as const satisfies Record<string, keyof InfluencerSocialsFormValues>;

const fromServer = (
  profile: InfluencerOnboardingProgress['profile'] | undefined,
): InfluencerSocialsFormValues | null => {
  const niches = profile?.niches ?? [];
  const platforms = (profile?.platforms ?? []).flatMap<PlatformAccountFormValues>(entry => {
    const tier = isFollowerTier(entry.follower_tier) ? entry.follower_tier : null;
    // Only a looked-up account may lack a tier (under the lowest one).
    return isInfluencerPlatform(entry.platform) && (tier !== null || entry.tier_source === 'auto')
      ? [
          {
            platform: entry.platform,
            handle: entry.username,
            followerTier: tier,
            tierSource: entry.tier_source,
            isPrimary: entry.is_primary,
          },
        ]
      : [];
  });
  return niches.length || platforms.length ? { niches, platforms } : null;
};

interface SheetState {
  visible: boolean;
  editing: PlatformAccountFormValues | null;
}

export const useInfluencerSocialsScreen = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => createInfluencerSocialsSchema(t), [t]);

  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const pendingPhone = useAppSelector(selectPendingPhone);
  const draftOwner = progress?.phone || pendingPhone;

  // Saved server data (back from rates / resume) wins over the local draft.
  const [defaultValues] = useState<InfluencerSocialsFormValues>(
    () =>
      fromServer(progress?.profile) ??
      socialsDraftStorage.load(draftOwner) ?? { niches: [], platforms: [] },
  );

  const { control, handleSubmit, setError, setValue, formState } =
    useForm<InfluencerSocialsFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues,
    });
  const niches = useWatch({ control, name: 'niches' });
  const platforms = useWatch({ control, name: 'platforms' });

  useEffect(() => {
    if (draftOwner) socialsDraftStorage.save(draftOwner, { niches, platforms });
  }, [draftOwner, niches, platforms]);

  const nicheItems = useLookupItems('niches');
  const tiers = useFollowerTierOptions();
  const { data: lookups } = useGetLookupsQuery();
  const lookupPlatforms = lookups?.social_platforms;
  const supportsLookup = useCallback(
    (platform: InfluencerPlatform) =>
      lookupPlatforms?.find(entry => entry.id === platform)?.supports_lookup ?? false,
    [lookupPlatforms],
  );
  const [rowErrors, setRowErrors] = useState<Partial<Record<InfluencerPlatform, string>>>({});
  const clearRowError = useCallback(
    (platform: InfluencerPlatform) =>
      setRowErrors(prev => {
        if (prev[platform] === undefined) return prev;
        const next = { ...prev };
        delete next[platform];
        return next;
      }),
    [],
  );

  const [saveSocials] = useInfluencerStep2SocialsMutation();
  const { runStep, isBusy, error } = useInfluencerOnboardingFlow('socials');

  const step = INFLUENCER_WIZARD_STEPS.socials;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
  });

  const [sheet, setSheet] = useState<SheetState>({
    visible: false,
    editing: null,
  });

  const availablePlatforms = useMemo<InfluencerPlatform[]>(
    () =>
      INFLUENCER_PLATFORMS.filter(
        platform =>
          platform === sheet.editing?.platform ||
          !platforms.some(account => account.platform === platform),
      ),
    [platforms, sheet.editing],
  );

  const setPlatforms = useCallback(
    (next: PlatformAccountFormValues[]) =>
      setValue('platforms', next, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      }),
    [formState.isSubmitted, setValue],
  );

  const openAdd = useCallback(() => setSheet({ visible: true, editing: null }), []);
  const closeSheet = useCallback(() => setSheet(prev => ({ ...prev, visible: false })), []);

  const onEdit = useCallback(
    (platform: InfluencerPlatform) =>
      setSheet({
        visible: true,
        editing: platforms.find(account => account.platform === platform) ?? null,
      }),
    [platforms],
  );

  const onRemove = useCallback(
    (platform: InfluencerPlatform) => {
      setPlatforms(platforms.filter(account => account.platform !== platform));
      clearRowError(platform);
    },
    [clearRowError, platforms, setPlatforms],
  );

  const onSaveAccount = useCallback(
    (account: PlatformAccountFormValues) => {
      const exists = platforms.some(item => item.platform === account.platform);
      // At most one primary (contract §5.2): choosing one demotes the rest.
      const others = account.isPrimary
        ? platforms.map(item => (item.isPrimary ? { ...item, isPrimary: false } : item))
        : platforms;
      setPlatforms(
        exists
          ? others.map(item => (item.platform === account.platform ? account : item))
          : [...others, account],
      );
      clearRowError(account.platform);
      setSheet(prev => ({ ...prev, visible: false }));
    },
    [clearRowError, platforms, setPlatforms],
  );

  const onChangeNiches = useCallback(
    (next: string[]) =>
      setValue('niches', next, {
        shouldDirty: true,
        shouldValidate: formState.isSubmitted,
      }),
    [formState.isSubmitted, setValue],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      setRowErrors({});
      const ok = await runStep(
        () =>
          saveSocials({
            niches: values.niches,
            // Any known tier is sent: the server ignores it when it holds
            // lookup data, and needs it otherwise (contract §5.2).
            platforms: values.platforms.map(account => ({
              platform: account.platform,
              handle: account.handle,
              ...(account.followerTier ? { follower_tier: account.followerTier } : {}),
              ...(account.isPrimary ? { is_primary: true } : {}),
            })),
          }).unwrap(),
        {
          onFieldErrors: err => {
            const rows = platformRowErrors(
              extractServerFieldErrors(err),
              values.platforms.map(account => account.platform),
            );
            setRowErrors(rows);
            const applied = applyServerFieldErrors(err, SERVER_FIELD_MAP, setError);
            return applied || Object.keys(rows).length > 0;
          },
        },
      );
      if (ok) socialsDraftStorage.clear();
    })();
  }, [handleSubmit, runStep, saveSocials, setError]);

  return {
    niches,
    onChangeNiches,
    nicheItems,
    maxNiches: INFLUENCER_MAX_NICHES,
    nichesError: formState.errors.niches?.message,
    platforms,
    platformsError: formState.errors.platforms?.message,
    rowErrors,
    canAddPlatform: platforms.length < INFLUENCER_PLATFORMS.length,
    openAdd,
    onEdit,
    onRemove,
    sheet: {
      visible: sheet.visible,
      initial: sheet.editing,
      platforms: availablePlatforms,
      supportsLookup,
      tiers: tiers.options,
      tiersLoading: tiers.isLoading,
      onSave: onSaveAccount,
      onClose: closeSheet,
    },
    lookupsFailed: nicheItems.isError,
    retryLookups: nicheItems.refetch,
    onSubmit,
    isSaving: isBusy,
    error,
  };
};
