import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';

/**
 * Layout gallery variant: `withScroll` with no `screenHeader`/`heroHeader` —
 * a plain scrollable body, back navigation handled inline.
 */
const LayoutNoHeaderScrollScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout withScroll>
      <Box gap="lg">
        <CustomButton
          title={t('common.back')}
          onPress={goBack}
          variant="outline"
          size="sm"
        />
        <Text variant="h4">
          {t('devShowcase.layoutGallery.noHeaderScrollTitle')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.noHeaderScrollDescription')}
        </Text>
      </Box>
    </Layout>
  );
};

export const LayoutNoHeaderScrollScreen = memo(
  LayoutNoHeaderScrollScreenComponent,
);
