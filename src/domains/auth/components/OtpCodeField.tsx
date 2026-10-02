import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { useTheme } from '@/core/theme';
import { Box, OtpInput, Pressable, Text } from '@/shared/ui';
import type { OtpCodeForm } from '../hooks/useOtpCodeForm';
import { formatOtpTimer } from '../utils/otpGuard';

interface OtpCodeFieldProps {
  otp: OtpCodeForm;
  /** Server-side rejection message. */
  error?: string;
  editable?: boolean;
}

/** OTP cells + "didn't receive it?" resend row with a live cooldown. */
export const OtpCodeField: React.FC<OtpCodeFieldProps> = ({ otp, error, editable = true }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const canResend = otp.cooldown === 0 && !otp.isResending;
  const resendLabel =
    otp.cooldown > 0
      ? t('auth.otp.resendIn', { time: formatOtpTimer(otp.cooldown) })
      : t('auth.resendOtp');

  return (
    <Box gap="3xl">
      <Controller
        control={otp.control}
        name="code"
        render={({ field: { value }, fieldState }) => (
          <OtpInput
            ref={otp.otpRef}
            length={otp.length}
            value={value}
            onChangeText={otp.onChangeCode}
            onComplete={otp.onSubmit}
            editable={editable && !otp.blocked}
            error={fieldState.error?.message ?? otp.notice ?? error}
            autoFocus
            accessibilityLabel={t('auth.otp.codeLabel', { count: otp.length })}
          />
        )}
      />

      <Box align="center" gap="xs">
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('auth.didNotReceiveOtp')}
        </Text>
        <Pressable
          onPress={otp.onResend}
          disabled={!canResend}
          minHeight={sizes.button.md}
          px="lg"
          justify="center"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canResend, busy: otp.isResending }}
          accessibilityLabel={resendLabel}
        >
          <Text
            variant="amount"
            color={canResend ? colors.interactive.text : colors.text.tertiary}
          >
            {resendLabel}
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
};
