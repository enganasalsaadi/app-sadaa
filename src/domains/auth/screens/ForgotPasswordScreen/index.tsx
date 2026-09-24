import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
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
import { KeyRound, MailCheck } from 'lucide-react-native';
import { useForgotPassword } from '../../hooks';

export interface ForgotPasswordFormValues {
  email: string;
}

export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormValues>({
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const {
    handleForgotPassword,
    isLoading,
    error: apiError,
  } = useForgotPassword({
    onSuccess: email => setSentTo(email),
  });

  const canSubmit = isValid && !isLoading;

  // Success state — the reset link was emailed; user completes it on the web.
  if (sentTo) {
    return (
      <Layout>
        <Box gap="4xl">
          <Box align="center" pt="4xl">
            <AnimatedIconHero
              circleSize={150}
              iconSize={35}
              icon={<MailCheck size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
            />
          </Box>

          <Box gap="sm" align="center" mt="5xl">
            <Text variant="h1">{t('auth.resetLinkSentTitle')}</Text>
            <Text variant="body" color={colors.text.secondary} align="center">
              {t('auth.resetLinkSentSubtitle', { email: sentTo })}
            </Text>
          </Box>

          <CustomButton
            title={t('auth.backToSignIn')}
            onPress={() => replace('Login')}
            fullWidth
          />
        </Box>
      </Layout>
    );
  }

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
            name="email"
            rules={{
              required: t('validation.required'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.invalidEmail'),
              },
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t('auth.email')}
                value={value ?? ''}
                onChangeText={onChange}
                placeholder={t('auth.identifierPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <InlineError error={apiError} />

          <CustomButton
            title={isLoading ? t('auth.sendingLink') : t('auth.sendResetLink')}
            onPress={() => {
              handleSubmit(handleForgotPassword)();
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
