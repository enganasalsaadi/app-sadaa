import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MailOpen } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { DealRatingClock } from './DealRatingClock';

export interface DealRatingInviteProps {
  name: string;
  questions: number;
  /** The other side has rated already: rating back opens both now. */
  theirsAnswered: boolean;
  dueAt: number | null;
  now: number;
  onStart: () => void;
}

/**
 * The completed deal's one ask (replaces the «next step» card while the viewer hasn't rated): a
 * title, how short it is, the window's clock and one button. No envelopes before you start.
 */
const DealRatingInviteComponent: React.FC<DealRatingInviteProps> = ({
  name,
  questions,
  theirsAnswered,
  dueAt,
  now,
  onStart,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'tease', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        padding: spacing.lg,
        gap: spacing.lg,
        ...shadows.lg,
      },
      tease: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: colors.interactive.soft,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      },
    }),
    [colors.interactive.soft, colors.surface.main],
  );
  const Forward = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="h4" color={colors.text.primary} accessibilityRole="header">
            {t('marketplace.deals.rating.invite.title', { name })}
          </Text>
          <Text variant="bodySmall" color={colors.text.tertiary}>
            {t('marketplace.deals.rating.invite.meta', {
              count: questions,
            })}
          </Text>
        </Box>
        <DealRatingClock dueAt={dueAt} now={now} />
      </Box>
      {theirsAnswered ? (
        <Box style={styles.tease}>
          <MailOpen size={sizes.icon.sm} color={colors.interactive.main} />
          <Box flex={1}>
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t('marketplace.deals.rating.invite.tease', { name })}
            </Text>
          </Box>
        </Box>
      ) : null}
      <CustomButton
        title={t('marketplace.deals.rating.invite.cta')}
        onPress={onStart}
        fullWidth
        rightIcon={<Forward size={sizes.icon.sm} />}
      />
    </Box>
  );
};

export const DealRatingInvite = memo(DealRatingInviteComponent);
