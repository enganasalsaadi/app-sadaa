import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, LiveDot, Skeleton, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';

/** Before the builder: the creator's services and the preflight load (or the kit failed to). */
const OfferGateComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { kitFailed, onRetryGate } = useOfferBuilder();

  if (kitFailed) {
    return (
      <Box flex={1} align="center" justify="center" gap="lg" p="3xl">
        <Box p="xl" borderRadius="full" bg={colors.surface.elevated}>
          <CloudOff size={sizes.icon.xl} color={colors.text.tertiary} />
        </Box>
        <Text variant="title" color={colors.text.primary} align="center">
          {t('marketplace.offer.gate.kitFailed')}
        </Text>
        <CustomButton title={t('common.retry')} variant="secondary" onPress={onRetryGate} />
      </Box>
    );
  }

  return (
    <Box gap="lg" accessibilityRole="progressbar" accessibilityLabel={t('marketplace.offer.gate.checking')}>
      <Box row align="center" gap="sm">
        <LiveDot color={colors.interactive.main} />
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.gate.checking')}
        </Text>
      </Box>
      <Skeleton width="70%" height={sizes.icon.lg} borderRadius="sm" />
      <Skeleton width="100%" height={sizes.thumbnail.lg} borderRadius="xl" />
      <Skeleton width="100%" height={sizes.thumbnail.lg} borderRadius="xl" />
      <Skeleton width="100%" height={sizes.thumbnail.md} borderRadius="xl" />
    </Box>
  );
};

export const OfferGate = memo(OfferGateComponent);
