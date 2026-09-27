import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, useLookupItems } from '@/core/api';
import { useWizardHeader } from '@/shared/ui';
import { SOCIAL_PLATFORMS, normalizeSocialUrl } from '@/shared/utils';
import type { SocialPlatform } from '@/shared/utils';
import {
  useBrandStep2ProfileMutation,
  useGetOnboardingProgressQuery,
} from '../../../api';
import { BRAND_WIZARD_STEPS } from '../../../constants/brandOnboarding';
import { useBrandOnboardingFlow } from '../../../hooks/useBrandOnboardingFlow';
import { createBrandProfileSchema, toSocialLinksForm } from '../../../schemas';
import type { BrandProfileFormValues } from '../../../schemas';
import type { BrandSocialLink } from '../../../store';

/** Shown up front; the rest sit behind "More platforms" (progressive disclosure). */
const PRIMARY_PLATFORMS: readonly SocialPlatform[] = ['instagram', 'facebook', 'tiktok'];
const SECONDARY_PLATFORMS = SOCIAL_PLATFORMS.filter(
  platform => !PRIMARY_PLATFORMS.includes(platform),
);

const SERVER_FIELD_MAP = {
  governorate: 'governorate',
  business_type: 'businessType',
} as const satisfies Record<string, keyof BrandProfileFormValues>;

const toSocialLinksPayload = (
  links: BrandProfileFormValues['socialLinks'],
): BrandSocialLink[] =>
  SOCIAL_PLATFORMS.flatMap(platform => {
    const url = normalizeSocialUrl(platform, links[platform]);
    return url ? [{ platform, url }] : [];
  });

export const useBrandProfileScreen = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => createBrandProfileSchema(t), [t]);

  // Prefilled from the server draft (resume, or back from KYC).
  const { data: progress } = useGetOnboardingProgressQuery();
  const [defaultValues] = useState<BrandProfileFormValues>(() => ({
    governorate: progress?.profile.governorate ?? '',
    businessType: progress?.profile.business_type ?? '',
    socialLinks: toSocialLinksForm(progress?.profile.social_links),
  }));
  const [showAllPlatforms, setShowAllPlatforms] = useState(() =>
    SECONDARY_PLATFORMS.some(platform => defaultValues.socialLinks[platform]),
  );

  const governorates = useLookupItems('governorates');
  const businessTypes = useLookupItems('business_types');

  const { control, handleSubmit, setError } = useForm<BrandProfileFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const [saveProfile] = useBrandStep2ProfileMutation();
  const { runStep, isBusy, error } = useBrandOnboardingFlow('profile');

  const step = BRAND_WIZARD_STEPS.profile;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
  });

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      await runStep(
        () =>
          saveProfile({
            governorate: values.governorate,
            business_type: values.businessType,
            social_links: toSocialLinksPayload(values.socialLinks),
          }).unwrap(),
        { onFieldErrors: err => applyServerFieldErrors(err, SERVER_FIELD_MAP, setError) },
      );
    })();
  }, [handleSubmit, runStep, saveProfile, setError]);

  const showMorePlatforms = useCallback(() => setShowAllPlatforms(true), []);

  const retryLookups = useCallback(() => {
    governorates.refetch();
  }, [governorates]);

  return {
    control,
    governorates,
    businessTypes,
    lookupsFailed: governorates.isError || businessTypes.isError,
    retryLookups,
    visiblePlatforms: showAllPlatforms ? SOCIAL_PLATFORMS : PRIMARY_PLATFORMS,
    canShowMorePlatforms: !showAllPlatforms,
    showMorePlatforms,
    onSubmit,
    isSaving: isBusy,
    error,
  };
};
