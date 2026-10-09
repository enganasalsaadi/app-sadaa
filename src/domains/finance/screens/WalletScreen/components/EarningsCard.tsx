import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { BarChart, Box, Card, MoneyText, Notice, SegmentedControl, Skeleton, Text } from '@/shared/ui';
import type { WalletEarningsModel } from '../hooks/useWalletEarnings';

/** Two short period labels side by side beside the title. */
const PERIOD_SWITCH_WIDTH = moderateScale(164);

interface EarningsCardProps {
  earnings: WalletEarningsModel;
  hidden: boolean;
}

/** Monthly bars with the period's total and a 6-month / year switch; the current month carries its value. */
const EarningsCardComponent: React.FC<EarningsCardProps> = ({ earnings, hidden }) => {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { status, chart } = earnings;

  if (status === 'initial' || status === 'hidden') return null;
  if (status === 'error') {
    return (
      <Notice
        tone="danger"
        message={t('finance.wallet.earnings.loadFailed')}
        action={{ label: t('common.retry'), onPress: earnings.retry }}
      />
    );
  }

  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="flex-start" justify="space-between" gap="md">
          <Box flex={1} gap="xs">
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
              {earnings.title}
            </Text>
            {chart ? (
              <MoneyText
                value={chart.total}
                size="title"
                tone={earnings.tone === 'money' ? 'money' : 'default'}
                rounding="down"
                hidden={hidden}
              />
            ) : (
              <Skeleton width="60%" height={typography.amountTitle.lineHeight} borderRadius="xs" />
            )}
          </Box>
          <Box width={PERIOD_SWITCH_WIDTH}>
            <SegmentedControl
              options={earnings.periodOptions}
              value={earnings.period}
              onChange={earnings.setPeriod}
              accessibilityLabel={t('finance.wallet.earnings.periodA11y')}
            />
          </Box>
        </Box>
        <BarChart
          data={chart?.bars ?? []}
          highlightIndex={chart?.highlightIndex}
          highlightLabel={hidden ? undefined : chart?.bubble}
          tone={earnings.tone}
          loading={!chart}
          accessibilityLabel={hidden ? earnings.title : chart?.accessibilityLabel ?? earnings.title}
        />
      </Box>
    </Card>
  );
};

export const EarningsCard = memo(EarningsCardComponent);
