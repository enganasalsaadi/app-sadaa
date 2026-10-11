import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { NavigationContext } from '@react-navigation/native';
import { useTheme } from '@/core/theme';
import { GlowOrbs } from '../GlowOrbs';
import { GradientSurface } from '../GradientSurface';

interface LayoutHeroBackdropProps {
  scrollY: SharedValue<number>;
  /** Measured hero height (React state, not a shared value: see below). */
  height: number;
  /** Same lag as the hero content, so the gradient and its content move together. */
  parallax: number;
  /** Live hero: darker gradient + drifting lights on their own layer (they follow the hero but never stretch with the pull). */
  glow: boolean;
  /**
   * Live gradient without the lights: the hero paints its own (`brandOpen`). It stops a little
   * above the hero's bottom, tucked under the edge the hero draws into the body, so a rounding
   * gap between the two never shows a navy line under the hero.
   */
  live: boolean;
  /** Bottom corners round off over the screen background (`brandRounded`). */
  rounded: boolean;
}

/**
 * Tab roots stay mounted, so without this every visited Home / Wallet / Profile would keep
 * redrawing its lights: they rest while the screen is blurred or the hero is scrolled away.
 */
const useLightsPaused = (scrollY: SharedValue<number>, height: number, glow: boolean) => {
  const navigation = useContext(NavigationContext);
  const [blurred, setBlurred] = useState(() => navigation?.isFocused() === false);
  const [scrolledAway, setScrolledAway] = useState(false);

  useEffect(() => {
    if (!navigation || !glow) return undefined;
    const offFocus = navigation.addListener('focus', () => setBlurred(false));
    const offBlur = navigation.addListener('blur', () => setBlurred(true));
    return () => {
      offFocus();
      offBlur();
    };
  }, [glow, navigation]);

  useAnimatedReaction(
    () => glow && height > 0 && scrollY.value > height,
    (away, previous) => {
      if (away !== previous) scheduleOnRN(setScrolledAway, away);
    },
    [glow, height],
  );

  return blurred || scrolledAway;
};

/**
 * Navy gradient behind a transparent hero. It sits behind the scroll view so the iOS
 * refresh spinner stays visible over it. Pulling down stretches it from the top edge
 * (the gradient itself, so there is no seam); scrolling moves it with the hero.
 * The height goes through a React render, and only transforms run on the UI thread:
 * a height animated from 0 by Reanimated left the native gradient unpainted on iOS.
 */
const LayoutHeroBackdropComponent: React.FC<LayoutHeroBackdropProps> = ({
  scrollY,
  height,
  parallax,
  glow,
  live,
  rounded,
}) => {
  const { spacing, radii } = useTheme();
  const paintHeight = live ? Math.max(height - spacing.sm, 0) : height;
  const style = useAnimatedStyle(() => {
    const y = scrollY.value;
    if (y < 0 && paintHeight > 0) {
      return { transform: [{ translateY: 0 }, { scaleY: (paintHeight - y) / paintHeight }] };
    }
    return { transform: [{ translateY: -y * (1 - parallax) }, { scaleY: 1 }] };
  }, [paintHeight, parallax]);
  const glowStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: -Math.max(scrollY.value, 0) * (1 - parallax) }] }),
    [parallax],
  );
  const sizeStyle = useMemo(
    () => ({
      height: paintHeight,
      ...(rounded
        ? { borderBottomStartRadius: radii['2xl'], borderBottomEndRadius: radii['2xl'], overflow: 'hidden' as const }
        : null),
    }),
    [paintHeight, radii, rounded],
  );
  const lightsPaused = useLightsPaused(scrollY, height, glow);

  if (paintHeight <= 0) return null;

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.backdrop, sizeStyle, style]}>
        <GradientSurface variant={glow || live ? 'live' : 'brand'} flex={1} />
      </Animated.View>
      {glow ? (
        <Animated.View pointerEvents="none" style={[styles.backdrop, sizeStyle, glowStyle]}>
          <GlowOrbs paused={lightsPaused} />
        </Animated.View>
      ) : null}
    </>
  );
};

export const LayoutHeroBackdrop = memo(LayoutHeroBackdropComponent);

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, start: 0, end: 0, transformOrigin: 'top' },
});
