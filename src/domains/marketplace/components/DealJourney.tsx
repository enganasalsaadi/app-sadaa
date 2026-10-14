import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Text, useLayoutInView, useLoopClock } from '@/shared/ui';
import { useDealJourneyCopy, type DealJourneyCopyInput } from '../hooks/useDealJourneyCopy';
import { buildDealJourney, DEAL_JOURNEY_STAGES, type DealJourneyStageKey } from '../utils/dealJourney';
import { DealJourneyCard } from './DealJourneyCard';
import { DealJourneyRail } from './DealJourneyRail';

const SWIPE = 40;
const DOT = moderateScale(6);
const DOT_ON = moderateScale(18);

export interface DealJourneyProps extends DealJourneyCopyInput {
  /** The station the deal is at (`sign` while planning). */
  current: DealJourneyStageKey;
  /** Live reply station: the creator's answer deadline (server `due_at`). */
  replyDueAt?: number | null;
}

/**
 * «What happens after you sign?»: every station of a direct deal on one rail, and a card for
 * the selected one (tap a station, swipe the card or use the arrows). Windows, amounts and
 * names are this deal's own; nothing is a calendar date.
 */
const DealJourneyComponent: React.FC<DealJourneyProps> = ({ current, replyDueAt = null, ...copyInput }) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const stages = useMemo(
    () => buildDealJourney({ hasProduct: copyInput.shippingMode !== 'none', current }),
    [copyInput.shippingMode, current],
  );
  const copy = useDealJourneyCopy(copyInput);
  const names = useMemo(
    () =>
      Object.fromEntries(DEAL_JOURNEY_STAGES.map(key => [key, copy[key].name])) as Record<DealJourneyStageKey, string>,
    [copy],
  );
  const now = Math.max(0, stages.findIndex(stage => stage.status === 'now'));
  const [selected, setSelected] = useState(now);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const count = stages.length;

  // A deal moving on (live) brings the card back to where it now is.
  const lastNow = useRef(now);
  useEffect(() => {
    if (lastNow.current === now) return;
    lastNow.current = now;
    setDirection(null);
    setSelected(now);
  }, [now]);

  const select = useCallback(
    (index: number) => {
      const next = Math.min(count - 1, Math.max(0, index));
      if (next === selected) return;
      Vibration.vibrate(HAPTIC_TAP_MS);
      setDirection(next > selected ? 'next' : 'prev');
      setSelected(next);
    },
    [count, selected],
  );
  const goPrev = useCallback(() => select(selected - 1), [select, selected]);
  const goNext = useCallback(() => select(selected + 1), [select, selected]);

  // RTL: a swipe toward the right reads forward.
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-20, 20])
        .failOffsetY([-12, 12])
        .onEnd(event => {
          if (Math.abs(event.translationX) < SWIPE) return;
          const forward = isRTL ? event.translationX > 0 : event.translationX < 0;
          if (forward) goNext();
          else goPrev();
        }),
    [goNext, goPrev, isRTL],
  );

  const { ref, onLayout, revealed, visible } = useLayoutInView({ track: true });
  const intro = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (revealed) intro.value = reduceMotion ? 1 : withTiming(1, { duration: motion.duration.draw });
  }, [intro, reduceMotion, revealed]);
  const moving = visible && !reduceMotion;
  const clock = useLoopClock(motion.loop.comet, moving);

  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'counter', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        ...shadows.card,
      },
      counter: {
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.md,
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors.interactive.soft, colors.surface.main],
  );

  const stage = stages[selected];
  const entering = reduceMotion
    ? undefined
    : direction === null
      ? FadeIn
      : // The next card arrives from the reading-forward side.
        (direction === 'next') !== isRTL
        ? FadeInRight.springify()
        : FadeInLeft.springify();
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={styles.card}>
      <Box row align="flex-start" justify="space-between" gap="sm">
        <Box flex={1} gap="xs">
          <Text variant="h4" color={colors.text.primary}>
            {copyInput.mode === 'live' ? t('marketplace.journey.titleLive') : t('marketplace.journey.titlePlan')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.journey.hint')}
          </Text>
        </Box>
        <Box style={styles.counter}>
          <Text variant="title" color={colors.interactive.text} writingDirection="ltr">
            {`${now + 1}/${count}`}
          </Text>
          <Text variant="overline" color={colors.interactive.text}>
            {t('marketplace.journey.counter')}
          </Text>
        </Box>
      </Box>
      <DealJourneyRail
        stages={stages}
        names={names}
        selected={selected}
        onSelect={select}
        intro={intro}
        clock={clock}
        moving={moving}
      />
      {stage ? (
        <GestureDetector gesture={swipe}>
          <Animated.View key={stage.key} entering={entering}>
            <DealJourneyCard
              copy={copy[stage.key]}
              status={stage.status}
              actor={stage.actor}
              creatorName={copyInput.creatorName}
              replyDueAt={stage.key === 'reply' ? replyDueAt : null}
              replyWindowHours={copyInput.windows.influencerResponseHours}
            />
          </Animated.View>
        </GestureDetector>
      ) : null}
      <Box row align="center" justify="space-between" mt="sm">
        <IconButton
          icon={PrevIcon}
          variant="ghost"
          onPress={goPrev}
          disabled={selected === 0}
          accessibilityLabel={t('marketplace.journey.prev')}
        />
        <Box row align="center" gap="xs">
          {stages.map((entry, index) => (
            <Box
              key={entry.key}
              width={index === selected ? DOT_ON : DOT}
              height={DOT}
              borderRadius="full"
              bg={index === selected ? colors.interactive.main : colors.border.default}
            />
          ))}
        </Box>
        <IconButton
          icon={NextIcon}
          variant="ghost"
          onPress={goNext}
          disabled={selected === count - 1}
          accessibilityLabel={t('marketplace.journey.next')}
        />
      </Box>
    </Animated.View>
  );
};

export const DealJourney = memo(DealJourneyComponent);
