import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { moderateScale, opacity, useStyles } from '@/core/theme';
import { Box } from '@/shared/ui';
import type { StrengthStageKey } from '@/domains/identity';
import { useNextStepDeck } from '../../../hooks/useNextStepDeck';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { homeTaskKey, type HomeTask } from '../utils/buildHomeTasks';
import { TaskCard } from './TaskCard';

/** How much of the next card, then of the one behind it, shows under the front card. */
const PEEK_NEAR = moderateScale(11);
const PEEK_FAR = moderateScale(21);
const NEAR_INSET = moderateScale(12);
const FAR_INSET = moderateScale(24);
const GHOST_HEIGHT = moderateScale(90);
/** Degrees of tilt per point of drag. */
const TILT = 1 / 40;
/** The next card rises from this far down, this much smaller. */
const RISE = moderateScale(22);
const RISE_SCALE = 0.05;

interface ActionDeckProps {
  tasks: readonly HomeTask[];
  welcome: boolean;
  notice: CreatorHomeScreenModel['notice'];
  onOpenDeal: (id: string) => void;
  onStep: (stage: StrengthStageKey) => void;
}

/**
 * Everything waiting on the creator as one deck, the most pressing card in front and the next
 * ones peeking from behind. Swipe (or «next») throws the front card away and the next springs up.
 */
const ActionDeckComponent: React.FC<ActionDeckProps> = ({ tasks, welcome, notice, onOpenDeal, onStep }) => {
  const { t } = useTranslation();
  const count = tasks.length;
  const { gesture, drag, enter, index, next } = useNextStepDeck(count);
  const task = tasks[index];

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
        opacity: opacity.deckNear,
      },
      far: {
        position: 'absolute',
        start: FAR_INSET,
        end: FAR_INSET,
        bottom: 0,
        height: GHOST_HEIGHT,
        borderRadius: radii.xl,
        backgroundColor: palette.surface.main,
        opacity: opacity.deckFar,
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

  if (!task) return null;

  return (
    <Box mx="xl" style={styles.stacked}>
      {count > 2 ? <Box style={styles.far} shadow="sm" pointerEvents="none" /> : null}
      {count > 1 ? <Box style={styles.near} shadow="card" pointerEvents="none" /> : null}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.card, cardStyle]}
          accessibilityHint={count > 1 ? t('marketplace.creatorHome.tasks.deckHint') : undefined}
        >
          <TaskCard
            key={homeTaskKey(task)}
            task={task}
            index={index}
            count={count}
            onNext={next}
            notice={notice}
            welcome={welcome}
            onOpenDeal={onOpenDeal}
            onStep={onStep}
          />
        </Animated.View>
      </GestureDetector>
    </Box>
  );
};

export const ActionDeck = memo(ActionDeckComponent);
