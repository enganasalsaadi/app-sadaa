import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

const RATING_MAX = 5;

/** `onBrand`: over navy or a photo — white figure, muted count. */
export type RatingMarkSurface = 'default' | 'onBrand';

export interface RatingMarkProps {
  /** Server average, 1–5. */
  value: number;
  /** Ratings behind `value`, shown as `(12)`. */
  count: number;
  /** Capsule (soft mustard; glass on `onBrand`), for a row of marks or a navy header. Default bare. */
  pill?: boolean;
  /** Default `default`. */
  surface?: RatingMarkSurface;
}

/**
 * Compact public rating: one gold ★, the average and its count. Gold = ranking role (rule 08).
 * Callers hide it when the server sends no rating — never a «no ratings» state.
 */
const RatingMarkComponent: React.FC<RatingMarkProps> = ({
  value,
  count,
  pill = false,
  surface = 'default',
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const onBrand = surface === 'onBrand';
  const valueLabel = formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const countLabel = formatNumber(count);
  const a11y = `${t('common.rating.summary', { value: valueLabel, max: formatNumber(RATING_MAX) })}, ${t(
    'common.rating.count',
    { count: countLabel },
  )}`;

  return (
    <Box
      row
      align="center"
      gap="xs"
      px={pill ? 'sm' : undefined}
      py={pill ? 'xs' : undefined}
      borderRadius={pill ? 'full' : undefined}
      bg={pill ? (onBrand ? colors.glass.fill : colors.premium.soft) : undefined}
      borderWidth={pill && onBrand ? 'thin' : undefined}
      borderColor={pill && onBrand ? colors.glass.border : undefined}
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11y}
    >
      <Star size={sizes.icon.xs} color={colors.premium.main} fill={colors.premium.main} />
      <Text variant="amountSmall" color={onBrand ? colors.text.onBrand : colors.text.primary}>
        {valueLabel}
      </Text>
      <Text variant="caption" color={onBrand ? colors.text.onBrandMuted : colors.text.tertiary}>
        {t('common.rating.countShort', { count: countLabel })}
      </Text>
    </Box>
  );
};

export const RatingMark = memo(RatingMarkComponent);
