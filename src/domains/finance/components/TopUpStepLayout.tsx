import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Layout, StepProgress, Text } from '@/shared/ui';
import { TOP_UP_STEP_COUNT, TOP_UP_STEPS, type TopUpStepKey } from '../constants/topUp';
import { useTopUpFlow } from '../hooks/useTopUpFlow';

interface TopUpStepLayoutProps {
  step: TopUpStepKey;
  children: React.ReactNode;
  /** `LayoutFooter` with the step's one primary. */
  footer?: React.ReactNode;
}

/** Slim step bar pinned under the header: step title, "Step n of 4", progress. */
const StepBar = memo<{ step: TopUpStepKey }>(({ step }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const def = TOP_UP_STEPS[step];

  return (
    <Box gap="sm" pb="xs">
      <Box row align="center" justify="space-between" gap="md">
        <Text variant="bodyMedium" numberOfLines={1} accessibilityRole="header">
          {t(def.titleKey)}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('common.stepOf', { current: def.index, total: TOP_UP_STEP_COUNT })}
        </Text>
      </Box>
      <StepProgress
        current={def.index}
        total={TOP_UP_STEP_COUNT}
        tone="surface"
        accessibilityLabel={t('finance.topUp.progressA11y', { current: def.index, total: TOP_UP_STEP_COUNT })}
      />
    </Box>
  );
});

/**
 * Money wizard chrome (rule 09 §2): solid header, ✕ on the first step (leaves the flow,
 * asking first when something was entered) and ← after it, the step bar pinned under it,
 * the step's primary in the footer above the keyboard.
 */
const TopUpStepLayoutComponent: React.FC<TopUpStepLayoutProps> = ({ step, children, footer }) => {
  const { t } = useTranslation();
  const { close } = useTopUpFlow();
  const first = TOP_UP_STEPS[step].index === 1;

  return (
    <Layout
      header={{
        title: t('finance.topUp.title'),
        backIcon: first ? 'close' : 'back',
        onBackPress: first ? close : undefined,
      }}
      sticky={<StepBar step={step} />}
      footer={footer}
    >
      {children}
    </Layout>
  );
};

export const TopUpStepLayout = memo(TopUpStepLayoutComponent);
