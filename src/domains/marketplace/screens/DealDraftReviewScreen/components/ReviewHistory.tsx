import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DEAL_DRAFT_REVIEW_TONE } from '../../../constants/dealStatus';
import type { DealDraft } from '../../../types';
import { formatTimecode, pinFileNumber } from '../../../utils/dealDrafts';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

export interface ReviewHistoryProps {
  drafts: DealDraft[];
}

const Round = memo<{ draft: DealDraft }>(({ draft }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const review = draft.review;
  const hue = resolveHue(colors, review?.decision.key ? DEAL_DRAFT_REVIEW_TONE[review.decision.key] : 'neutral');
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'round', ViewStyle> => ({
      round: {
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radii.lg,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
        borderStartWidth: borderWidths.md,
        borderStartColor: hue.main,
      },
    }),
    [colors.border.default, hue.main],
  );
  return (
    <Box style={styles.round}>
      <Box row justify="space-between" align="center" gap="sm">
        <Text variant="label" color={hue.text} numberOfLines={1}>
          {t('marketplace.deals.drafts.review.historyRound', {
            round: draft.round,
            decision: review?.decision.label ?? '',
          })}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {formatDate(draft.submittedAt, DATE_FORMAT, i18n.language)}
        </Text>
      </Box>
      {review?.note ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {review.note}
        </Text>
      ) : null}
      {review?.pins.map(pin => (
        <Text key={`${pin.fileId}:${pin.atSecond ?? 'file'}:${pin.note}`} variant="caption" color={colors.text.tertiary}>
          {`${
            pin.atSecond === null
              ? t('marketplace.deals.drafts.pin.file', { file: pinFileNumber(draft, pin) })
              : t('marketplace.deals.drafts.pin.fileAt', {
                  file: pinFileNumber(draft, pin),
                  time: formatTimecode(pin.atSecond),
                })
          } · ${pin.note}`}
        </Text>
      ))}
    </Box>
  );
});

/** Earlier rounds of the item and what the brand said on each (the in-app record, rule 06). */
const ReviewHistoryComponent: React.FC<ReviewHistoryProps> = ({ drafts }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (drafts.length === 0) return null;
  return (
    <Box gap="sm">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.drafts.review.history')}
      </Text>
      {drafts.map(draft => (
        <Round key={draft.id} draft={draft} />
      ))}
    </Box>
  );
};

export const ReviewHistory = memo(ReviewHistoryComponent);
