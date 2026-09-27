import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, LayoutFooter } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';

/**
 * Layout gallery variant: `footer` with `LayoutFooter` — the primary action
 * pinned below the content and above the keyboard.
 */
const LayoutCtaButtonScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      footer={
        <LayoutFooter primary={{ label: t('common.back'), onPress: goBack }} />
      }
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
