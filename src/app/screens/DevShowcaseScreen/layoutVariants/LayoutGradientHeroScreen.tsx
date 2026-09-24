import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';

/**
 * Layout gallery variant: `withGradient` — a soft brand-tinted wash at the
 * top of the screen (`colors.gradients.screenWash`), independent of any
 * hero header.
 */
const LayoutGradientHeroScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout withScroll withGradient>
      <Box gap="lg">
        <CustomButton
          title={t('common.back')}
          onPress={goBack}
          variant="outline"
          size="sm"
        />
        <Text variant="h4">
          {t('devShowcase.layoutGallery.gradientHeroTitle')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.gradientHeroDescription')}
        </Text>
      </Box>
    </Layout>
  );
};

export const LayoutGradientHeroScreen = memo(LayoutGradientHeroScreenComponent);
