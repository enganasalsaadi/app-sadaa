import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Mountain } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';

const ART_WIDTH = moderateScale(120);
const ART_HEIGHT = moderateScale(90);
const CARD_WIDTH = moderateScale(62);
const CARD_HEIGHT = moderateScale(76);
const CARD_BORDER = moderateScale(3);
const MOUNTAIN = moderateScale(22);

/** Each photo in RTL terms (start = right): offset, rest tilt, and how far it fans out on press. */
const CARDS = [
  { start: 0, top: 8, rotate: 10, spreadRotate: 6, spreadX: 6 },
  { start: 30, top: 2, rotate: -4, spreadRotate: 0, spreadX: 0 },
  { start: 58, top: 10, rotate: -14, spreadRotate: -6, spreadX: -6 },
] as const;

interface FanCardProps {
  index: 0 | 1 | 2;
  fill: string;
  spread: SharedValue<number>;
}

const FanCard: React.FC<FanCardProps> = ({ index, fill, spread }) => {
  const { colors, isRTL } = useTheme();
  const card = CARDS[index];
  // Mirrors the fan in LTR: tilt and push flip with the reading direction.
  const dir = isRTL ? 1 : -1;
  const styles = useStyles(
    ({ radii }): Record<'card', ViewStyle> => ({
      card: {
        position: 'absolute',
        start: moderateScale(card.start),
        top: moderateScale(card.top),
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: radii.sm,
        borderWidth: CARD_BORDER,
        borderColor: colors.text.onBrand,
        backgroundColor: fill,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      },
    }),
    [card, colors.text.onBrand, fill],
  );
  // Scaled on JS: moderateScale isn't a worklet, so it can't run inside the animated style.
  const shiftX = moderateScale(card.spreadX) * dir;
  const { rotate, spreadRotate } = card;
  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: shiftX * spread.value },
      { rotate: `${(rotate + spreadRotate * spread.value) * dir}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.card, animated]}>
      <Mountain size={MOUNTAIN} color={colors.text.onBrand} />
    </Animated.View>
  );
};

interface PhotoFanArtProps {
  spread: SharedValue<number>;
}

/** Three tilted photos on the navy tile; they fan out while the tile is held. */
const PhotoFanArtComponent: React.FC<PhotoFanArtProps> = ({ spread }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    (): Record<'fan', ViewStyle> => ({ fan: { width: ART_WIDTH, height: ART_HEIGHT } }),
    [],
  );

  return (
    <Animated.View style={styles.fan}>
      <FanCard index={0} fill={colors.interactive.main} spread={spread} />
      <FanCard index={1} fill={colors.premium.main} spread={spread} />
      <FanCard index={2} fill={colors.glass.iconInteractive} spread={spread} />
    </Animated.View>
  );
};

export const PhotoFanArt = memo(PhotoFanArtComponent);
