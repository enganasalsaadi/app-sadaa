import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PencilLine } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import { DealRoundBars } from '../../../components/DealRoundBars';
import type { DealRounds } from '../../../utils/dealDrafts';

export interface ReviewDockProps {
  rounds: DealRounds;
  /** The round on the table (the last one handed in). */
  round: number;
  /** `asIs`: the creator ran past the revision window; only approving the last round is left. */
  mode: 'review' | 'asIs';
  /** Notes pinned so far (they ride along with a change request). */
  notes: number;
  approving: boolean;
  onApprove: () => Promise<boolean>;
  onRevise: () => void;
}

/**
 * The review's decision bar, one block: the rounds left beside «ask for changes» (with the pinned
 * notes it carries; «extra round» once the rounds are used up), then press-and-hold to approve
 * across the full width, which moves the item to publishing.
 */
const ReviewDockComponent: React.FC<ReviewDockProps> = ({ rounds, round, mode, notes, approving, onApprove, onRevise }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const out = rounds.remaining <= 0;
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'revise' | 'count' | 'label', ViewStyle> => ({
      revise: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: sizes.button.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.full,
        backgroundColor: colors.surface.elevated,
        borderWidth: borderWidths.thin,
        borderColor: notes > 0 ? colors.status.warning.main : colors.border.default,
      },
      count: {
        minWidth: sizes.badge.md,
        height: sizes.badge.md,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.status.warning.soft,
      },
      label: { flexShrink: 1 },
    }),
    [colors, notes, sizes],
  );

  const asIs = mode === 'asIs';
  const reviseLabel = out ? t('marketplace.deals.drafts.review.dock.extra') : t('marketplace.deals.drafts.review.dock.revise');
  const roundsLabel = out
    ? t('marketplace.deals.drafts.review.dock.extraHint')
    : t('marketplace.deals.drafts.review.dock.left', { remaining: rounds.remaining, allowed: rounds.allowed });

  return (
    <Box px="xl" pt="md" pb="md" gap="md">
      {asIs ? null : (
        <Box row align="center" justify="space-between" gap="md">
          <Box row align="center" gap="sm" flex={1}>
            {out ? null : <DealRoundBars rounds={rounds} />}
            <Text
              variant="caption"
              color={out ? colors.status.warning.text : colors.text.tertiary}
              numberOfLines={1}
              style={styles.label}
            >
              {roundsLabel}
            </Text>
          </Box>
          <Pressable
            style={styles.revise}
            onPress={onRevise}
            scaleOnPress
            accessibilityRole="button"
            accessibilityLabel={`${reviseLabel} · ${roundsLabel}`}
          >
            <PencilLine size={sizes.icon.xs} color={colors.text.primary} />
            <Text variant="buttonSmall" color={colors.text.primary} numberOfLines={1}>
              {reviseLabel}
            </Text>
            {notes > 0 ? (
              <Box style={styles.count}>
                <Text variant="caption" color={colors.status.warning.text}>
                  {formatNumber(notes)}
                </Text>
              </Box>
            ) : null}
          </Pressable>
        </Box>
      )}
      <DealHoldToSign
        label={asIs ? t('marketplace.deals.drafts.review.dock.asIs') : t('marketplace.deals.drafts.review.dock.approve')}
        caption={
          asIs
            ? t('marketplace.deals.drafts.review.dock.asIsCaption', { round })
            : t('marketplace.deals.drafts.review.dock.approveCaption')
        }
        hint={t('marketplace.deals.drafts.review.dock.approveHint')}
        accessibilityLabel={t('marketplace.deals.drafts.review.dock.approveA11y', { round })}
        accessibilityHint={t('marketplace.deals.drafts.review.dock.approveHint')}
        onComplete={onApprove}
        sending={approving}
        sendingLabel={t('marketplace.deals.drafts.review.dock.approving')}
      />
    </Box>
  );
};

export const ReviewDock = memo(ReviewDockComponent);
