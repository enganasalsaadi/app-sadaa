import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, KeyValueRow, Text, Layout, LayoutFooter } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { formatMoney } from '@/core/i18n';
import { goBack } from '@/core/navigation';
import { DemoScrollRows } from '../components';
import { MOCK_DEAL_SUMMARY } from '../demos/mockData';

/** Layout gallery variant: `footerBehavior="elevate"`, with a total above the CTA (checkout, offer). */
const LayoutFooterElevateScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      header={{ title: t('devShowcase.layoutGallery.footerElevateTitle') }}
      footer={
        <LayoutFooter
          top={
            <KeyValueRow
              label={t('devShowcase.layoutGallery.totalLabel')}
              value={formatMoney(MOCK_DEAL_SUMMARY.budget)}
              emphasis="money"
            />
          }
          primary={{ label: t('devShowcase.layoutGallery.sendOffer'), onPress: goBack }}
        />
      }
      footerBehavior="elevate"
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.footerElevateDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutFooterElevateScreen = memo(LayoutFooterElevateScreenComponent);
