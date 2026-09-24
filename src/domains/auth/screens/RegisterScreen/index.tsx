import React, { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { TextInputInstance } from 'react-native';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  CustomInput,
  AnimatedIconHero,
  PhoneInput,
  InlineError,
  Pressable,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { AuthStackParamList } from '@/core/navigation';
import type { RegisterFormValues } from '../../hooks/useRegister';
import { useRegister } from '../../hooks/useRegister';
import { UserPlus } from 'lucide-react-native';

const passwordRules = (t: TFunction) => ({
  required: t('validation.required'),
  minLength: {
    value: 8,
    message: t('validation.minLength', { count: 8 }),
  },
});

export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'Register'>>();

  const [countryCode, setCountryCode] = useState<CountryCode>('SA');

  const lastNameRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const {
    handleRegister,
    isLoading,
    error: apiError,
  } = useRegister({
    countryCode,
    setError,
    onSuccess: email => navigation.navigate('Verify', { email }),
  });

  const canSubmit = isValid && !isLoading;

  return (
    <Layout>
      <Box gap="4xl" px="md">
        <Box align="center" pt="xl">
          <AnimatedIconHero
            circleSize={150}
            iconSize={35}
            icon={<UserPlus size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
          />
        </Box>

        <Box gap="sm" align="center" mt="5xl">
          <Text variant="h3">{t('auth.createAccount')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.registerSubtitle')}
          </Text>
        </Box>

        <Box gap="2xl">
          <Controller
            control={control}
            name="firstName"
            rules={{ required: t('validation.required') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label={t('auth.firstName')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.firstNamePlaceholder')}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                error={errors.firstName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            rules={{ required: t('validation.required') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                ref={lastNameRef}
                label={t('auth.lastName')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.lastNamePlaceholder')}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.lastName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: t('validation.required'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.invalidEmail'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                ref={emailRef}
                label={t('auth.email')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.emailPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                error={errors.email?.message}
              />
            )}
          />

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
              <PhoneInput
                ref={phoneRef}
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                value={value ?? ''}
                onChangeText={onChange}
                countryCode={countryCode}
                onChangeCountry={setCountryCode}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
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
                ref={passwordRef}
                label={t('auth.password')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('auth.passwordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={() => {
                  handleSubmit(handleRegister)();
                }}
                error={errors.password?.message}
              />
            )}
          />

          <InlineError error={apiError} />

          <CustomButton
            title={isLoading ? t('auth.signingUp') : t('auth.signUp')}
            onPress={() => {
              handleSubmit(handleRegister)();
            }}
            loading={isLoading}
            disabled={!canSubmit}
            fullWidth
          />

          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="link"
            accessibilityLabel={t('auth.login')}
          >
            <Text variant="bodySmall" align="center">
              {t('auth.haveAccount')}{' '}
              <Text variant="body">{t('auth.login')}</Text>
            </Text>
          </Pressable>
        </Box>
      </Box>
    </Layout>
  );
};
