import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealTransitDays } from '../utils/dealShipping';

const CELL_HEIGHT = moderateScale(10);
const DAY_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export interface DealTransitMeterProps {
  days: DealTransitDays;
  /** Under the cells, at the reading start: whose move it is. */
  hint: string;
}

/**
 * The waybill's day meter: one cell per day on the way, filled as days pass, the last one a
 * dashed amber flag (the day a delay can be reported). Read as one line by screen readers.
 */
const DealTransitMeterComponent: React.FC<DealTransitMeterProps> = ({ days, hint }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'cell' | 'on' | 'flag', ViewStyle> => ({
      cell: {
        flex: 1,
        height: CELL_HEIGHT,
        borderRadius: radii.xs,
        backgroundColor: colors.surface.elevated,
      },
      on: { backgroundColor: colors.interactive.main },
      flag: {
        backgroundColor: colors.status.warning.soft,
        borderWidth: borderWidths.sm,
        borderStyle: 'dashed',
        borderColor: colors.status.warning.main,
      },
    }),
    [colors],
  );
  const count = t('marketplace.deals.shipping.waybill.days', {
    elapsed: formatNumber(days.elapsed, {}, i18n.language),
    total: formatNumber(days.total, {}, i18n.language),
  });
  const report = days.reportOpen
    ? t('marketplace.deals.shipping.waybill.reportOpen')
    : t('marketplace.deals.shipping.waybill.reportFrom', {
        date: formatDate(days.reportFrom, DAY_FORMAT, i18n.language),
      });
  return (
    <Box gap="sm" accessible accessibilityLabel={`${count}. ${hint}. ${report}`}>
      <Box row justify="space-between" align="center">
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.deals.shipping.waybill.onTheWay')}
        </Text>
        <Text variant="buttonSmall" color={colors.text.primary}>
          {count}
        </Text>
      </Box>
      <Box row gap="xs">
        {Array.from({ length: days.total }, (_, index) => {
          const last = index === days.total - 1;
          const lit = index < days.elapsed;
          return (
            <Box
              key={index}
              style={[styles.cell, lit ? styles.on : last ? styles.flag : undefined]}
            />
          );
        })}
      </Box>
      <Box row justify="space-between" gap="md">
        <Box flex={1}>
          <Text variant="caption" color={colors.text.tertiary} numberOfLines={2}>
            {hint}
          </Text>
        </Box>
        <Text variant="caption" color={colors.status.warning.text} numberOfLines={1}>
          {report}
        </Text>
      </Box>
    </Box>
  );
};

export const DealTransitMeter = memo(DealTransitMeterComponent);
