import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { motion } from '@/core/theme';
import { useWizardHeader } from '@/shared/ui';
import { useBrandStep1Mutation } from '../../../api';
import { BRAND_WIZARD_STEPS } from '../../../constants/brandOnboarding';
import { createBrandAccountSchema } from '../../../schemas';
import type { BrandAccountFormValues } from '../../../schemas';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

const SERVER_FIELD_MAP = {
  company_name: 'companyName',
  phone: 'phone',
  email: 'email',
  password: 'password',
  password_confirmation: 'passwordConfirmation',
} as const satisfies Record<string, keyof BrandAccountFormValues>;

const DEFAULT_VALUES: BrandAccountFormValues = {
  companyName: '',
  phone: '',
  countryCode: DEFAULT_PHONE_COUNTRY,
  email: '',
  password: '',
  passwordConfirmation: '',
};

interface PendingAccount {
  values: BrandAccountFormValues;
  e164: string;
  display: string;
}

export const useBrandAccountScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  // Rebuilt only on language change, not on every render.
  const schema = useMemo(() => createBrandAccountSchema(t), [t]);
  const [pending, setPending] = useState<PendingAccount | null>(null);
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [brandStep1, { isLoading }] = useBrandStep1Mutation();

  const { control, handleSubmit, setError, setFocus, setValue, trigger, getFieldState } =
    useForm<BrandAccountFormValues>({
      // Errors appear after leaving a field, then update while typing.
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: DEFAULT_VALUES,
    });

  const step = BRAND_WIZARD_STEPS.account;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack: () => navigation.goBack(),
  });

  // Validation passed → confirm the number before the account is created:
  // it can't be changed afterwards (step 1 is final).
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
    try {
      // Success flips AppStatus → REGISTRATION_INCOMPLETE; RootNavigator
      // swaps to the onboarding branch on its own.
      await brandStep1({
        company_name: values.companyName.trim(),
        phone: e164,
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      }).unwrap();
    } catch (err) {
      setPending(null);
      if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
        setApiError(normalizeApiError(err));
      }
    }
  }, [brandStep1, isLoading, pending, setError]);

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
