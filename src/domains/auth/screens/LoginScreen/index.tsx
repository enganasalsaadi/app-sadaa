import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  CustomInput,
  InlineError,
  BrandLogo,
  Pressable,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { AuthStackParamList } from '@/core/navigation';
import type { LoginFormValues } from '../../hooks/useLogin';
import { useLogin } from '../../hooks/useLogin';
import { percentageOfWidth } from '@/core/theme/utils/responsive';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailRules = (t: TFunction) => ({
  required: t('validation.required'),
  pattern: {
    value: EMAIL_REGEX,
    message: t('validation.invalidEmail'),
  },
});

const passwordRules = (t: TFunction) => ({
  required: t('validation.required'),
  minLength: {
    value: 6,
    message: t('validation.minLength', { count: 6 }),
  },
});

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'Login'>>();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    mode: 'onChange',
    defaultValues: { username: '', password: '' },
  });

  const {
    handleLogin,
    isLoading,
    error: apiError,
  } = useLogin({ loginType: 'username', countryCode: '' });

  const canSubmit = isValid && !isLoading;

  return (
    <Layout>
      <Box gap="xl" px="md">
        <Box align="center" pt="xl">
          <BrandLogo variant="full" height={percentageOfWidth(16)} />
        </Box>

        <Box gap="sm" align="center" mt="xl">
          <Text variant="h3">{t('auth.welcomeBack')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.loginSubtitle')}
          </Text>
        </Box>

        <Box gap="2xl">
          <Controller
            control={control}
            name="username"
            rules={emailRules(t)}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label={t('auth.email')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                error={errors.username?.message}
              />
            )}
          />

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
                placeholder={t('auth.passwordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                error={errors.password?.message}
              />
            )}
          />

          <Text
            variant="body"
            color={colors.text.secondary}
            align="right"
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            {t('auth.forgotPassword')}
          </Text>

          <InlineError error={apiError} />

          <CustomButton
            title={isLoading ? t('auth.signingIn') : t('auth.login')}
            onPress={() => {
              handleSubmit(handleLogin)();
            }}
            loading={isLoading}
            disabled={!canSubmit}
            fullWidth
          />

          <Pressable
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="link"
            accessibilityLabel={t('auth.signUp')}
          >
            <Text variant="bodySmall" align="center">
              {t('auth.noAccount')}{' '}
              <Text variant="body"> {t('auth.signUp')}</Text>
            </Text>
          </Pressable>
        </Box>
      </Box>
    </Layout>
  );
};
