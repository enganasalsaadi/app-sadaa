import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, StarHalf } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

const RATING_MAX = 5;
const STARS = Array.from({ length: RATING_MAX }, (_, index) => index + 1);

export type RatingStarsSize = 'sm' | 'md';

export interface RatingStarsProps {
  /** 0–5; display rounds to the nearest half star. */
  value: number;
  /** Number of ratings behind `value`, shown as `(12)`. */
  count?: number;
  /** Shows `4.3` next to the stars. Default true in display mode. */
  showValue?: boolean;
  size?: RatingStarsSize;
  /** Makes it an input: whole stars 1–5, 44pt targets. */
  onChange?: (value: number) => void;
}

type Fill = 'full' | 'half' | 'empty';

const fillFor = (star: number, rounded: number): Fill =>
  rounded >= star ? 'full' : rounded >= star - 0.5 ? 'half' : 'empty';

const StarIcon = memo<{ fill: Fill; size: number }>(({ fill, size }) => {
  const { colors, isRTL } = useTheme();
  const styles = useStyles(
    () => ({
      half: {
        position: 'absolute' as const,
        top: 0,
        start: 0,
        // StarHalf draws the left half; mirror it so it fills from the reading start.
        transform: [{ scaleX: isRTL ? -1 : 1 }],
      },
    }),
    [isRTL],
  );
  const on = colors.premium.main;

  return (
    <Box>
      <Star size={size} color={fill === 'full' ? on : colors.border.strong} fill={fill === 'full' ? on : colors.layout.transparent} />
      {fill === 'half' ? (
        <Box style={styles.half}>
          <StarHalf size={size} color={on} fill={on} />
        </Box>
      ) : null}
    </Box>
  );
});

const StarButton = memo<{
  star: number;
  selected: boolean;
  checked: boolean;
  size: number;
  onChange: (value: number) => void;
}>(
  ({ star, selected, checked, size, onChange }) => {
    const { t } = useTranslation();
    const { sizes } = useTheme();
    const handlePress = useCallback(() => onChange(star), [onChange, star]);

    return (
      <Pressable
        onPress={handlePress}
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        align="center"
        justify="center"
        scaleOnPress
        accessibilityRole="radio"
        accessibilityLabel={t('common.rating.rate', { value: formatNumber(star), max: formatNumber(RATING_MAX) })}
        accessibilityState={{ checked }}
      >
        <StarIcon fill={selected ? 'full' : 'empty'} size={size} />
      </Pressable>
    );
  },
);

/** Star rating (creators, brands): display with value and count, or a 1–5 input. */
const RatingStarsComponent: React.FC<RatingStarsProps> = ({
  value,
  count,
  showValue = true,
  size = 'sm',
  onChange,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const iconSize = size === 'md' ? sizes.icon.md : sizes.icon.sm;
  const clamped = Math.min(RATING_MAX, Math.max(0, value));

  if (onChange) {
    return (
      <Box row accessibilityRole="radiogroup">
        {STARS.map(star => (
          <StarButton
            key={star}
            star={star}
            selected={star <= clamped}
            checked={star === Math.round(clamped)}
            size={sizes.icon.lg}
            onChange={onChange}
          />
        ))}
      </Box>
    );
  }

  const rounded = Math.round(clamped * 2) / 2;
  const valueLabel = formatNumber(clamped, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const a11y = [
    t('common.rating.summary', { value: valueLabel, max: formatNumber(RATING_MAX) }),
    count !== undefined ? t('common.rating.count', { count: formatNumber(count) }) : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box row align="center" gap="xs" accessible accessibilityRole="text" accessibilityLabel={a11y}>
      <Box row gap="xs">
        {STARS.map(star => (
          <StarIcon key={star} fill={fillFor(star, rounded)} size={iconSize} />
        ))}
      </Box>
      {showValue ? (
        <Text variant={size === 'md' ? 'bodyMedium' : 'bodySmall'}>{valueLabel}</Text>
      ) : null}
      {count !== undefined ? (
        <Text variant={size === 'md' ? 'bodySmall' : 'caption'} color={colors.text.secondary}>
          {t('common.rating.countShort', { count: formatNumber(count) })}
        </Text>
      ) : null}
    </Box>
  );
};

export const RatingStars = memo(RatingStarsComponent);
