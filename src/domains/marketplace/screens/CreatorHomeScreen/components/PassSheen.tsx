import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useStyles, useTheme } from '@/core/theme';

/** The sweep takes the first share of each loop; the rest of the loop the card rests. */
const SWEEP_SHARE = 0.45;
/** The band is this share of the card's width, tilted so it reads as light, not a stripe. */
const BAND_SHARE = 0.55;
const BAND_ANGLE = '18deg';

interface PassSheenProps {
  /** 0 → 1 loop phase (`useLoopClock`); `null` under reduced motion: no light at all. */
  clock: SharedValue<number> | null;
  width: number;
}

/** A band of teal-to-mustard light crossing the pass now and then, like a laminated card under a lamp. */
const PassSheenComponent: React.FC<PassSheenProps> = ({ clock, width }) => {
  const { colors } = useTheme();
  const bandWidth = width * BAND_SHARE;
  const styles = useStyles(
    (): Record<'band', ViewStyle> => ({
      band: {
        position: 'absolute',
        top: '-50%',
        bottom: '-50%',
        start: 0,
        width: bandWidth,
        transform: [{ rotate: BAND_ANGLE }],
      },
    }),
    [bandWidth],
  );

  const sweep = useAnimatedStyle(() => {
    const phase = clock ? clock.value : 1;
    const travel = interpolate(phase, [0, SWEEP_SHARE], [-bandWidth, width + bandWidth], 'clamp');
    return { transform: [{ translateX: travel }] };
  }, [bandWidth, clock, width]);

  if (!clock || width <= 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sweep]}>
      <LinearGradient
        colors={colors.storefront.sheen}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.band}
      />
    </Animated.View>
  );
};

export const PassSheen = memo(PassSheenComponent);
