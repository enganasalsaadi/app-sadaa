import React, { memo, useEffect, useMemo } from 'react';
import { Group, Paragraph, Path, RoundedRect, vec } from '@shopify/react-native-skia';
import type { SkParagraph, Transforms3d } from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from '@/shared/ui';
import type { GlassCardStyle } from '@/shared/ui';
import { moderateScale } from '@/core/theme';
import { ICON_VIEWBOX, ONBOARDING_ICONS } from '../icons';
import type { OnboardingIconName } from '../icons';
import type { SlideIconTone } from '../types';
import type { CardFrame, FloatingCardPlacement } from '../utils/cardLayout';

interface MotionSpec {
  /** Resting tilt in degrees. */
  baseTilt: number;
  /** Half of one up→down sweep, ms. */
  duration: number;
  /** Total vertical travel, px (oscillates ±travel/2). */
  travel: number;
  /** +1 / −1: starting direction, inverted between cards so they drift apart. */
  direction: 1 | -1;
  enterDelay: number;
}

const TILT_SWING = 1;
const DEG_TO_RAD = Math.PI / 180;
const ICON_STROKE = 2;
const ENTER_OFFSET = moderateScale(24);
const ENTER_SPRING = { damping: 14, stiffness: 120, mass: 1 };

const MOTION: Record<FloatingCardPlacement, MotionSpec> = {
  top: { baseTilt: -3, duration: 3200, travel: moderateScale(14), direction: 1, enterDelay: 120 },
  bottom: { baseTilt: 2, duration: 3800, travel: moderateScale(16), direction: -1, enterDelay: 240 },
};

/**
 * Theme-derived values, resolved outside the canvas: Skia's reconciler is a
 * separate React root, so `useTheme()` can't be called in here.
 */
export interface CardAppearance {
  glass: GlassCardStyle;
  isRTL: boolean;
  padding: number;
  badgeSize: number;
  badgeRadius: number;
  badgeFill: string;
  badgeGap: number;
  titleGap: number;
  iconSize: number;
  toneColor: Record<SlideIconTone, string>;
}

interface FloatingCardProps {
  placement: FloatingCardPlacement;
  frame: CardFrame;
  appearance: CardAppearance;
  icon: OnboardingIconName;
  tone: SlideIconTone;
  title: SkParagraph;
  description: SkParagraph;
}

/**
 * One glass card drawn by Skia. The float loop runs as a Reanimated worklet and
 * feeds the Skia transform directly on the UI thread: no React renders, no view
 * re-layout, no Android elevation redraw per frame.
 */
const FloatingCardComponent: React.FC<FloatingCardProps> = ({
  placement,
  frame,
  appearance,
  icon,
  tone,
  title,
  description,
}) => {
  const reduceMotion = useReducedMotion();
  const spec = MOTION[placement];
  const phase = useSharedValue<number>(reduceMotion ? 0 : -spec.direction);
  const enter = useSharedValue<number>(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      phase.value = 0;
      enter.value = 1;
      return;
    }
    const easing = Easing.inOut(Easing.sin);
    enter.value = withDelay(spec.enterDelay, withSpring(1, ENTER_SPRING));
    phase.value = withRepeat(
      withSequence(
        withTiming(spec.direction, { duration: spec.duration, easing }),
        withTiming(-spec.direction, { duration: spec.duration, easing }),
      ),
      -1,
    );
    return () => {
      cancelAnimation(phase);
      cancelAnimation(enter);
    };
  }, [enter, phase, reduceMotion, spec.direction, spec.duration, spec.enterDelay]);

  const transform = useDerivedValue<Transforms3d>(() => [
    { translateY: (phase.value * spec.travel) / 2 + (1 - enter.value) * ENTER_OFFSET },
    { rotate: (spec.baseTilt + phase.value * TILT_SWING) * DEG_TO_RAD },
  ]);
  // Spring overshoots past 1; opacity must not.
  const opacity = useDerivedValue(() => Math.min(Math.max(enter.value, 0), 1));

  const origin = useMemo(
    () => vec(frame.x + frame.width / 2, frame.y + frame.height / 2),
    [frame],
  );

  const { glass, isRTL, padding, badgeSize, badgeRadius, badgeGap, titleGap, iconSize } = appearance;
  const stroke = glass.stroke;
  const textX = frame.x + padding;
  const textWidth = frame.width - padding * 2;
  const badgeX = isRTL ? frame.x + frame.width - padding - badgeSize : frame.x + padding;
  const badgeY = frame.y + padding;
  const iconOffset = (badgeSize - iconSize) / 2;
  const titleY = badgeY + badgeSize + badgeGap;
  const descriptionY = titleY + title.getHeight() + titleGap;

  const iconTransform = useMemo<Transforms3d>(
    () => [
      { translateX: badgeX + iconOffset },
      { translateY: badgeY + iconOffset },
      { scale: iconSize / ICON_VIEWBOX },
    ],
    [badgeX, badgeY, iconOffset, iconSize],
  );

  return (
    <Group transform={transform} origin={origin} opacity={opacity}>
      <GlassCard x={frame.x} y={frame.y} width={frame.width} height={frame.height} glass={glass}>
        <RoundedRect
          x={badgeX}
          y={badgeY}
          width={badgeSize}
          height={badgeSize}
          r={badgeRadius}
          color={appearance.badgeFill}
        />
        <RoundedRect
          x={badgeX + stroke / 2}
          y={badgeY + stroke / 2}
          width={badgeSize - stroke}
          height={badgeSize - stroke}
          r={badgeRadius - stroke / 2}
          style="stroke"
          strokeWidth={stroke}
          color={glass.border}
        />
        <Group transform={iconTransform}>
          {ONBOARDING_ICONS[icon].map(d => (
            <Path
              key={d}
              path={d}
              style="stroke"
              strokeWidth={ICON_STROKE}
              strokeCap="round"
              strokeJoin="round"
              color={appearance.toneColor[tone]}
            />
          ))}
        </Group>
        <Paragraph paragraph={title} x={textX} y={titleY} width={textWidth} />
        <Paragraph paragraph={description} x={textX} y={descriptionY} width={textWidth} />
      </GlassCard>
    </Group>
  );
};

export const FloatingCard = memo(FloatingCardComponent);
