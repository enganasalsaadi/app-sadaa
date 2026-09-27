import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, SegmentedControl } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { DemoScrollRows } from '../components';
import { useLayoutStickyScreen } from './hooks/useLayoutStickyScreen';

/** Layout gallery variant: `sticky` filter pinned under a fixed header. */
const LayoutStickyScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const screen = useLayoutStickyScreen();

  return (
    <Layout
      header={{ title: t('devShowcase.layoutGallery.stickyTitle') }}
      sticky={
        <SegmentedControl
          options={screen.options}
          value={screen.filter}
          onChange={screen.setFilter}
          accessibilityLabel={t('devShowcase.layoutGallery.filterLabel')}
        />
      }
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.stickyDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutStickyScreen = memo(LayoutStickyScreenComponent);
