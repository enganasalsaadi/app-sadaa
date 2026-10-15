import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { ratingHoursLeft, type DealRatingView } from '../utils/dealRating';
import { formatDuration } from '../utils/offerDuration';
import { DealRatingEnvelope } from './DealRatingEnvelope';
import { DealRatingWax } from './DealRatingWax';

const ENVELOPE_HEIGHT = moderateScale(132);
const WAX = moderateScale(48);

export interface DealRatingEnvelopesCardProps {
  name: string;
  view: DealRatingView;
  /** Your average, known only for a rating sent in this visit (the server keeps it blind). */
  sentOverall: number | null;
  now: number;
}

/**
 * After you rate (or once the window shut, before the reveal is in): both envelopes side by side,
 * yours sealed, theirs sealed or still empty, and how long until they open. Nothing to do here.
 */
const DealRatingEnvelopesCardComponent: React.FC<
  DealRatingEnvelopesCardProps
> = ({ name, view, sentOverall, now }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'chip', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.lg,
      },
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.surface.elevated,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
      },
    }),
    [colors.surface.elevated, colors.surface.main],
  );
  const hours = view.stage === 'sealed' ? ratingHoursLeft(view.dueAt, now) : null;
  const duration = hours === null ? null : formatDuration(t, hours);
  const { mine, theirs } = view;
  return (
    <Box style={styles.card}>
      <Box row align="center" justify="space-between" gap="sm">
        <Text variant="title" color={colors.text.primary} accessibilityRole="header">
          {t('marketplace.deals.rating.card.title')}
        </Text>
        {duration ? (
          <Box style={styles.chip}>
            <Hourglass size={sizes.icon.xs} color={colors.icon.secondary} />
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.deals.rating.card.chip', { duration })}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Box row gap="md">
        <DealRatingEnvelope
          state={mine.answered ? 'sealed' : 'waiting'}
          height={ENVELOPE_HEIGHT}
          title={t('marketplace.deals.rating.envelope.mine')}
          caption={
            mine.answered
              ? t('marketplace.deals.rating.envelope.sealed')
              : t('marketplace.deals.rating.reveal.mineNone')
          }
          seal={
            sentOverall === null ? undefined : (
              <DealRatingWax size={WAX} value={sentOverall} />
            )
          }
        />
        <DealRatingEnvelope
          state={theirs.answered ? 'sealed' : 'waiting'}
          height={ENVELOPE_HEIGHT}
          title={t('marketplace.deals.rating.envelope.theirs', { name })}
          caption={
            theirs.answered
              ? t('marketplace.deals.rating.envelope.arrived')
              : t('marketplace.deals.rating.envelope.waiting')
          }
        />
      </Box>
      <Text variant="caption" color={colors.text.tertiary} align="center">
        {duration
          ? t('marketplace.deals.rating.card.foot', { name, duration })
          : t('marketplace.deals.rating.card.closing')}
      </Text>
    </Box>
  );
};

export const DealRatingEnvelopesCard = memo(DealRatingEnvelopesCardComponent);
