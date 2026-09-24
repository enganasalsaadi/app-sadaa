import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';

/**
 * Layout gallery variant: `ctaButton` with `alwaysSolid` — a fixed bottom
 * CTA whose background never fades, even without a hero header to scroll past.
 */
const LayoutCtaButtonScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      withScroll
      ctaButton={{
        label: t('common.back'),
        onPress: goBack,
        alwaysSolid: true,
      }}
    >
      <Box gap="sm">
        <Text variant="h4">
          {t('devShowcase.layoutGallery.ctaButtonTitle')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.ctaButtonDescription')}
        </Text>
      </Box>
    </Layout>
  );
};

export const LayoutCtaButtonScreen = memo(LayoutCtaButtonScreenComponent);
