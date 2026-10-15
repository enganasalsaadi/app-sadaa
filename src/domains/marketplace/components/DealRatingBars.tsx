import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import {
  DEAL_RATING_CRITERION_COPY,
  DEAL_RATING_LIMITS,
} from '../constants/dealRating';
import type { DealRatingCriterion } from '../types';
import type { DealRatingScores } from '../utils/dealRating';

const BAR_HEIGHT = moderateScale(8);
/** The bars fill after the card has opened. */
const FILL_DELAY = motion.duration.slow;

const Bar = memo<{ criterion: DealRatingCriterion; score: number }>(
  ({ criterion, score }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const reduceMotion = useReducedMotion();
    const share = score / DEAL_RATING_LIMITS.maxScore;
    const fill = useSharedValue(reduceMotion ? share : 0);
    useEffect(() => {
      if (reduceMotion) {
        fill.value = share;
        return;
      }
      fill.value = withDelay(
        FILL_DELAY,
        withTiming(share, { duration: motion.duration.draw }),
      );
    }, [fill, reduceMotion, share]);
    const fillStyle = useAnimatedStyle(() => ({
      width: `${fill.value * 100}%`,
    }));
    const styles = useStyles(
      ({ radii }): Record<'label' | 'track' | 'fill' | 'value', ViewStyle> => ({
        label: { width: '42%' },
        track: {
          flex: 1,
          height: BAR_HEIGHT,
          borderRadius: radii.full,
          backgroundColor: colors.surface.elevated,
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          borderRadius: radii.full,
          backgroundColor: colors.interactive.main,
        },
        value: { minWidth: moderateScale(20), alignItems: 'center' },
      }),
      [colors.interactive.main, colors.surface.elevated],
    );
    const title = t(DEAL_RATING_CRITERION_COPY[criterion].title);
    return (
      <Box
        row
        align="center"
        gap="sm"
        accessible
        accessibilityLabel={t('marketplace.deals.rating.sheet.padA11y', {
          score,
          level: title,
        })}
      >
        <Box style={styles.label}>
          <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <Box style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </Box>
        <Box style={styles.value}>
          <Text variant="buttonSmall" color={colors.text.primary}>
            {formatNumber(score)}
          </Text>
        </Box>
      </Box>
    );
  },
);

export interface DealRatingBarsProps {
  criteria: readonly DealRatingCriterion[];
  scores: DealRatingScores;
}

/** One bar per criterion that has a score, filling to it once (at once under reduced motion). */
const DealRatingBarsComponent: React.FC<DealRatingBarsProps> = ({
  criteria,
  scores,
}) => (
  <Box gap="sm">
    {criteria.map(criterion => {
      const score = scores[criterion];
      return score === undefined ? null : (
        <Bar key={criterion} criterion={criterion} score={score} />
      );
    })}
  </Box>
);

export const DealRatingBars = memo(DealRatingBarsComponent);
