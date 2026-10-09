import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { Box, GlowOrbs, GradientSurface, StatusPill, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';

const GradientSurfaceDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="lg">
      <GradientSurface variant="brand" borderRadius="lg" p="lg" gap="xs">
        <Text variant="title" color={colors.text.onBrand}>
          {t('devShowcase.gradientSurface.brandTitle')}
        </Text>
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('devShowcase.gradientSurface.brandBody')}
        </Text>
      </GradientSurface>
      <GradientSurface variant="live" borderRadius="lg" p="lg" gap="xs">
        <GlowOrbs />
        <Text variant="title" color={colors.text.onBrand}>
          {t('devShowcase.gradientSurface.glowTitle')}
        </Text>
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('devShowcase.gradientSurface.glowBody')}
        </Text>
      </GradientSurface>
      <GradientSurface variant="premium" p="lg" gap="sm">
        <Box row align="center" gap="sm">
          <BadgeCheck size={sizes.icon.md} color={colors.premium.main} />
          <Box flex={1}>
            <Text variant="title">{t('devShowcase.gradientSurface.premiumTitle')}</Text>
          </Box>
          <StatusPill
            label={t('devShowcase.gradientSurface.premiumPill')}
            tone="premium"
            size="sm"
          />
        </Box>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.gradientSurface.premiumBody')}
        </Text>
      </GradientSurface>
    </Box>
  );
};

export const GradientSurfaceDemo = memo(GradientSurfaceDemoComponent);
