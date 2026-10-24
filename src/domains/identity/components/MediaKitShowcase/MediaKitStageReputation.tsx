import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, Star } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, RatingStars, Text } from '@/shared/ui';
import type { StageReputation } from '../../utils/mediaKitStage';

const RESPONSE_LINES = 2;
const RATING_MAX = 5;

/** One cell of the strip; every cell after the first draws a hairline at its reading start. */
const Cell = memo<{ children: React.ReactNode; divided: boolean; label: string }>(
  ({ children, divided, label }) => {
    const { colors, borderWidths } = useTheme();
    const styles = useStyles(
      (): Record<'divided', ViewStyle> => ({
        divided: { borderStartWidth: borderWidths.thin, borderStartColor: colors.glass.border },
      }),
      [borderWidths.thin, colors.glass.border],
    );
    return (
      <Box
        flex={1}
        align="center"
        justify="center"
        gap="xs"
        px="sm"
        py="md"
        style={divided ? styles.divided : undefined}
        accessible
        accessibilityRole="text"
        accessibilityLabel={label}
      >
        {children}
      </Box>
    );
  },
);

/**
 * The stage's reputation strip (approved 2026-10-24): a glass row of ★ rating with its stars and
 * count, completion, and the server's response badge. Missing cells drop, the rest widen.
 */
const MediaKitStageReputationComponent: React.FC<{ reputation: StageReputation }> = ({ reputation }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { rating, completion, response } = reputation;
  const ratingValue = rating
    ? formatNumber(rating.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '';
  const cells: React.ReactNode[] = [];

  if (rating) {
    cells.push(
      <Cell
        key="rating"
        divided={cells.length > 0}
        label={`${t('common.rating.summary', { value: ratingValue, max: formatNumber(RATING_MAX) })}, ${t(
          'account.mediaKit.showcase.stage.ratings',
          { count: rating.count },
        )}`}
      >
        <Box row align="center" gap="xs">
          <Star size={sizes.icon.sm} color={colors.premium.main} fill={colors.premium.main} />
          <Text variant="amountLarge" color={colors.text.onBrand}>
            {ratingValue}
          </Text>
        </Box>
        <RatingStars value={rating.average} showValue={false} surface="onBrand" />
        <Text variant="caption" color={colors.text.onBrandMuted} align="center">
          {t('account.mediaKit.showcase.stage.ratings', { count: rating.count })}
        </Text>
      </Cell>,
    );
  }
  if (completion) {
    const rate = t('account.mediaKit.showcase.stage.completionRate', { rate: formatNumber(completion.rate) });
    cells.push(
      <Cell
        key="completion"
        divided={cells.length > 0}
        label={`${rate} ${t('account.mediaKit.showcase.stage.completed')} ${t('common.rating.countShort', {
          count: formatNumber(completion.count),
        })}`}
      >
        <Text variant="amountTitle" color={colors.text.onBrand}>
          {rate}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted} align="center">
          {t('account.mediaKit.showcase.stage.completed')}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted}>
          {t('common.rating.countShort', { count: formatNumber(completion.count) })}
        </Text>
      </Cell>,
    );
  }
  if (response) {
    cells.push(
      <Cell key="response" divided={cells.length > 0} label={response}>
        <Clock size={sizes.icon.md} color={colors.glass.iconInteractive} />
        <Text variant="caption" color={colors.text.onBrandMuted} align="center" numberOfLines={RESPONSE_LINES}>
          {response}
        </Text>
      </Cell>,
    );
  }

  return (
    <Box
      row
      width="100%"
      borderRadius="xl"
      overflow="hidden"
      bg={colors.glass.fill}
      borderWidth="thin"
      borderColor={colors.glass.border}
    >
      {cells}
    </Box>
  );
};

export const MediaKitStageReputation = memo(MediaKitStageReputationComponent);
