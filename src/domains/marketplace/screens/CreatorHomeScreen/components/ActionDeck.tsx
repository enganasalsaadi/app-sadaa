import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { useNextStepDeck } from '../../../hooks/useNextStepDeck';
import type { CreatorActiveDeal } from '../../../types';
import { ActionCard } from './ActionCard';

/** How much of the next card, then of the one behind it, shows under the front card. */
const PEEK_NEAR = moderateScale(16);
const PEEK_FAR = moderateScale(30);
const NEAR_INSET = moderateScale(14);
const FAR_INSET = moderateScale(28);
const GHOST_HEIGHT = moderateScale(90);
const DOT = moderateScale(6);
const DOT_ON = moderateScale(20);
/** Dots beyond this would crowd the row; the «1 of 3» text still counts them all. */
const MAX_DOTS = 6;
/** Degrees of tilt per point of drag. */
const TILT = 1 / 40;
/** The next card rises from this far down, this much smaller. */
const RISE = moderateScale(26);
const RISE_SCALE = 0.06;

interface ActionDeckProps {
  deals: CreatorActiveDeal[];
  onOpen: (id: string) => void;
}

/**
 * The deals waiting on the creator as a deck: the most pressing card in front, the next ones
 * peeking from behind. Swipe (or tap «1 of 3») brings the next one up; the front card follows the
 * finger and tilts, then the next springs into place.
 */
const ActionDeckComponent: React.FC<ActionDeckProps> = ({ deals, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const count = deals.length;
  const { gesture, drag, enter, index, next } = useNextStepDeck(count);
  const deal = deals[index];

  const styles = useStyles(
    ({ radii, shadows, colors: palette }): Record<'stacked' | 'card' | 'near' | 'far', ViewStyle> => ({
      stacked: { paddingBottom: count > 2 ? PEEK_FAR : count > 1 ? PEEK_NEAR : 0 },
      // On the moving view itself: Android stacks siblings by elevation, so the front card must
      // out-rank the ghosts, and draws elevation only from a background.
      card: { ...shadows.lg, borderRadius: radii.xl, backgroundColor: palette.surface.main },
      near: {
        position: 'absolute',
        start: NEAR_INSET,
        end: NEAR_INSET,
        bottom: count > 2 ? PEEK_FAR - PEEK_NEAR : 0,
        height: GHOST_HEIGHT,
        borderRadius: radii.xl,
        backgroundColor: palette.surface.main,
      },
      far: {
        position: 'absolute',
        start: FAR_INSET,
        end: FAR_INSET,
        bottom: 0,
        height: GHOST_HEIGHT,
        borderRadius: radii.xl,
        backgroundColor: palette.surface.main,
        opacity: 0.6,
      },
    }),
    [count],
  );

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(drag.value), [0, 400], [1, 0], 'clamp'),
    transform: [
      { translateX: drag.value },
      { translateY: enter.value * RISE },
      { rotate: `${drag.value * TILT}deg` },
      { scale: 1 - enter.value * RISE_SCALE },
    ],
  }));

  if (!deal) return null;

  return (
    <Box gap="md">
      <Box mx="xl" style={styles.stacked}>
        {count > 2 ? <Box style={styles.far} shadow="sm" pointerEvents="none" /> : null}
        {count > 1 ? <Box style={styles.near} shadow="card" pointerEvents="none" /> : null}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.card, cardStyle]}
            accessibilityHint={count > 1 ? t('marketplace.creatorHome.deals.deckHint') : undefined}
          >
            <ActionCard deal={deal} onOpen={onOpen} />
          </Animated.View>
        </GestureDetector>
      </Box>
      {count > 1 ? (
        <Pressable
          row
          align="center"
          justify="center"
          gap="sm"
          minHeight={moderateScale(44)}
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.deals.nextLabel')}
        >
          <Box row align="center" gap="xs" importantForAccessibility="no-hide-descendants">
            {Array.from({ length: Math.min(count, MAX_DOTS) }, (_, dot) => (
              <Box
                key={dot}
                width={dot === index ? DOT_ON : DOT}
                height={DOT}
                borderRadius="full"
                bg={dot === index ? colors.interactive.main : colors.border.default}
              />
            ))}
          </Box>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.creatorHome.deals.position', { index: index + 1, count })}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const ActionDeck = memo(ActionDeckComponent);
