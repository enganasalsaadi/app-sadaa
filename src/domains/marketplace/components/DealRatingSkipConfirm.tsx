import React, { memo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { motion, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';

export interface DealRatingSkipConfirmProps {
  name: string;
  isSkipping: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

/** Skipping is final (the server takes no rating after it): one warning, rating stays the easy way. */
const DealRatingSkipConfirmComponent: React.FC<DealRatingSkipConfirmProps> = ({
  name,
  isSkipping,
  onBack,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(motion.duration.base)}>
      <Box gap="sm">
        <Text variant="h4" color={colors.text.primary} accessibilityRole="header">
          {t('marketplace.deals.rating.skip.title')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('marketplace.deals.rating.skip.body', { name })}
        </Text>
      </Box>
      <Box mt="xl" gap="sm">
        <CustomButton
          title={t('marketplace.deals.rating.skip.back')}
          onPress={onBack}
          fullWidth
        />
        <CustomButton
          title={t('marketplace.deals.rating.skip.confirm')}
          onPress={onConfirm}
          loading={isSkipping}
          variant="ghost"
          fullWidth
        />
      </Box>
    </Animated.View>
  );
};

export const DealRatingSkipConfirm = memo(DealRatingSkipConfirmComponent);
