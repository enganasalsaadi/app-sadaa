import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  CustomInput,
  InlineError,
  BrandLogo,
  PhoneInput,
  Pressable,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { AuthStackParamList } from '@/core/navigation';
import type { LoginFormValues } from '../../hooks/useLogin';
import { useLogin } from '../../hooks/useLogin';
import { percentageOfWidth } from '@/core/theme/utils/responsive';
import { AccountTypeSheet } from '../../components/AccountTypeSheet';
import type { AccountType } from '../../components/AccountTypeSheet';

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

  const [countryCode, setCountryCode] = useState<CountryCode>('SY');
  const [accountTypeSheetVisible, setAccountTypeSheetVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    mode: 'onChange',
    defaultValues: { phone: '', password: '' },
  });

  const {
    handleLogin,
    isLoading,
    error: apiError,
  } = useLogin({ countryCode });

  const canSubmit = isValid && !isLoading;

  const handleSelectAccountType = (_type: AccountType) => {
    // TODO: navigate once RegisterScreen is redesigned for role-based registration.
    setAccountTypeSheetVisible(false);
  };

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
            name="phone"
            rules={{
              validate: val => {
                if (!val) return t('validation.required');
                return (
                  isValidPhoneNumber(val, countryCode) ||
                  t('validation.invalidPhone')
                );
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                value={value ?? ''}
                onChangeText={onChange}
                error={errors.phone?.message}
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
            onPress={() => setAccountTypeSheetVisible(true)}
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

      <AccountTypeSheet
        visible={accountTypeSheetVisible}
        onClose={() => setAccountTypeSheetVisible(false)}
        onSelect={handleSelectAccountType}
      />
    </Layout>
  );
};
