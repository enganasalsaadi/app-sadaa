import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import {
  ratingHoursLeft,
  ratingWindowLeft,
} from '../utils/dealRating';
import { formatDuration, toDurationParts } from '../utils/offerDuration';

const STROKE = 4;
const DIAMETER = { sm: moderateScale(44), md: moderateScale(52) } as const;

export interface DealRatingClockProps {
  dueAt: number | null;
  now: number;
  size?: keyof typeof DIAMETER;
}

/**
 * What is left of the seven-day rating window: a teal arc that shrinks as it runs out, with the
 * days (or, near the end, hours) in its middle. Display only; the server closes the window.
 */
const DealRatingClockComponent: React.FC<DealRatingClockProps> = ({
  dueAt,
  now,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const hours = ratingHoursLeft(dueAt, now) ?? 0;
  const { unit, count } = toDurationParts(hours);
  const d = DIAMETER[size];
  const r = (d - STROKE) / 2;
  const length = 2 * Math.PI * r;
  const left = ratingWindowLeft(dueAt, now);
  return (
    <Box
      width={d}
      height={d}
      align="center"
      justify="center"
      accessible
      accessibilityLabel={t('marketplace.deals.rating.clock.a11y', {
        duration: formatDuration(t, hours),
      })}
    >
      <Svg width={d} height={d} style={StyleSheet.absoluteFill}>
        <Circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          fill="none"
          stroke={colors.surface.elevated}
          strokeWidth={STROKE}
        />
        <Circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          fill="none"
          stroke={colors.interactive.main}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${length * left} ${length}`}
          rotation={-90}
          origin={`${d / 2}, ${d / 2}`}
        />
      </Svg>
      <Text variant="buttonSmall" color={colors.text.primary}>
        {formatNumber(count)}
      </Text>
      <Text variant="overline" color={colors.text.tertiary}>
        {unit === 'days'
          ? t('marketplace.deals.rating.clock.unitDays', { count })
          : t('marketplace.deals.rating.clock.unitHours', { count })}
      </Text>
    </Box>
  );
};

export const DealRatingClock = memo(DealRatingClockComponent);
