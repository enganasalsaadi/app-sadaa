import React, { useCallback, useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  CustomInput,
  AnimatedIconHero,
  InlineError,
  Pressable,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { MailCheck } from 'lucide-react-native';
import type { AuthStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import type { VerifyOtpFormValues } from '../../hooks/useVerifyOtp';
import { useVerifyOtp } from '../../hooks/useVerifyOtp';

const RESEND_COOLDOWN = 120; // seconds — server enforces 2 min between sends

const otpRules = (t: TFunction) => ({
  required: t('validation.required'),
  minLength: { value: 5, message: t('validation.invalidOtp') },
  maxLength: { value: 5, message: t('validation.invalidOtp') },
});

export const VerifyOtpScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<AuthStackParamList, 'Verify'>>();
  const email = route.params?.email ?? '';

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VerifyOtpFormValues>({
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const { handleVerify, handleResend, isVerifying, isResending, error } =
    useVerifyOtp({ email });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;
    await handleResend();
    setCooldown(RESEND_COOLDOWN);
    toastService.success(t('auth.otpResent'));
  }, [cooldown, isResending, handleResend, t]);

  const canSubmit = isValid && !isVerifying;

  return (
    <Layout>
      <Box gap="4xl" px="md">
        <Box align="center" pt="xl">
          <AnimatedIconHero
            circleSize={150}
            iconSize={35}
            icon={<MailCheck size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
          />
        </Box>

        <Box gap="sm" align="center" mt="5xl">
          <Text variant="h3">{t('auth.verifyEmailTitle')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.verifyEmailSubtitle', { email })}
          </Text>
        </Box>

        <Box gap="2xl">
          <Controller
            control={control}
            name="otp"
            rules={otpRules(t)}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label={t('auth.verifyCode')}
                value={value ?? ''}
                onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))}
                onBlur={onBlur}
                placeholder={t('auth.enterOtpPlaceholder')}
                keyboardType="number-pad"
                maxLength={5}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  handleSubmit(handleVerify)();
                }}
                error={errors.otp?.message}
              />
            )}
          />

          <InlineError error={error} />

          <CustomButton
            title={isVerifying ? t('auth.verifyingCode') : t('auth.verifyCode')}
            onPress={() => {
              handleSubmit(handleVerify)();
            }}
            loading={isVerifying}
            disabled={!canSubmit}
            fullWidth
          />

          <Pressable
            onPress={onResend}
            disabled={cooldown > 0 || isResending}
            accessibilityRole="button"
            accessibilityLabel={t('auth.resendOtp')}
          >
            <Text variant="bodySmall" align="center">
              {t('auth.didNotReceiveOtp')}{' '}
              <Text
                variant="body"
                color={
                  cooldown > 0 ? colors.text.tertiary : colors.text.primary
                }
              >
                {cooldown > 0
                  ? t('auth.resendOtpIn', { count: cooldown })
                  : t('auth.resendOtp')}
              </Text>
            </Text>
          </Pressable>
        </Box>
      </Box>
    </Layout>
  );
};
