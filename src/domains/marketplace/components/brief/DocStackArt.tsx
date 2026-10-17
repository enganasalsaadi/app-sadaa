import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const ART_WIDTH = moderateScale(120);
const ART_HEIGHT = moderateScale(92);
const PAPER_WIDTH = moderateScale(64);
const PAPER_HEIGHT = moderateScale(82);
const LINE_HEIGHT = moderateScale(4);
/** Text lines on the front paper, as width fractions. */
const LINES = ['100%', '70%', '100%', '55%'] as const;
/** RTL terms (start = right); the back paper slides out from under the front one on press. */
const BACK = { start: 34, top: 6, rotate: -8, spreadRotate: -6, spreadX: -8 } as const;
const FRONT = { start: 8, top: 2, lift: -3 } as const;
const TAG = { bottom: 14, rotate: -6 } as const;
// Scaled up front: moderateScale isn't a worklet, so it can't run inside the animated styles.
const BACK_SHIFT_X = moderateScale(BACK.spreadX);
const FRONT_LIFT = moderateScale(FRONT.lift);
const { rotate: BACK_ROTATE, spreadRotate: BACK_SPREAD_ROTATE } = BACK;

interface DocStackArtProps {
  spread: SharedValue<number>;
}

/** Two papers and a PDF tag on the files tile; the stack splays while the tile is held. */
const DocStackArtComponent: React.FC<DocStackArtProps> = ({ spread }) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  // Mirrors the stack in LTR: tilt and push flip with the reading direction.
  const dir = isRTL ? 1 : -1;
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'art' | 'back' | 'front' | 'line' | 'tag', ViewStyle> => {
      const paper: ViewStyle = {
        position: 'absolute',
        width: PAPER_WIDTH,
        height: PAPER_HEIGHT,
        borderRadius: radii.sm,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
        backgroundColor: colors.surface.main,
        ...shadows.md,
      };
      return {
        art: { width: ART_WIDTH, height: ART_HEIGHT },
        back: { ...paper, start: moderateScale(BACK.start), top: moderateScale(BACK.top) },
        front: {
          ...paper,
          start: moderateScale(FRONT.start),
          top: moderateScale(FRONT.top),
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          gap: spacing.sm,
        },
        line: { height: LINE_HEIGHT, borderRadius: radii.xs, backgroundColor: colors.border.default },
        tag: {
          position: 'absolute',
          start: 0,
          bottom: moderateScale(TAG.bottom),
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.sm,
          backgroundColor: colors.status.danger.main,
          transform: [{ rotate: `${TAG.rotate * dir}deg` }],
        },
      };
    },
    [colors.border.default, colors.surface.main, colors.status.danger.main, dir],
  );
  const backMotion = useAnimatedStyle(() => ({
    transform: [
      { translateX: BACK_SHIFT_X * spread.value * dir },
      { rotate: `${(BACK_ROTATE + BACK_SPREAD_ROTATE * spread.value) * dir}deg` },
    ],
  }));
  const frontMotion = useAnimatedStyle(() => ({
    transform: [{ translateY: FRONT_LIFT * spread.value }],
  }));

  return (
    <Box style={styles.art}>
      <Animated.View style={[styles.back, backMotion]} />
      <Animated.View style={[styles.front, frontMotion]}>
        {LINES.map((width, index) => (
          <Box key={index} width={width} style={styles.line} />
        ))}
      </Animated.View>
      <Box style={styles.tag}>
        <Text variant="overline" color={colors.text.onAccent}>
          {t('marketplace.offer.brief.files.pdfTag')}
        </Text>
      </Box>
    </Box>
  );
};

export const DocStackArt = memo(DocStackArtComponent);
