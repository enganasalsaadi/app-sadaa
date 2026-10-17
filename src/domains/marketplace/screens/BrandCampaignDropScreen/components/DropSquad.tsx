import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { motion, moderateScale, opacity, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, useScreenFocused } from '@/shared/ui';
import { CAMPAIGN_DROP_STATE_TONE, UNKNOWN_CAMPAIGN_DROP_STATE_TONE } from '../../../constants/campaignDrop';
import type { CampaignDropCreator, CampaignDropState } from '../../../types/campaignDrop';

const PIECE_HEIGHT = moderateScale(12);

const Piece = memo<{ state: CampaignDropState | null }>(({ state }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const focused = useScreenFocused();
  const breath = useSharedValue(1);
  const late = state === 'late';
  const hue = resolveHue(colors, state === null ? UNKNOWN_CAMPAIGN_DROP_STATE_TONE : CAMPAIGN_DROP_STATE_TONE[state]);
  // Not paid yet: an empty slot (outline only); ended: the same slot, faded.
  const hollow = state === 'awaiting_payment';
  const faded = state === 'ended';
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'piece', ViewStyle> => ({
      piece: {
        flex: 1,
        height: PIECE_HEIGHT,
        borderRadius: radii.sm,
        backgroundColor: hollow ? 'transparent' : hue.main,
        borderWidth: hollow ? borderWidths.thin : 0,
        borderColor: hue.main,
        opacity: faded ? opacity.disabled : 1,
      },
    }),
    [faded, hollow, hue.main],
  );

  useEffect(() => {
    if (!late || reduceMotion || !focused) return;
    const half = motion.loop.lateBlink / 2;
    breath.value = withRepeat(
      withSequence(withTiming(opacity.disabled, { duration: half }), withTiming(1, { duration: half })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(breath);
      breath.value = 1;
    };
  }, [breath, focused, late, reduceMotion]);

  const blink = useAnimatedStyle(() => ({ opacity: breath.value }));
  return <Animated.View style={[styles.piece, blink]} />;
});

export interface DropSquadProps {
  /** One piece each, in progress order. */
  creators: readonly CampaignDropCreator[];
}

/** The whole squad as one bar: a piece per creator in the color of where they stand; a late one breathes. */
const DropSquadComponent: React.FC<DropSquadProps> = ({ creators }) => (
  // Decorative: the chips count the same states and every row says its own.
  <Box row gap="xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {creators.map(creator => (
      <Piece key={creator.dealId} state={creator.state.key} />
    ))}
  </Box>
);

export const DropSquad = memo(DropSquadComponent);
