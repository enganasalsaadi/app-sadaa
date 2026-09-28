import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, HeroBackdrop, Text } from '@/shared/ui';

interface OnboardingProgressGateProps {
  failed: boolean;
  onRetry: () => void;
}

/** Loading / failure while the first GET /onboarding/progress is in flight. */
export const OnboardingProgressGate: React.FC<OnboardingProgressGateProps> = ({
  failed,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box flex={1} bg={colors.brand.main} align="center" justify="center" px="3xl" gap="xl">
      <HeroBackdrop />
      {failed ? (
        <>
          <Text variant="body" align="center" color={colors.text.onBrand}>
            {t('auth.onboardingProgressError')}
          </Text>
          <CustomButton
            title={t('common.retry')}
            onPress={onRetry}
            variant="onBrand"
            fullWidth
          />
        </>
      ) : (
        <ActivityIndicator color={colors.text.onBrand} />
      )}
    </Box>
  );
};
