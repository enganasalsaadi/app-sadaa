import React, { memo, useEffect, useMemo, useRef } from 'react';
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
import { isRtlNumber, splitNumberRuns } from './numberRuns';

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
  rowRtl: ViewStyle;
  cluster: ViewStyle;
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
 * The number itself is always left to right, so "48.2K" never flips; words around it
 * ("ألف", "ل.س.") render whole so Arabic letters stay joined, and sit on the RTL side.
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
      rowRtl: { flexDirection: 'row', direction: 'rtl', alignItems: 'flex-start' },
      cluster: { flexDirection: 'row', direction: 'ltr', alignItems: 'flex-start' },
      column: { height: lineHeight },
      glyph: { height: lineHeight, fontVariant: ['tabular-nums'] },
    }),
    [lineHeight],
  );
  const runs = useMemo(() => splitNumberRuns(value), [value]);

  // Digit keys and stagger count across runs, so a digit keeps its column when the value changes.
  let position = 0;
  return (
    <Box
      style={isRtlNumber(value) ? styles.rowRtl : styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? value}
    >
      {runs.map((run, runIndex) => {
        if (run.kind === 'text') {
          position += run.text.length;
          return (
            <Text key={`t${runIndex}`} variant={variant} color={color} style={styles.glyph}>
              {run.text}
            </Text>
          );
        }
        return (
          <Box key={`n${runIndex}`} style={styles.cluster}>
            {Array.from(run.text).map(char => {
              const index = position++;
              const digit = DIGITS.indexOf(char);
              return digit >= 0 ? (
                <Digit
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
      })}
    </Box>
  );
};

export const AnimatedNumber = memo(AnimatedNumberComponent);
