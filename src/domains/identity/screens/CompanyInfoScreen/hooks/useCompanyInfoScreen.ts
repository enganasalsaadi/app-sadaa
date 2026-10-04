import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import { toastService } from '@/core/toast';
import { SOCIAL_PLATFORMS } from '@/shared/utils';
import {
  EMPTY_SOCIAL_LINKS,
  PRIMARY_SOCIAL_PLATFORMS,
  SECONDARY_SOCIAL_PLATFORMS,
  formatPhoneForDisplay,
} from '@/domains/auth';
import { useGetUserProfileQuery, useUpdateBrandProfileMutation } from '../../../api/accountApi';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard';
import { useSupportContact } from '../../../hooks/useSupportContact';
import {
  createCompanyInfoSchema,
  type CompanyInfoFormValues,
} from '../../../schemas/companyInfoSchema';
import { toCompanyInfoForm, toCompanyInfoPatch } from '../../../utils/profilePatch';

const EMPTY: CompanyInfoFormValues = {
  companyName: '',
  email: '',
  governorate: '',
  businessType: '',
  socialLinks: EMPTY_SOCIAL_LINKS,
};

const SERVER_FIELD_MAP = {
  company_name: 'companyName',
  email: 'email',
  governorate: 'governorate',
  business_type: 'businessType',
} as const satisfies Record<string, keyof CompanyInfoFormValues>;

export const useCompanyInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const schema = useMemo(() => createCompanyInfoSchema(t), [t]);
  const details = useGetUserProfileQuery();
  const governorates = useLookupItems('governorates');
  const businessTypes = useLookupItems('business_types');
  const [updateProfile, { isLoading: isSaving }] = useUpdateBrandProfileMutation();
  const onContactSupport = useSupportContact();
  const [saved, setSaved] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const { control, handleSubmit, reset, setError, setFocus, formState } =
    useForm<CompanyInfoFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY,
    });

  const savedValues = useMemo(
    () => (details.data ? toCompanyInfoForm(details.data) : null),
    [details.data],
  );

  // Prefill from the saved profile; a refetch never wipes edits in progress.
  useEffect(() => {
    if (!savedValues || formState.isDirty) return;
    reset(savedValues);
    if (SECONDARY_SOCIAL_PLATFORMS.some(platform => savedValues.socialLinks[platform])) {
      setShowAllPlatforms(true);
    }
  }, [savedValues, formState.isDirty, reset]);

  const guard = useDiscardGuard(formState.isDirty && !saved);

  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      if (!savedValues) return;
      const patch = toCompanyInfoPatch(values, savedValues);
      if (Object.keys(patch).length === 0) {
        setSaved(true);
        return;
      }
      try {
        await updateProfile(patch).unwrap();
        toastService.success(t('account.companyInfo.saved'));
        setSaved(true);
      } catch (err) {
        applyServerFieldErrors(err, SERVER_FIELD_MAP, setError);
        // 422 is toasted by baseQuery, 403/5xx open the global modals.
        const apiError = normalizeApiError(err);
        if (apiError.statusCode !== 422 && !apiError.isForbidden && !apiError.isServerError) {
          toastService.error(t('errors.generic'));
        }
      }
    })();
  }, [handleSubmit, savedValues, updateProfile, setError, t]);

  const focusEmail = useCallback(() => setFocus('email'), [setFocus]);
  const showMorePlatforms = useCallback(() => setShowAllPlatforms(true), []);

  const retry = useCallback(() => {
    details.refetch();
    governorates.refetch();
    businessTypes.refetch();
  }, [details, governorates, businessTypes]);

  const phone = details.data?.phone;

  return {
    control,
    governorates,
    businessTypes,
    visiblePlatforms: showAllPlatforms ? SOCIAL_PLATFORMS : PRIMARY_SOCIAL_PLATFORMS,
    canShowMorePlatforms: !showAllPlatforms,
    showMorePlatforms,
    phone: phone ? formatPhoneForDisplay(phone) : '',
    onContactSupport,
    focusEmail,
    isLoading: details.isLoading,
    isError: details.isError && !details.data,
    loadError: details.error,
    retry,
    onSave,
    isSaving,
    guard,
  };
};

export type CompanyInfoScreenModel = ReturnType<typeof useCompanyInfoScreen>;
