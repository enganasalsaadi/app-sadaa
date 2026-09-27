import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { DemoScrollRows } from '../components';

/** Layout gallery variant: `headerBehavior="collapse"` (root screens, settings, wallet). */
const LayoutCollapseHeaderScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      header={{
        title: t('devShowcase.layoutGallery.collapseTitle'),
        subtitle: t('devShowcase.layoutGallery.scrollHint'),
      }}
      headerBehavior="collapse"
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.collapseDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutCollapseHeaderScreen = memo(LayoutCollapseHeaderScreenComponent);
