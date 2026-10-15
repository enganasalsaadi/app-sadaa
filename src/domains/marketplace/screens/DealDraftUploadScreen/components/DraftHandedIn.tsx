import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DealRoundBars } from '../../../components/DealRoundBars';
import type { DealRounds } from '../../../utils/dealDrafts';

const SEAL = moderateScale(88);
const RING_GAP = moderateScale(8);

export interface DraftHandedInProps {
  title: string;
  body: string | null;
  rounds: DealRounds;
}

/**
 * A round that left the creator's hands: a teal seal whose dashed rim turns once and settles, what
 * happens now, and the round bars. The files and caption follow below, read only.
 */
const DraftHandedInComponent: React.FC<DraftHandedInProps> = ({ title, body, rounds }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const turn = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    turn.value = withTiming(1, { duration: motion.duration.seal, easing: Easing.out(Easing.cubic) });
  }, [reduceMotion, turn]);
  const rimStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));

  const styles = useStyles(
    ({ radii, borderWidths }): Record<'seal' | 'rim', ViewStyle> => ({
      seal: {
        width: SEAL,
        height: SEAL,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      rim: {
        position: 'absolute',
        top: -RING_GAP,
        bottom: -RING_GAP,
        start: -RING_GAP,
        end: -RING_GAP,
        borderRadius: radii.full,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.interactive.main,
      },
    }),
    [colors.interactive.main, colors.interactive.soft],
  );

  return (
    <Box align="center" gap="sm" py="lg" accessible accessibilityRole="summary">
      <Box style={styles.seal} mb="sm">
        <Animated.View style={[styles.rim, rimStyle]} />
        <Check size={sizes.icon.xl} color={colors.interactive.main} />
      </Box>
      <Text variant="h3" color={colors.text.primary} align="center">
        {title}
      </Text>
      {body ? (
        <Text variant="bodySmall" color={colors.text.secondary} align="center">
          {body}
        </Text>
      ) : null}
      <DealRoundBars rounds={rounds} />
    </Box>
  );
};

export const DraftHandedIn = memo(DraftHandedInComponent);
