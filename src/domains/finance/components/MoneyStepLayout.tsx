import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Layout, StepProgress, Text } from '@/shared/ui';

export interface MoneyStepLayoutProps {
  /** The flow's name in the header ("Top up", "Withdraw earnings"). */
  title: string;
  stepTitle: string;
  /** 1-based. */
  index: number;
  total: number;
  progressLabel: string;
  /** Step 1's ✕: leaves the flow. */
  onClose: () => void;
  children: React.ReactNode;
  /** `LayoutFooter` with the step's one primary. */
  footer?: React.ReactNode;
}

interface StepBarProps {
  stepTitle: string;
  index: number;
  total: number;
  progressLabel: string;
}

/** Slim step bar pinned under the header: step title, "Step n of N", progress. */
const StepBar = memo<StepBarProps>(({ stepTitle, index, total, progressLabel }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="sm" pb="xs">
      <Box row align="center" justify="space-between" gap="md">
        <Text variant="bodyMedium" numberOfLines={1} accessibilityRole="header">
          {stepTitle}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('common.stepOf', { current: index, total })}
        </Text>
      </Box>
      <StepProgress current={index} total={total} tone="surface" accessibilityLabel={progressLabel} />
    </Box>
  );
});

/**
 * Money wizard chrome (rule 09 §2), shared by top-up and withdraw: solid header, ✕ on the
 * first step (leaves the flow, asking first when something was entered) and ← after it,
 * the step bar pinned under it, the step's primary in the footer above the keyboard.
 */
const MoneyStepLayoutComponent: React.FC<MoneyStepLayoutProps> = ({
  title,
  stepTitle,
  index,
  total,
  progressLabel,
  onClose,
  children,
  footer,
}) => {
  const first = index === 1;
  return (
    <Layout
      header={{ title, backIcon: first ? 'close' : 'back', onBackPress: first ? onClose : undefined }}
      sticky={<StepBar stepTitle={stepTitle} index={index} total={total} progressLabel={progressLabel} />}
      footer={footer}
    >
      {children}
    </Layout>
  );
};

export const MoneyStepLayout = memo(MoneyStepLayoutComponent);
