import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { motion } from '@/core/theme';
import { useWizardHeader } from '@/shared/ui';
import { useInfluencerStep1Mutation } from '../../../api';
import { INFLUENCER_WIZARD_STEPS } from '../../../constants/influencerOnboarding';
import { createInfluencerAccountSchema } from '../../../schemas';
import type { InfluencerAccountFormValues } from '../../../schemas';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

const SERVER_FIELD_MAP = {
  full_name: 'fullName',
  phone: 'phone',
  email: 'email',
  password: 'password',
  governorate: 'governorate',
} as const satisfies Record<string, keyof InfluencerAccountFormValues>;

const DEFAULT_VALUES: InfluencerAccountFormValues = {
  fullName: '',
  phone: '',
  countryCode: DEFAULT_PHONE_COUNTRY,
  governorate: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

interface PendingAccount {
  values: InfluencerAccountFormValues;
  e164: string;
  display: string;
}

export const useInfluencerAccountScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const schema = useMemo(() => createInfluencerAccountSchema(t), [t]);
  const [pending, setPending] = useState<PendingAccount | null>(null);
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [influencerStep1, { isLoading }] = useInfluencerStep1Mutation();
  const governorates = useLookupItems('governorates');

  const { control, handleSubmit, setError, setFocus, setValue, trigger, getFieldState } =
    useForm<InfluencerAccountFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: DEFAULT_VALUES,
    });

  const step = INFLUENCER_WIZARD_STEPS.account;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack: () => navigation.goBack(),
  });

  // Validation passed → confirm the number first: it can't change after step 1.
  const onContinue = useCallback(() => {
    handleSubmit(values => {
      const parsed = parsePhoneNumberFromString(values.phone, values.countryCode);
      if (!parsed) return;
      const e164 = parsed.format('E.164');
      setApiError(null);
      setPending({ values, e164, display: formatPhoneForDisplay(e164) });
    })();
  }, [handleSubmit]);

  const onConfirm = useCallback(async () => {
    if (!pending || isLoading) return;
    const { values, e164 } = pending;
    const email = values.email.trim();
    try {
      // Success flips AppStatus → REGISTRATION_INCOMPLETE; RootNavigator
      // picks the creator branch from the server's user_type.
      await influencerStep1({
        full_name: values.fullName.trim(),
        phone: e164,
        ...(email ? { email } : {}),
        password: values.password,
        governorate: values.governorate,
      }).unwrap();
    } catch (err) {
      setPending(null);
      if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
        setApiError(normalizeApiError(err));
      }
    }
  }, [influencerStep1, isLoading, pending, setError]);

  const onEditPhone = useCallback(() => {
    setPending(null);
    // Let the sheet finish closing before the keyboard opens.
    setTimeout(() => setFocus('phone'), motion.duration.base);
  }, [setFocus]);

  const onDismissConfirm = useCallback(() => {
    if (!isLoading) setPending(null);
  }, [isLoading]);

  const onChangeCountry = useCallback(
    (code: CountryCode) => {
      setValue('countryCode', code);
      if (getFieldState('phone').isTouched) trigger('phone');
    },
    [getFieldState, setValue, trigger],
  );

  return {
    control,
    setFocus,
    governorates,
    onChangeCountry,
    onContinue,
    confirmPhone: pending?.display ?? null,
    onConfirm,
    onEditPhone,
    onDismissConfirm,
    isSubmitting: isLoading,
    apiError,
  };
};
