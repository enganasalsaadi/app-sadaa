import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import type {
  AuthStackParamList,
  PasswordResetStackParamList,
  PasswordResetStackScreenProps,
} from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useWizardHeader } from '@/shared/ui';
import { useResetPasswordMutation } from '../../../api';
import { PASSWORD_RESET_STEPS } from '../../../constants/passwordReset';
import { createNewPasswordSchema } from '../../../schemas';
import type { NewPasswordFormValues } from '../../../schemas';

const SERVER_FIELD_MAP = {
  password: 'password',
  password_confirmation: 'passwordConfirmation',
} as const satisfies Record<string, keyof NewPasswordFormValues>;

type Navigation = PasswordResetStackScreenProps<'ResetPassword'>['navigation'];

export const useResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<PasswordResetStackParamList, 'ResetPassword'>>();
  const { phone, code } = params;
  const schema = useMemo(() => createNewPasswordSchema(t), [t]);
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const { control, handleSubmit, setError, setFocus } = useForm<NewPasswordFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  const step = PASSWORD_RESET_STEPS.password;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack: () => navigation.goBack(),
  });

  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading) return;
      setApiError(null);
      try {
        await resetPassword({
          phone,
          code,
          password: values.password,
          password_confirmation: values.passwordConfirmation,
        }).unwrap();
        toastService.success(t('auth.passwordReset.success'));
        // Back to the existing Login (closing the wizard) with the number filled in.
        navigation
          .getParent<NativeStackNavigationProp<AuthStackParamList>>()
          ?.popTo('Login', { phone });
      } catch (err) {
        if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
          setApiError(normalizeApiError(err));
        }
      }
    })();
  }, [code, handleSubmit, isLoading, navigation, phone, resetPassword, setError, t]);

  return { control, setFocus, onSubmit, isSubmitting: isLoading, apiError };
};
