import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  Layout,
  Box,
  Text,
  CustomButton,
  OtpInput,
  AnimatedIconHero,
  InlineError,
  Pressable,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { KeyRound } from 'lucide-react-native';
import type { AuthStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import type { VerifyPasswordResetOtpFormValues } from '../../hooks';
import { useVerifyPasswordResetOtp } from '../../hooks';

const CODE_LENGTH = 4;
const RESEND_COOLDOWN = 60; // seconds, per spec

export const ResetOtpScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetOtp'>>();
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'ResetOtp'>>();
  const phone = route.params?.phone ?? '';

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VerifyPasswordResetOtpFormValues>({
    mode: 'onChange',
    defaultValues: { code: '' },
  });

  const { handleVerify, handleResend, isVerifying, isResending, error } =
    useVerifyPasswordResetOtp({
      phone,
      onSuccess: code => navigation.navigate('ResetPassword', { phone, code }),
    });

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
            icon={<KeyRound size={35} color={colors.text.onBrand} strokeWidth={1.5} />}
          />
        </Box>

        <Box gap="sm" align="center" mt="5xl">
          <Text variant="h3">{t('auth.verifyOtpTitle')}</Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {t('auth.verifyOtpSubtitle', { identifier: phone })}
          </Text>
        </Box>

        <Box gap="2xl">
          <Controller
            control={control}
            name="code"
            rules={{
              required: t('validation.required'),
              minLength: {
                value: CODE_LENGTH,
                message: t('validation.invalidOtpCode', { count: CODE_LENGTH }),
              },
              maxLength: {
                value: CODE_LENGTH,
                message: t('validation.invalidOtpCode', { count: CODE_LENGTH }),
              },
            }}
            render={({ field: { onChange, value } }) => (
              <OtpInput
                length={CODE_LENGTH}
                value={value ?? ''}
                onChangeText={onChange}
                onComplete={() => handleSubmit(handleVerify)()}
                error={errors.code?.message}
                autoFocus
                accessibilityLabel={t('auth.verifyCode')}
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
