import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, OtpInput, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { OTP_DEMO_LENGTH, useOtpDemo } from './hooks/useOtpDemo';

const OtpDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { ref, value, status, error, onChangeText, onComplete, reset } =
    useOtpDemo();

  return (
    <Box gap="md">
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t('devShowcase.otp.hint')}
      </Text>
      <OtpInput
        ref={ref}
        length={OTP_DEMO_LENGTH}
        value={value}
        onChangeText={onChangeText}
        onComplete={onComplete}
        status={status}
        error={error}
        accessibilityLabel={t('devShowcase.otp.label')}
      />
      <CustomButton
        title={t('devShowcase.otp.reset')}
        onPress={reset}
        variant="ghost"
        size="sm"
      />
    </Box>
  );
};

export const OtpDemo = memo(OtpDemoComponent);
