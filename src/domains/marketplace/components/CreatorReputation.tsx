import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, RatingMark, Text } from '@/shared/ui';
import type { ExploreCreator } from '../types/explore';

export interface CreatorReputationProps {
  creator: Pick<ExploreCreator, 'rating' | 'completion' | 'response'>;
}

/** One grey capsule of the seal: icon, then its text. */
const Seal = memo<{ children: React.ReactNode; label: string }>(({ children, label }) => {
  const { colors } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="full"
      bg={colors.surface.elevated}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {children}
    </Box>
  );
});

/**
 * «The seal» (approved 2026-10-24): ★ rating · ✓ completion · ⏱ response, always in that order.
 * Each mark drops alone when the server sends `null` (too few deals yet); none → nothing at all.
 */
const CreatorReputationComponent: React.FC<CreatorReputationProps> = ({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { rating, completion, response } = creator;
  if (!rating && !completion && !response) return null;

  return (
    <Box row align="center" gap="xs" wrap>
      {rating ? <RatingMark value={rating.average} count={rating.count} pill /> : null}
      {completion ? (
        <Seal
          label={t('marketplace.creator.reputation.completionA11y', {
            rate: formatNumber(completion.rate),
            deals: formatNumber(completion.count),
          })}
        >
          <Check size={sizes.icon.xs} color={colors.interactive.main} strokeWidth={iconStroke.bold} />
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.creator.reputation.completion', { rate: formatNumber(completion.rate) })}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('common.rating.countShort', { count: formatNumber(completion.count) })}
          </Text>
        </Seal>
      ) : null}
      {response ? (
        <Seal label={response.label}>
          <Clock size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {response.label}
          </Text>
        </Seal>
      ) : null}
    </Box>
  );
};

export const CreatorReputation = memo(CreatorReputationComponent);
