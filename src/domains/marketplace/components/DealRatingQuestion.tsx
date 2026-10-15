import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import {
  moderateScale,
  motion,
  opacity,
  useStyles,
  useTheme,
} from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import {
  DEAL_RATING_CRITERION_COPY,
  type DealRatingScore,
} from '../constants/dealRating';
import type { DealRatingCriterion } from '../types';
import { DealRatingPads } from './DealRatingPads';

const DASH = moderateScale(28);
const DASH_ON = moderateScale(44);
const DASH_HEIGHT = moderateScale(6);
const PEEK_HEIGHT = moderateScale(60);

export interface DealRatingQuestionProps {
  criterion: DealRatingCriterion;
  index: number;
  total: number;
  value: number | undefined;
  onPick: (criterion: DealRatingCriterion, score: number) => void;
  /** Hidden on the first question. */
  onBack: (() => void) | null;
  onSkip: () => void;
}

/**
 * One question of the rating, as the front card of a deck (the cards still to come peek above
 * it): the progress dashes, the criterion, the five pads, and «back / skip» on the card's own foot.
 * A pick sends the card flying off toward the reading direction and the next one rises.
 */
const DealRatingQuestionComponent: React.FC<DealRatingQuestionProps> = ({
  criterion,
  index,
  total,
  value,
  onPick,
  onBack,
  onSkip,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const copy = DEAL_RATING_CRITERION_COPY[criterion];
  // The summary waits behind the last question too.
  const behind = Math.min(2, total - index);

  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<
      | 'deck'
      | 'peekFar'
      | 'peekNear'
      | 'card'
      | 'dash'
      | 'dashOn'
      | 'dashDone'
      | 'foot'
      | 'flip',
      ViewStyle
    > => {
      const peek: ViewStyle = {
        position: 'absolute',
        height: PEEK_HEIGHT,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
      };
      const dash: ViewStyle = {
        width: DASH,
        height: DASH_HEIGHT,
        borderRadius: radii.full,
        backgroundColor: colors.surface.elevated,
      };
      return {
        deck: { paddingTop: behind > 0 ? spacing.lg : 0 },
        peekFar: {
          ...peek,
          top: 0,
          start: spacing['2xl'],
          end: spacing['2xl'],
          opacity: opacity.deckFar,
        },
        peekNear: {
          ...peek,
          top: spacing.sm,
          start: spacing.md,
          end: spacing.md,
          opacity: opacity.deckNear,
        },
        card: {
          borderRadius: radii.xl,
          backgroundColor: colors.surface.main,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          ...shadows.lg,
        },
        dash,
        dashOn: {
          ...dash,
          width: DASH_ON,
          backgroundColor: colors.interactive.main,
        },
        dashDone: { ...dash, backgroundColor: colors.rating.dashDone },
        foot: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.lg,
          borderTopWidth: borderWidths.thin,
          borderTopColor: colors.border.default,
        },
        flip: { transform: [{ scaleX: isRTL ? -1 : 1 }] },
      };
    },
    [
      behind,
      colors.border.default,
      colors.interactive.main,
      colors.rating.dashDone,
      colors.surface.elevated,
      colors.surface.main,
      isRTL,
    ],
  );

  const pick = useCallback(
    (score: DealRatingScore) => onPick(criterion, score),
    [criterion, onPick],
  );

  const flyOut = (isRTL ? SlideOutLeft : SlideOutRight).duration(
    motion.duration.slow,
  );
  return (
    <Box style={styles.deck}>
      {behind > 1 ? <Box style={styles.peekFar} /> : null}
      {behind > 0 ? <Box style={styles.peekNear} /> : null}
      <Animated.View
        key={criterion}
        style={styles.card}
        entering={FadeInDown.springify()
          .damping(motion.spring.damping)
          .stiffness(motion.spring.stiffness)}
        exiting={flyOut}
      >
        <Box row align="center" justify="space-between">
          <Box
            row
            gap="xs"
            accessible
            accessibilityLabel={t(
              'marketplace.deals.rating.sheet.progressA11y',
              { current: index + 1, total },
            )}
          >
            {Array.from({ length: total }, (_, i) => (
              <Box
                key={i}
                style={
                  i === index
                    ? styles.dashOn
                    : i < index
                      ? styles.dashDone
                      : styles.dash
                }
              />
            ))}
          </Box>
          <Text variant="buttonSmall" color={colors.text.tertiary}>
            {t('marketplace.deals.rating.sheet.progress', {
              current: formatNumber(index + 1),
              total: formatNumber(total),
            })}
          </Text>
        </Box>
        <Box mt="lg" gap="xs">
          <Text
            variant="h3"
            color={colors.text.primary}
            accessibilityRole="header"
          >
            {t(copy.title)}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t(copy.hint)}
          </Text>
        </Box>
        <Box mt="xl">
          <DealRatingPads value={value} onPick={pick} />
        </Box>
        <Box style={styles.foot}>
          {onBack ? (
            <Pressable
              row
              align="center"
              gap="xs"
              py="md"
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.deals.rating.sheet.back')}
            >
              <Box style={styles.flip}>
                <ChevronLeft
                  size={sizes.icon.sm}
                  color={colors.interactive.text}
                />
              </Box>
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {t('marketplace.deals.rating.sheet.back')}
              </Text>
            </Pressable>
          ) : (
            <Box />
          )}
          <Pressable
            py="md"
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.deals.rating.sheet.skip')}
          >
            <Text variant="buttonSmall" color={colors.text.tertiary}>
              {t('marketplace.deals.rating.sheet.skip')}
            </Text>
          </Pressable>
        </Box>
      </Animated.View>
    </Box>
  );
};

export const DealRatingQuestion = memo(DealRatingQuestionComponent);
