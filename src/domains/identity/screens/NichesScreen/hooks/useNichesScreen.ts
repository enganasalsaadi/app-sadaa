import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useDiscardGuard } from '@/core/hooks';
import { useNavigation } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import { toastService } from '@/core/toast';
import { INFLUENCER_MAX_NICHES } from '@/domains/auth';
import {
  useGetUserProfileQuery,
  useUpdateInfluencerProfileMutation,
} from '../../../api/accountApi';
import { createNichesSchema, type NichesFormValues } from '../../../schemas/nichesSchema';

const SERVER_FIELD_MAP = { niches: 'niches' } as const;

export const useNichesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const schema = useMemo(() => createNichesSchema(t), [t]);
  const details = useGetUserProfileQuery();
  const options = useLookupItems('niches');
  const [updateProfile, { isLoading: isSaving }] = useUpdateInfluencerProfileMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, setError, setValue, formState } =
    useForm<NichesFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: { niches: [] },
    });
  const niches = useWatch({ control, name: 'niches' });
  const savedNiches = details.data?.profile.niches;

  // Prefill from the saved profile; a refetch never wipes picks in progress.
  useEffect(() => {
    if (savedNiches && !formState.isDirty) reset({ niches: savedNiches });
  }, [savedNiches, formState.isDirty, reset]);

  const guard = useDiscardGuard(formState.isDirty && !saved);

  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  const onChange = useCallback(
    (next: string[]) => setValue('niches', next, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      try {
        await updateProfile({ niches: values.niches }).unwrap();
        toastService.success(t('account.niches.saved'));
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
  }, [handleSubmit, setError, t, updateProfile]);

  const retry = useCallback(() => {
    details.refetch();
    options.refetch();
  }, [details, options]);

  return {
    niches,
    onChange,
    items: options.items,
    max: INFLUENCER_MAX_NICHES,
    error: formState.errors.niches?.message,
    isLoading: details.isLoading || options.isLoading,
    isError: (details.isError && !details.data) || (options.isError && options.items.length === 0),
    loadError: details.error,
    retry,
    onSave,
    isSaving,
    guard,
  };
};
