import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
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
}

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
}) => {
  const style = useAnimatedStyle(() => {
    const y = scrollY.value;
    if (y < 0 && height > 0) {
      return { transform: [{ translateY: 0 }, { scaleY: (height - y) / height }] };
    }
    return { transform: [{ translateY: -y * (1 - parallax) }, { scaleY: 1 }] };
  }, [height, parallax]);
  const glowStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: -Math.max(scrollY.value, 0) * (1 - parallax) }] }),
    [parallax],
  );
  const sizeStyle = useMemo(() => ({ height }), [height]);

  if (height <= 0) return null;

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.backdrop, sizeStyle, style]}>
        <GradientSurface variant={glow ? 'live' : 'brand'} flex={1} />
      </Animated.View>
      {glow ? (
        <Animated.View pointerEvents="none" style={[styles.backdrop, sizeStyle, glowStyle]}>
          <GlowOrbs />
        </Animated.View>
      ) : null}
    </>
  );
};

export const LayoutHeroBackdrop = memo(LayoutHeroBackdropComponent);

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, start: 0, end: 0, transformOrigin: 'top' },
});
