import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, Store, Tag, UserRound } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { TWO_WAYS_CAPTION } from '../../../constants/brandHomeTwoWays';

const STAGE_HEIGHT = moderateScale(156);
const NODE = moderateScale(44);
const FACE = moderateScale(40);
const FACE_BIG = moderateScale(48);
const BADGE = moderateScale(18);
const BADGE_ICON = moderateScale(10);
const DASHES = 7;
const DASH_WIDTH = moderateScale(8);
const DASH_HEIGHT = moderateScale(3);
const STEM_HEIGHT = moderateScale(10);
const SHIFT = moderateScale(10);
const IDLE_SCALE = 0.88;
/** Which of the five applicants the brand picked in the picture: three of them. */
const APPLICANTS = [true, false, true, false, true] as const;

interface TwoWaysSceneProps {
  /** 0 = direct deal, 1 = public campaign. */
  progress: SharedValue<number>;
}

interface FaceProps {
  size: number;
  picked?: boolean;
  dim?: boolean;
}

const FaceComponent: React.FC<FaceProps> = ({ size, picked = false, dim = false }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'face' | 'ring' | 'badge' | 'dim', ViewStyle> => ({
      face: {
        width: size,
        height: size,
        borderRadius: size,
        borderWidth: borderWidths.lg,
        borderColor: colors.surface.main,
        alignItems: 'center',
        justifyContent: 'center',
      },
      ring: { borderColor: colors.interactive.main },
      badge: {
        position: 'absolute',
        top: -BADGE / 3,
        end: -BADGE / 3,
        width: BADGE,
        height: BADGE,
        borderRadius: BADGE,
        borderWidth: borderWidths.md,
        borderColor: colors.surface.main,
        backgroundColor: colors.interactive.main,
        alignItems: 'center',
        justifyContent: 'center',
      },
      dim: { opacity: 0.42, transform: [{ scale: IDLE_SCALE }] },
    }),
    [colors.interactive.main, colors.surface.main, size],
  );
  return (
    <Box
      bg={picked ? colors.interactive.soft : colors.layout.base}
      style={[styles.face, picked ? styles.ring : undefined, dim ? styles.dim : undefined]}
    >
      <UserRound size={sizes.icon.sm} color={picked ? colors.interactive.text : colors.icon.secondary} />
      {picked ? (
        <Box style={styles.badge}>
          <Check size={BADGE_ICON} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
        </Box>
      ) : null}
    </Box>
  );
};

const Face = memo(FaceComponent);

const BrandNodeComponent: React.FC = () => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      width={NODE}
      height={NODE}
      borderRadius="md"
      align="center"
      justify="center"
      bg={colors.button.primary.bg}
    >
      <Store size={sizes.icon.sm} color={colors.button.primary.text} />
    </Box>
  );
};

const BrandNode = memo(BrandNodeComponent);

/**
 * The picture under the switch. Direct: one line from the brand to one creator, with a fixed
 * price on it. Campaign: the brand posts one request, five creators apply, three are picked.
 * Both scenes sit stacked and crossfade on `progress`, the same value that slides the pick.
 */
const TwoWaysSceneComponent: React.FC<TwoWaysSceneProps> = ({ progress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'stage' | 'scene' | 'row' | 'line' | 'dash' | 'pill' | 'stem' | 'fan', ViewStyle> => ({
      stage: { height: STAGE_HEIGHT, borderRadius: radii.lg, overflow: 'hidden' },
      scene: {
        ...StyleSheet.absoluteFill,
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      row: { flex: 1, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: spacing.md },
      line: { flex: 1, alignItems: 'center', gap: spacing.xs },
      dash: {
        width: DASH_WIDTH,
        height: DASH_HEIGHT,
        borderRadius: DASH_HEIGHT,
        backgroundColor: colors.interactive.main,
      },
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.money.soft,
      },
      stem: { width: DASH_HEIGHT, height: STEM_HEIGHT, borderRadius: DASH_HEIGHT, backgroundColor: colors.interactive.main },
      fan: { flexDirection: 'row', gap: spacing.sm },
    }),
    [colors.interactive.main, colors.money.soft],
  );

  const directStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -SHIFT * progress.value }],
  }));
  const campaignStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: SHIFT * (1 - progress.value) }],
  }));

  return (
    <Box style={styles.stage} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <LinearGradient
        colors={[colors.interactive.soft, colors.surface.elevated]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Animated.View style={[styles.scene, directStyle]} pointerEvents="none">
        <Box style={styles.row}>
          <BrandNode />
          <Box style={styles.line}>
            <Box style={styles.pill}>
              <Tag size={sizes.icon.xs} color={colors.money.text} />
              <Text variant="buttonSmall" color={colors.money.text}>
                {t('marketplace.brandHome.twoWays.scene.fixedPrice')}
              </Text>
            </Box>
            <Box row gap="xs">
              {Array.from({ length: DASHES }, (_, at) => (
                <Box key={at} style={styles.dash} />
              ))}
            </Box>
          </Box>
          <Face size={FACE_BIG} picked />
        </Box>
        <Text variant="caption" color={colors.text.secondary} align="center">
          {t(TWO_WAYS_CAPTION.direct)}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.scene, campaignStyle]} pointerEvents="none">
        <Box align="center" gap="xs">
          <BrandNode />
          <Box style={styles.stem} />
          <Box style={styles.fan}>
            {APPLICANTS.map((picked, at) => (
              <Face key={at} size={FACE} picked={picked} dim={!picked} />
            ))}
          </Box>
        </Box>
        <Text variant="caption" color={colors.text.secondary} align="center">
          {t(TWO_WAYS_CAPTION.campaign)}
        </Text>
      </Animated.View>
    </Box>
  );
};

export const TwoWaysScene = memo(TwoWaysSceneComponent);
