import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useDiscardGuard } from '@/core/hooks';
import { useNavigation } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import { toastService } from '@/core/toast';
import { formatPhoneForDisplay } from '@/domains/auth';
import {
  useGetUserProfileQuery,
  useUpdateInfluencerProfileMutation,
} from '../../../api/accountApi';
import { useSupportContact } from '../../../hooks/useSupportContact';
import {
  createPersonalInfoSchema,
  type PersonalInfoFormValues,
} from '../../../schemas/personalInfoSchema';
import { toPersonalInfoForm, toPersonalInfoPatch } from '../../../utils/profilePatch';

const EMPTY: PersonalInfoFormValues = { fullName: '', email: '', governorate: '', area: '' };

const SERVER_FIELD_MAP = {
  full_name: 'fullName',
  email: 'email',
  governorate: 'governorate',
  area: 'area',
} as const satisfies Record<string, keyof PersonalInfoFormValues>;

export const usePersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const schema = useMemo(() => createPersonalInfoSchema(t), [t]);
  const details = useGetUserProfileQuery();
  const governorates = useLookupItems('governorates');
  const [updateProfile, { isLoading: isSaving }] = useUpdateInfluencerProfileMutation();
  const onContactSupport = useSupportContact();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, setError, setFocus, formState } =
    useForm<PersonalInfoFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY,
    });

  const savedValues = useMemo(
    () => (details.data ? toPersonalInfoForm(details.data) : null),
    [details.data],
  );

  // Prefill from the saved profile; a refetch never wipes edits in progress.
  useEffect(() => {
    if (savedValues && !formState.isDirty) reset(savedValues);
  }, [savedValues, formState.isDirty, reset]);

  const guard = useDiscardGuard(formState.isDirty && !saved);

  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      if (!savedValues) return;
      const patch = toPersonalInfoPatch(values, savedValues);
      if (Object.keys(patch).length === 0) {
        setSaved(true);
        return;
      }
      try {
        await updateProfile(patch).unwrap();
        toastService.success(t('account.personalInfo.saved'));
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

  const retry = useCallback(() => {
    details.refetch();
    governorates.refetch();
  }, [details, governorates]);

  const phone = details.data?.phone;

  return {
    control,
    governorates,
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

export type PersonalInfoScreenModel = ReturnType<typeof usePersonalInfoScreen>;
