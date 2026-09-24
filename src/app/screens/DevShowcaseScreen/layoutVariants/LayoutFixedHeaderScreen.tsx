import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';

/**
 * Layout gallery variant: fixed `ScreenHeader` with `fillStatusBar` — the
 * header paints over the status-bar area, so `edges` is `['left', 'right']`.
 */
const LayoutFixedHeaderScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      withScroll
      screenHeader={{
        title: t('devShowcase.layoutGallery.fixedHeaderTitle'),
        fillStatusBar: true,
      }}
      edges={['left', 'right']}
    >
      <Box pt="xl" gap="sm">
        <Text variant="h4">{t('devShowcase.layoutGallery.fixedHeaderTitle')}</Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.fixedHeaderDescription')}
        </Text>
      </Box>
    </Layout>
  );
};

export const LayoutFixedHeaderScreen = memo(LayoutFixedHeaderScreenComponent);
