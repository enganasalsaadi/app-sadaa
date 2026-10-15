import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import type { BrandActiveDeal } from '../../../types';
import { useNextStepDeck } from '../hooks/useNextStepDeck';
import { NextStepCard } from './NextStepCard';

/** Room under the card: the next card's peek line, then the far card's edge. */
const PEEK_STRIP = moderateScale(34);
const FAR_EDGE = moderateScale(8);
const NEAR_INSET = moderateScale(12);
const FAR_INSET = moderateScale(26);
const GHOST_HEIGHT = moderateScale(80);
const PEEK_FACE = moderateScale(20);
/** Degrees of tilt per point of drag. */
const TILT = 1 / 40;
/** The next card rises from this far down, this much smaller. */
const RISE = moderateScale(26);
const RISE_SCALE = 0.06;

interface NextStepDeckProps {
  deals: BrandActiveDeal[];
  onOpen: (id: string) => void;
}

/**
 * The deals waiting on the brand as one card at a time, the next ones stacked behind with a
 * peek of who and what comes next. Swipe or the arrow moves on; «1 of 3» counts them.
 */
const NextStepDeckComponent: React.FC<NextStepDeckProps> = ({ deals, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const count = deals.length;
  const { gesture, drag, enter, index, next } = useNextStepDeck(count);
  const deal = deals[index];
  const upcoming = count > 1 ? deals[(index + 1) % count] : undefined;

  const styles = useStyles(
    ({ radii, shadows, colors: palette }): Record<'stacked' | 'card' | 'near' | 'far' | 'peek', ViewStyle> => ({
      stacked: { paddingBottom: PEEK_STRIP + FAR_EDGE },
      // On the moving view itself: Android stacks siblings by elevation, so the card must out-rank
      // the ghosts, and draws elevation only from a background (hidden under the gradient).
      card: {
        ...shadows.lg,
        borderRadius: radii.xl,
        backgroundColor: palette.gradients.heroLive[0] ?? palette.brand.main,
      },
      near: {
        position: 'absolute',
        start: NEAR_INSET,
        end: NEAR_INSET,
        bottom: FAR_EDGE,
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
        opacity: 0.55,
      },
      peek: {
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: 0,
        height: PEEK_STRIP,
      },
    }),
    [],
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
    <Box mx="xl" style={upcoming ? styles.stacked : undefined}>
      {count > 2 ? <Box style={styles.far} shadow="sm" pointerEvents="none" /> : null}
      {upcoming ? (
        <Box style={styles.near} shadow="card" pointerEvents="none">
          <Box style={styles.peek} row align="center" gap="sm" px="lg">
            <DealFace party={upcoming.creator} size={PEEK_FACE} />
            <Box flex={1}>
              <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                {t('marketplace.brandHome.deals.next.peek', {
                  name: upcoming.creator.name ?? '',
                  action: upcoming.action?.label ?? upcoming.status.label,
                })}
              </Text>
            </Box>
          </Box>
        </Box>
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.card, cardStyle]}
          accessibilityHint={count > 1 ? t('marketplace.brandHome.deals.next.hint') : undefined}
        >
          <NextStepCard
            deal={deal}
            index={index}
            count={count}
            onOpen={onOpen}
            onNext={count > 1 ? next : undefined}
          />
        </Animated.View>
      </GestureDetector>
    </Box>
  );
};

export const NextStepDeck = memo(NextStepDeckComponent);
