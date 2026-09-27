import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { applyServerFieldErrors, getApiErrorMessage, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import type {
  PasswordResetStackParamList,
  PasswordResetStackScreenProps,
} from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import { useRequestPasswordResetMutation } from '../../../api';
import { PASSWORD_RESET_STEPS } from '../../../constants/passwordReset';
import { createPhoneSchema } from '../../../schemas';
import type { PhoneFormValues } from '../../../schemas';

// The server should answer 200 whether or not the number exists; if it ever
// leaks "user not found", treat it as sent so numbers can't be enumerated.
const USER_NOT_FOUND_MESSAGE = 'المستخدم غير موجود';

const SERVER_FIELD_MAP = { phone: 'phone' } as const satisfies Record<
  string,
  keyof PhoneFormValues
>;

type Navigation = PasswordResetStackScreenProps<'ResetPhone'>['navigation'];

export const useForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<PasswordResetStackParamList, 'ResetPhone'>>();
  const schema = useMemo(() => createPhoneSchema(t), [t]);
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const { control, handleSubmit, setError, setValue, trigger, getFieldState } =
    useForm<PhoneFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: {
        phone: params?.phone ?? '',
        countryCode: params?.countryCode ?? DEFAULT_PHONE_COUNTRY,
      },
    });

  const step = PASSWORD_RESET_STEPS.phone;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack: () => navigation.goBack(),
  });

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading) return;
      const parsed = parsePhoneNumberFromString(values.phone, values.countryCode);
      if (!parsed) return;
      const phone = parsed.format('E.164');
      const goNext = () => navigation.navigate('ResetOtp', { phone, sentAt: Date.now() });
      setApiError(null);
      try {
        await requestReset({ phone }).unwrap();
        goNext();
      } catch (err) {
        if (getApiErrorMessage(err) === USER_NOT_FOUND_MESSAGE) {
          goNext();
          return;
        }
        if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
          setApiError(normalizeApiError(err));
        }
      }
    })();
  }, [handleSubmit, isLoading, navigation, requestReset, setError]);

  const onChangeCountry = useCallback(
    (code: CountryCode) => {
      setValue('countryCode', code);
      if (getFieldState('phone').isTouched) trigger('phone');
    },
    [getFieldState, setValue, trigger],
  );

  return { control, onChangeCountry, onSubmit, isSubmitting: isLoading, apiError };
};
