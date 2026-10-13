import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Link2, MapPin, Plus } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, MoneyText, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import type { RateRow } from '@/domains/identity';

export const PRICE_TAG_WIDTH = moderateScale(164);
export const PRICE_TAG_HEIGHT = moderateScale(124);
/** How deep the pointed end cuts in. */
const POINT = moderateScale(22);
const HOLE_RADIUS = moderateScale(5);
const SHADOW_DROP = moderateScale(5);
/** Tags hang a little crooked, each its own way, like real ones on a rail. */
const LEAN = ['-2deg', '1.5deg', '-1deg'] as const;

/** Tag outline with its point at the reading end (right in LTR, left in RTL). */
const tagPath = (w: number, h: number, p: number, pointLeft: boolean): string =>
  pointLeft
    ? `M${p} 0 H${w} V${h} H${p} L0 ${h / 2} Z`
    : `M0 0 H${w - p} L${w} ${h / 2} L${w - p} ${h} H0 Z`;

interface PriceTagProps {
  /** `null` = the "new rate" tag that closes the rail. */
  row: RateRow | null;
  index: number;
  onPress: () => void;
}

/** A swing tag on the rates rail: where, what, and the price big at the bottom. */
const PriceTagComponent: React.FC<PriceTagProps> = ({ row, index, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL, borderWidths } = useTheme();
  const lean = LEAN[index % LEAN.length] ?? LEAN[0];
  const holeX = isRTL ? POINT : PRICE_TAG_WIDTH - POINT;

  const styles = useStyles(
    ({ spacing }): Record<'tag' | 'face' | 'dashed', ViewStyle> => ({
      tag: { width: PRICE_TAG_WIDTH, height: PRICE_TAG_HEIGHT + SHADOW_DROP, transform: [{ rotate: lean }] },
      // Content keeps clear of the point and the hole at the reading end.
      face: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: POINT + spacing.sm,
        height: PRICE_TAG_HEIGHT,
        paddingStart: spacing.lg,
        paddingVertical: spacing.md,
        justifyContent: 'space-between',
      },
      dashed: {
        width: PRICE_TAG_WIDTH,
        height: PRICE_TAG_HEIGHT,
        borderStyle: 'dashed',
        borderWidth: borderWidths.md,
        borderColor: colors.interactive.main,
      },
    }),
    [lean, colors.interactive.main, borderWidths.md],
  );

  if (!row) {
    return (
      <Pressable
        onPress={onPress}
        scaleOnPress
        borderRadius="lg"
        align="center"
        justify="center"
        gap="xs"
        style={styles.dashed}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.creatorHome.rates.newTag')}
      >
        <Plus size={sizes.icon.md} color={colors.interactive.main} />
        <Text variant="bodyMedium" color={colors.interactive.text}>
          {t('marketplace.creatorHome.rates.newTag')}
        </Text>
      </Pressable>
    );
  }

  const where = row.platformLabel ?? t('account.rates.inPerson');
  const Fallback = row.platform === null ? MapPin : Link2;
  const outline = tagPath(PRICE_TAG_WIDTH, PRICE_TAG_HEIGHT, POINT, isRTL);

  return (
    <Pressable
      onPress={onPress}
      style={styles.tag}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.creatorHome.rates.tagA11y', {
        service: row.packageLabel ? `${row.serviceLabel} · ${row.packageLabel}` : row.serviceLabel,
        where,
        price: formatMoney(row.price),
      })}
    >
      <Svg width={PRICE_TAG_WIDTH} height={PRICE_TAG_HEIGHT + SHADOW_DROP} style={StyleSheet.absoluteFill}>
        <Path d={outline} fill={colors.storefront.tagShadow} translateY={SHADOW_DROP} />
        <Path d={outline} fill={colors.surface.main} />
        <Circle
          cx={holeX}
          cy={PRICE_TAG_HEIGHT / 2}
          r={HOLE_RADIUS}
          fill={colors.layout.base}
          stroke={colors.border.strong}
          strokeWidth={borderWidths.thin}
        />
      </Svg>
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
          <Text variant="bodyMedium" numberOfLines={1}>
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
  );
};

export const PriceTag = memo(PriceTagComponent);
