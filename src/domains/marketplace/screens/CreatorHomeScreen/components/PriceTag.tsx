import React, { memo, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Link2, MapPin, Plus } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, MoneyText, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import type { RateRow } from '@/domains/identity';

export const PRICE_TAG_WIDTH = moderateScale(170);
export const PRICE_TAG_HEIGHT = moderateScale(186);
/** The rail's `md` gap between tags; the rail line runs through it. */
const PRICE_TAG_GAP = moderateScale(12);
/** Where the string meets the rail, the hole under it, the shoulders and the body's edges. */
const RAIL_Y = moderateScale(4);
const STRING_END = moderateScale(34);
const HOLE_Y = moderateScale(38);
const HOLE_RADIUS = moderateScale(5);
const NECK = moderateScale(52);
const SHOULDER_Y = moderateScale(22);
const BODY_Y = moderateScale(56);
const INSET = moderateScale(8);
const CORNER = moderateScale(12);
const SHADOW_DROP = moderateScale(5);
const RAIL_HEIGHT = moderateScale(2);
/** The face starts under the hole and keeps clear of the chamfered shoulders. */
const FACE_TOP = moderateScale(58);
const FACE_SIDE = moderateScale(14);
const FACE_BOTTOM = moderateScale(12);
const DASH = [moderateScale(6), moderateScale(5)];
/** Tags hang a little crooked, each its own way, like real ones on a rail (degrees). */
const LEAN = [-2, 1.5, -1, 2, -1.5] as const;
/** The swing as it comes in: past its lean, back the other way, a small give, still. */
const SWING = [9, -5, 2, 0] as const;

const W = PRICE_TAG_WIDTH;
const H = PRICE_TAG_HEIGHT;
const STRING_PATH = `M${W / 2} ${RAIL_Y} V${STRING_END}`;
/** Hang tag: narrow neck at the top, chamfered shoulders down to a rounded body. */
const BODY_PATH = [
  `M${NECK} ${SHOULDER_Y}`,
  `H${W - NECK}`,
  `L${W - INSET} ${BODY_Y}`,
  `V${H - INSET - CORNER}`,
  `Q${W - INSET} ${H - INSET} ${W - INSET - CORNER} ${H - INSET}`,
  `H${INSET + CORNER}`,
  `Q${INSET} ${H - INSET} ${INSET} ${H - INSET - CORNER}`,
  `V${BODY_Y}`,
  'Z',
].join(' ');

interface PriceTagProps {
  /** `null` = the "new rate" tag that closes the rail. */
  row: RateRow | null;
  index: number;
  onPress: () => void;
}

/**
 * A price hanging from the rates rail on its own string: where, what (two lines, never cut) and
 * the price big at the bottom. Each tag leans its own way and swings once as it comes in (still
 * under reduced motion). The rail line runs behind the strings, through the gaps between tags.
 */
const PriceTagComponent: React.FC<PriceTagProps> = ({ row, index, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, borderWidths } = useTheme();
  const reduceMotion = useReducedMotion();
  const lean = LEAN[index % LEAN.length] ?? 0;
  const swing = useSharedValue(reduceMotion ? 0 : (SWING[0] ?? 0));

  useEffect(() => {
    if (reduceMotion) {
      swing.value = 0;
      return;
    }
    const leg = motion.duration.swing / 3;
    const ease = Easing.inOut(Easing.sin);
    swing.value = withDelay(
      index * motion.stagger * 2,
      withSequence(
        withTiming(SWING[1] ?? 0, { duration: leg, easing: ease }),
        withTiming(SWING[2] ?? 0, { duration: leg, easing: ease }),
        withTiming(SWING[3] ?? 0, { duration: leg, easing: ease }),
      ),
    );
  }, [index, reduceMotion, swing]);

  const swingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${lean + swing.value}deg` }],
  }));

  const styles = useStyles(
    (): Record<'slot' | 'rail' | 'tag' | 'face' | 'newFace', ViewStyle> => ({
      slot: { width: W, height: H + SHADOW_DROP },
      // Half a gap past each side, so the segments of neighbouring tags meet into one line.
      rail: {
        position: 'absolute',
        top: RAIL_Y - RAIL_HEIGHT / 2,
        start: -PRICE_TAG_GAP / 2,
        end: -PRICE_TAG_GAP / 2,
        height: RAIL_HEIGHT,
        backgroundColor: colors.border.default,
      },
      tag: { width: W, height: H + SHADOW_DROP, transformOrigin: ['50%', RAIL_Y, 0] },
      face: {
        position: 'absolute',
        top: FACE_TOP,
        start: FACE_SIDE,
        end: FACE_SIDE,
        bottom: FACE_BOTTOM + SHADOW_DROP,
        justifyContent: 'space-between',
      },
      newFace: {
        position: 'absolute',
        top: FACE_TOP,
        start: FACE_SIDE,
        end: FACE_SIDE,
        bottom: FACE_BOTTOM + SHADOW_DROP,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.border.default],
  );

  const outline = (
    <Svg width={W} height={H + SHADOW_DROP} style={StyleSheet.absoluteFill}>
      {row ? <Path d={BODY_PATH} fill={colors.storefront.tagShadow} translateY={SHADOW_DROP} /> : null}
      <Path
        d={BODY_PATH}
        fill={row ? colors.surface.main : colors.layout.transparent}
        stroke={row ? undefined : colors.interactive.main}
        strokeWidth={row ? undefined : borderWidths.md}
        strokeDasharray={row ? undefined : DASH}
      />
      <Path
        d={STRING_PATH}
        stroke={colors.text.tertiary}
        strokeWidth={borderWidths.thin}
        fill={colors.layout.transparent}
      />
      <Circle
        cx={W / 2}
        cy={HOLE_Y}
        r={HOLE_RADIUS}
        fill={colors.layout.base}
        stroke={colors.border.strong}
        strokeWidth={borderWidths.thin}
      />
    </Svg>
  );

  if (!row) {
    return (
      <Box style={styles.slot}>
        <Box style={styles.rail} />
        <Animated.View style={[styles.tag, swingStyle]}>
          <Pressable
            onPress={onPress}
            style={styles.slot}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.creatorHome.rates.newTag')}
          >
            {outline}
            <Box style={styles.newFace} gap="xs">
              <Plus size={sizes.icon.md} color={colors.interactive.main} />
              <Text variant="bodyMedium" color={colors.interactive.text} align="center">
                {t('marketplace.creatorHome.rates.newTag')}
              </Text>
            </Box>
          </Pressable>
        </Animated.View>
      </Box>
    );
  }

  const where = row.platformLabel ?? t('account.rates.inPerson');
  const Fallback = row.platform === null ? MapPin : Link2;

  return (
    <Box style={styles.slot}>
      <Box style={styles.rail} />
      <Animated.View style={[styles.tag, swingStyle]}>
        <Pressable
          onPress={onPress}
          style={styles.slot}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.rates.tagA11y', {
            service: row.packageLabel ? `${row.serviceLabel} · ${row.packageLabel}` : row.serviceLabel,
            where,
            price: formatMoney(row.price),
          })}
        >
          {outline}
          <Box style={styles.face}>
            <Box gap="xs">
              <Box row align="center" gap="xs">
                {row.platform && isSocialPlatform(row.platform) ? (
                  <SocialPlatformIcon platform={row.platform} size={sizes.icon.xs} color={colors.text.secondary} />
                ) : (
                  <Fallback size={sizes.icon.xs} color={colors.text.secondary} />
                )}
                <Box flex={1}>
                  <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                    {where}
                  </Text>
                </Box>
              </Box>
              <Text variant="bodyMedium" numberOfLines={2}>
                {row.serviceLabel}
              </Text>
              {row.packageLabel ? (
                <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                  {row.packageLabel}
                </Text>
              ) : null}
            </Box>
            <MoneyText value={row.price} size="title" />
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
};

export const PriceTag = memo(PriceTagComponent);
