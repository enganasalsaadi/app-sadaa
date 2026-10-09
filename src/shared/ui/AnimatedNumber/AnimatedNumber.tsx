import React, { memo, useEffect, useRef } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import type { TypographyVariant } from '@/core/theme/types';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export interface AnimatedNumberProps {
  /** The number already formatted (`formatNumber` / `formatMoney`): digits roll, other characters stay. */
  value: string;
  variant?: TypographyVariant;
  color?: string;
  /** Defaults to `value`. */
  accessibilityLabel?: string;
}

const DIGITS: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
/** Each digit starts a beat after the one before it, left to right. */
const DIGIT_STAGGER_MS = 40;
const ROLL_EASING = Easing.bezier(0.22, 1, 0.36, 1);

interface DigitStyles {
  row: ViewStyle;
  column: ViewStyle;
  glyph: TextStyle;
}

interface DigitProps {
  digit: number;
  index: number;
  rollOnMount: boolean;
  lineHeight: number;
  variant: TypographyVariant;
  color?: string;
  styles: DigitStyles;
}

const Digit = memo<DigitProps>(({ digit, index, rollOnMount, lineHeight, variant, color, styles }) => {
  const y = useSharedValue(rollOnMount ? 0 : -digit * lineHeight);
  // Rolls only for the first value it shows; later changes snap (rule 09 §3.1: once).
  const pendingRoll = useRef(rollOnMount);

  useEffect(() => {
    const target = -digit * lineHeight;
    if (!pendingRoll.current) {
      y.value = target;
      return;
    }
    pendingRoll.current = false;
    y.value = withDelay(
      index * DIGIT_STAGGER_MS,
      withTiming(target, { duration: motion.duration.roll, easing: ROLL_EASING }),
    );
  }, [digit, index, lineHeight, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Box style={styles.column} overflow="hidden">
      <Animated.View style={style}>
        {DIGITS.map(glyph => (
          <Text key={glyph} variant={variant} color={color} style={styles.glyph}>
            {glyph}
          </Text>
        ))}
      </Animated.View>
    </Box>
  );
});

/**
 * A formatted number whose digits roll up to their value the first time it shows
 * (KPI strips, balances, stat tiles). Reduced motion shows the value at once.
 * Always laid out left to right, so "48.2K" never flips in Arabic.
 */
const AnimatedNumberComponent: React.FC<AnimatedNumberProps> = ({
  value,
  variant = 'h4',
  color,
  accessibilityLabel,
}) => {
  const { typography } = useTheme();
  const reduceMotion = useReducedMotion();
  const { lineHeight } = typography[variant];
  const rollOnMount = useRef(!reduceMotion).current;

  const styles = useStyles(
    (): DigitStyles => ({
      row: { flexDirection: 'row', direction: 'ltr', alignItems: 'flex-start' },
      column: { height: lineHeight },
      glyph: { height: lineHeight, fontVariant: ['tabular-nums'] },
    }),
    [lineHeight],
  );

  return (
    <Box
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? value}
    >
      {Array.from(value).map((char, index) => {
        const digit = DIGITS.indexOf(char);
        return digit >= 0 ? (
          <Digit
            // Position is the identity: a digit keeps its column when the value changes.
            key={index}
            digit={digit}
            index={index}
            rollOnMount={rollOnMount}
            lineHeight={lineHeight}
            variant={variant}
            color={color}
            styles={styles}
          />
        ) : (
          <Text key={index} variant={variant} color={color} style={styles.glyph}>
            {char}
          </Text>
        );
      })}
    </Box>
  );
};

export const AnimatedNumber = memo(AnimatedNumberComponent);
