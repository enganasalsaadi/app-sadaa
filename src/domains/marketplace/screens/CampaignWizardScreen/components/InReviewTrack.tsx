import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';

const DOT = moderateScale(14);

type TrackStage = 'sent' | 'review' | 'live';
type TrackState = 'done' | 'now' | 'next';

const STAGES = [
  { key: 'sent', state: 'done', title: 'marketplace.campaign.wizard.inReview.sent.title', caption: 'marketplace.campaign.wizard.inReview.sent.caption' },
  { key: 'review', state: 'now', title: 'marketplace.campaign.wizard.inReview.review.title', caption: 'marketplace.campaign.wizard.inReview.review.caption' },
  { key: 'live', state: 'next', title: 'marketplace.campaign.wizard.inReview.live.title', caption: 'marketplace.campaign.wizard.inReview.live.caption' },
] as const satisfies readonly { key: TrackStage; state: TrackState; title: ParseKeys; caption: ParseKeys }[];

/**
 * Where the campaign is, on glass: sent, in review now (a living dot), then published and open for
 * applications. Status reads from the words; the dots only echo it.
 */
const InReviewTrackComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'box' | 'rail' | 'line' | 'done' | 'next', ViewStyle> => ({
      box: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      rail: { width: DOT, alignItems: 'center', paddingTop: spacing.xs },
      line: { flex: 1, width: borderWidths.md, marginTop: spacing.xs, backgroundColor: colors.glass.border },
      done: { width: DOT, height: DOT, borderRadius: radii.full, backgroundColor: colors.glass.iconInteractive },
      next: {
        width: DOT,
        height: DOT,
        borderRadius: radii.full,
        borderWidth: borderWidths.md,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.border, colors.glass.fill, colors.glass.iconInteractive],
  );

  return (
    <Box style={styles.box} accessibilityRole="list" accessibilityLabel={t('marketplace.campaign.wizard.inReview.stepsA11y')}>
      {STAGES.map((stage, index) => {
        const last = index === STAGES.length - 1;
        return (
          <Box key={stage.key} row gap="md">
            <Box style={styles.rail}>
              {stage.state === 'now' ? <LiveDot color={colors.text.onBrand} size={DOT} /> : null}
              {stage.state === 'done' ? <Box style={styles.done} /> : null}
              {stage.state === 'next' ? <Box style={styles.next} /> : null}
              {last ? null : <Box style={styles.line} />}
            </Box>
            <Box flex={1} gap="xs" pb={last ? undefined : 'lg'}>
              <Text variant="label" color={colors.text.onBrand}>
                {t(stage.title)}
              </Text>
              <Text variant="caption" color={colors.text.onBrandMuted}>
                {t(stage.caption)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export const InReviewTrack = memo(InReviewTrackComponent);
