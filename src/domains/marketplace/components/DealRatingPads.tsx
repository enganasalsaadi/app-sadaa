import React, { memo, useCallback } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Pressable, Text } from '@/shared/ui';
import {
  DEAL_RATING_LEVEL_LABEL,
  DEAL_RATING_SCORES,
  type DealRatingScore,
} from '../constants/dealRating';

const PAD_HEIGHT = moderateScale(84);
const LIFT = -moderateScale(6);

/** `on`: the picked score · `lit`: every score under it · `idle`: above it, or nothing picked. */
type PadState = 'on' | 'lit' | 'idle';

const padState = (score: number, value: number | undefined): PadState =>
  value === undefined || score > value ? 'idle' : score === value ? 'on' : 'lit';

const RatingPad = memo<{
  score: DealRatingScore;
  state: PadState;
  onPick: (score: DealRatingScore) => void;
}>(({ score, state, onPick }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const on = state === 'on';
  const level = t(DEAL_RATING_LEVEL_LABEL[score]);

  const styles = useStyles(
    ({ radii, borderWidths, spacing }): Record<'flex' | 'pad', ViewStyle> => ({
      flex: { flex: 1 },
      pad: {
        height: PAD_HEIGHT,
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderColor:
          state === 'idle' ? colors.border.default : colors.interactive.main,
        backgroundColor:
          state === 'on'
            ? colors.interactive.main
            : state === 'lit'
              ? colors.interactive.soft
              : colors.layout.base,
        shadowColor: colors.rating.padGlow,
        shadowOffset: { width: 0, height: on ? spacing.md : 0 },
        shadowOpacity: on ? 1 : 0,
        shadowRadius: on ? spacing.md : 0,
        elevation: on ? spacing.sm : 0,
      },
    }),
    [
      colors.border.default,
      colors.interactive.main,
      colors.interactive.soft,
      colors.layout.base,
      colors.rating.padGlow,
      on,
      state,
    ],
  );

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: reduceMotion
          ? 0
          : withSpring(on ? LIFT : 0, motion.spring),
      },
    ],
  }));

  const pick = useCallback(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    onPick(score);
  }, [onPick, score]);

  const ink =
    state === 'on'
      ? colors.text.onAccent
      : state === 'lit'
        ? colors.interactive.text
        : colors.text.primary;
  return (
    <Animated.View style={[styles.flex, liftStyle]}>
      <Pressable
        style={styles.pad}
        onPress={pick}
        scaleOnPress
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        accessibilityLabel={t('marketplace.deals.rating.sheet.padA11y', {
          score,
          level,
        })}
      >
        <Text variant="h3" color={ink}>
          {formatNumber(score)}
        </Text>
        <Text
          variant="caption"
          color={state === 'on' ? colors.text.onAccent : colors.text.tertiary}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {level}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

export interface DealRatingPadsProps {
  value: number | undefined;
  onPick: (score: DealRatingScore) => void;
}

/**
 * Five tall score pads, 1 (ضعيف) to 5 (ممتاز), each with its word. A tap lifts the pad, fills it
 * teal and tints every pad under it, with a light buzz.
 */
const DealRatingPadsComponent: React.FC<DealRatingPadsProps> = ({
  value,
  onPick,
}) => {
  const styles = useStyles(
    ({ spacing }): Record<'row', ViewStyle> => ({
      row: { flexDirection: 'row', gap: spacing.sm },
    }),
  );
  return (
    <Animated.View style={styles.row} accessibilityRole="radiogroup">
      {DEAL_RATING_SCORES.map(score => (
        <RatingPad
          key={score}
          score={score}
          state={padState(score, value)}
          onPick={onPick}
        />
      ))}
    </Animated.View>
  );
};

export const DealRatingPads = memo(DealRatingPadsComponent);
