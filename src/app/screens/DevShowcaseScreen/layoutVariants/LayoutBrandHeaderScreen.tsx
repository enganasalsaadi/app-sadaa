import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search } from 'lucide-react-native';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { DemoScrollRows } from '../components';

const noop = () => {};
const UNREAD_COUNT = 3;

/** Layout gallery variant: navy `brand` header (identity screens: wallet, dashboard). */
const LayoutBrandHeaderScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      header={{
        title: t('devShowcase.layoutGallery.brandHeaderTitle'),
        variant: 'brand',
        actions: [
          { icon: Search, accessibilityLabel: t('common.search'), onPress: noop },
          {
            icon: Bell,
            accessibilityLabel: t('devShowcase.iconButton.notifications'),
            onPress: noop,
            badge: UNREAD_COUNT,
          },
        ],
      }}
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.brandHeaderDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutBrandHeaderScreen = memo(LayoutBrandHeaderScreenComponent);
