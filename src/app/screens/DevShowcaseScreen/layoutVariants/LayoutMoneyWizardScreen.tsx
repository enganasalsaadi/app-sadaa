import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Layout, LayoutFooter, StepProgress, Text } from '@/shared/ui';
import { DemoScrollRows } from '../components';
import { useLayoutMoneyWizardScreen } from './hooks/useLayoutMoneyWizardScreen';

/** Layout gallery variant: the Money wizard (solid header, ✕ on step 1, slim step bar, footer primary). */
const LayoutMoneyWizardScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const screen = useLayoutMoneyWizardScreen();

  return (
    <Layout
      header={{
        title: t('devShowcase.layoutGallery.moneyWizardTitle'),
        backIcon: screen.first ? 'close' : 'back',
        onBackPress: screen.back,
      }}
      sticky={
        <Box gap="sm" pb="xs">
          <Box row align="center" justify="space-between">
            <Text variant="bodyMedium">{t('devShowcase.layoutGallery.moneyWizardStep')}</Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {t('common.stepOf', { current: screen.step, total: screen.total })}
            </Text>
          </Box>
          <StepProgress
            current={screen.step}
            total={screen.total}
            tone="surface"
            accessibilityLabel={t('common.stepOf', { current: screen.step, total: screen.total })}
          />
        </Box>
      }
      footer={<LayoutFooter primary={{ label: t('common.next'), onPress: screen.next, disabled: screen.last }} />}
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.moneyWizardDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutMoneyWizardScreen = memo(LayoutMoneyWizardScreenComponent);
