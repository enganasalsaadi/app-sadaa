import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { DemoScrollRows } from '../components';

/** Layout gallery variant: default `fixed` header; its divider fades in once content scrolls under it. */
const LayoutFixedHeaderScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout header={{ title: t('devShowcase.layoutGallery.fixedHeaderTitle') }}>
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.fixedHeaderDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutFixedHeaderScreen = memo(LayoutFixedHeaderScreenComponent);
