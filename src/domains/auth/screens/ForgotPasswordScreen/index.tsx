import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  AnimatedIconHero,
  InlineError,
  PhoneInput,
  CustomInput,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { replace } from '@/core/navigation';
import type { AuthStackParamList } from '@/core/navigation';
import { KeyRound } from 'lucide-react-native';
import { useRequestPasswordReset } from '../../hooks';
import type { RequestPasswordResetFormValues } from '../../hooks';

export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'ForgotPassword'>>();

  const [countryCode, setCountryCode] = useState<CountryCode>('SY');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RequestPasswordResetFormValues>({
    mode: 'onChange',
    defaultValues: { phone: '' },
  });

  const {
    handleRequestReset,
    isLoading,
    error: apiError,
  } = useRequestPasswordReset({
    countryCode,
    onSuccess: phone => navigation.navigate('ResetOtp', { phone }),
  });

  const canSubmit = isValid && !isLoading;

  return (
    <Layout>
      <Box gap="4xl">
        <Box align="center" pt="4xl">
          <AnimatedIconHero
            circleSize={150}
            iconSize={35}
            icon={<KeyRound size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
          />
        </Box>

        <Box gap="sm" align="center" mt="5xl">
          <Text variant="h1">{t('auth.forgotPasswordTitle')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.forgotPasswordSubtitle')}
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

          <InlineError error={apiError} />

          <CustomButton
            title={isLoading ? t('auth.sendingCode') : t('auth.sendResetCode')}
            onPress={() => {
              handleSubmit(handleRequestReset)();
            }}
            loading={isLoading}
            disabled={!canSubmit}
            fullWidth
          />

          <CustomButton
            title={t('auth.signIn')}
            onPress={() => replace('Login')}
            variant="ghost"
            fullWidth
          />
        </Box>
      </Box>
    </Layout>
  );
};
