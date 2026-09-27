import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { DemoScrollRows } from '../components';

const noop = () => {};

/** Layout gallery variant: `headerBehavior="hideOnScroll"` (feeds, long reads). */
const LayoutHideOnScrollScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      header={{
        title: t('devShowcase.layoutGallery.hideOnScrollTitle'),
        actions: [{ icon: Search, accessibilityLabel: t('common.search'), onPress: noop }],
      }}
      headerBehavior="hideOnScroll"
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.hideOnScrollDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutHideOnScrollScreen = memo(LayoutHideOnScrollScreenComponent);
