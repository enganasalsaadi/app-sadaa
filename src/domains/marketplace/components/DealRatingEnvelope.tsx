import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Rect, Stop } from 'react-native-svg';
import { Lock, MoreHorizontal } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/** Where the flap's two folds meet, as a share of the envelope's height. */
const FOLD_DEPTH = 55;
const WAIT_RING = moderateScale(48);

/**
 * `sealed`: an answer inside (navy, flap folds); the seal comes from the caller. `waiting`: nothing
 * yet (dashed outline, a dashed empty ring).
 */
export type DealRatingEnvelopeState = 'sealed' | 'waiting';

export interface DealRatingEnvelopeProps {
  state: DealRatingEnvelopeState;
  title: string;
  caption: string;
  height: number;
  /** Pressed on a sealed envelope (the wax seal); a lock when absent. */
  seal?: React.ReactNode;
}

/** One side's rating as an envelope: sealed navy with the seal on its flap, or an empty dashed one. */
const DealRatingEnvelopeComponent: React.FC<DealRatingEnvelopeProps> = ({
  state,
  title,
  caption,
  height,
  seal,
}) => {
  const { colors, sizes } = useTheme();
  const sealed = state === 'sealed';
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'shell' | 'mark' | 'ring', ViewStyle> => ({
      shell: {
        flex: 1,
        height,
        borderRadius: radii.lg,
        overflow: 'hidden',
        padding: spacing.md,
        justifyContent: 'flex-end',
        ...(sealed
          ? {}
          : {
              borderWidth: borderWidths.md,
              borderStyle: 'dashed',
              borderColor: colors.border.strong,
              backgroundColor: colors.layout.base,
            }),
      },
      mark: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        paddingTop: height * 0.12,
      },
      ring: {
        width: WAIT_RING,
        height: WAIT_RING,
        borderRadius: radii.full,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.border.strong, colors.layout.base, height, sealed],
  );
  const [from, to] = colors.rating.envelope;
  return (
    <Box style={styles.shell} accessible>
      {sealed ? (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="ratingEnvelope" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" fill="url(#ratingEnvelope)" />
          <Line
            x1="0"
            y1="0"
            x2="50"
            y2={FOLD_DEPTH}
            stroke={colors.rating.fold}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <Line
            x1="100"
            y1="0"
            x2="50"
            y2={FOLD_DEPTH}
            stroke={colors.rating.fold}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </Svg>
      ) : null}
      <Box style={styles.mark} pointerEvents="none">
        {sealed ? (
          (seal ?? <Lock size={sizes.icon.md} color={colors.text.onBrand} />)
        ) : (
          <Box style={styles.ring}>
            <MoreHorizontal size={sizes.icon.sm} color={colors.icon.secondary} />
          </Box>
        )}
      </Box>
      <Text
        variant="buttonSmall"
        color={sealed ? colors.text.onBrand : colors.text.primary}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        variant="caption"
        color={sealed ? colors.text.onBrandMuted : colors.text.secondary}
        numberOfLines={1}
      >
        {caption}
      </Text>
    </Box>
  );
};

export const DealRatingEnvelope = memo(DealRatingEnvelopeComponent);
