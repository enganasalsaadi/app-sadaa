import React, { useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import type { TextInputInstance } from 'react-native';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  CustomInput,
  AnimatedIconHero,
  InlineError,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { replace } from '@/core/navigation';
import type { AuthStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { KeyRound } from 'lucide-react-native';
import type { ResetPasswordFormValues } from '../../hooks';
import { useResetPassword } from '../../hooks';

const passwordRules = (t: TFunction) => ({
  required: t('validation.required'),
  minLength: { value: 8, message: t('validation.minLength', { count: 8 }) },
});

export const ResetPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route =
    useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const { phone, code } = route.params;

  const confirmRef = useRef<TextInputInstance>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    mode: 'onChange',
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  const {
    handleResetPassword,
    isLoading,
    error: apiError,
  } = useResetPassword({
    phone,
    code,
    onSuccess: () => {
      toastService.success(t('auth.passwordUpdated'));
      replace('Login');
    },
  });

  const canSubmit = isValid && !isLoading;

  return (
    <Layout>
      <Box gap="4xl" px="md">
        <Box align="center" pt="xl">
          <AnimatedIconHero
            circleSize={150}
            iconSize={35}
            icon={<KeyRound size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
          />
        </Box>

        <Box gap="sm" align="center" mt="5xl">
          <Text variant="h3">{t('auth.newPasswordTitle')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.newPasswordSubtitle')}
          </Text>
        </Box>

        <Box gap="2xl">
          <Controller
            control={control}
            name="password"
            rules={passwordRules(t)}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label={t('auth.password')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.newPasswordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirmation"
            rules={{
              required: t('validation.required'),
              validate: val =>
                val === watch('password') || t('auth.passwordMismatch'),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                ref={confirmRef}
                label={t('auth.confirmPassword')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={() => {
                  handleSubmit(handleResetPassword)();
                }}
                error={errors.passwordConfirmation?.message}
              />
            )}
          />

          <InlineError error={apiError} />

          <CustomButton
            title={isLoading ? t('auth.updatingPassword') : t('auth.updatePassword')}
            onPress={() => {
              handleSubmit(handleResetPassword)();
            }}
            loading={isLoading}
            disabled={!canSubmit}
            fullWidth
          />
        </Box>
      </Box>
    </Layout>
  );
};
