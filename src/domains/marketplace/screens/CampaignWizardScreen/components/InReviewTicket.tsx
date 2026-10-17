import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ImageIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, Image, Tag, Text } from '@/shared/ui';
import type { CampaignDetail } from '../../../types/campaign';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

const COVER_WIDTH = moderateScale(92);
const COVER_HEIGHT = moderateScale(96);
/** The ticket leans a little, like a card just handed over. */
const TILT = '-1.5deg';

interface InReviewTicketProps {
  campaign: CampaignDetail;
  coverUrl: string | null;
}

/** The campaign as it was handed in: its cover, when it went, its name, its kind and its seats. */
const InReviewTicketComponent: React.FC<InReviewTicketProps> = ({ campaign, coverUrl }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();

  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'ticket' | 'cover', ViewStyle> => ({
      ticket: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        transform: [{ rotate: TILT }],
        ...shadows.lg,
      },
      cover: { width: COVER_WIDTH, height: COVER_HEIGHT, borderRadius: radii.md, overflow: 'hidden' },
    }),
    [colors.surface.main],
  );

  return (
    <Animated.View entering={reduceMotion ? undefined : FadeInDown.springify().damping(14)} style={styles.ticket}>
      <Box style={styles.cover}>
        {coverUrl ? (
          <Image uri={coverUrl} width={COVER_WIDTH} height={COVER_HEIGHT} resizeMode="cover" />
        ) : (
          <GradientSurface variant="brand" flex={1} align="center" justify="center">
            <ImageIcon size={sizes.icon.md} color={colors.glass.iconInteractive} />
          </GradientSurface>
        )}
      </Box>
      <Box flex={1} gap="xs" justify="center">
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.campaign.wizard.inReview.sentAt', { date: formatCampaignDateTime(campaign.updatedAt) })}
        </Text>
        <Text variant="title" color={colors.text.primary} numberOfLines={2}>
          {campaign.title}
        </Text>
        <Box row gap="xs" wrap>
          {campaign.activityType ? <Tag label={campaign.activityType.label} tone="brand" /> : null}
          <Tag label={t('marketplace.campaign.wizard.inReview.seats', { count: campaign.seatsTotal })} tone="neutral" />
        </Box>
      </Box>
    </Animated.View>
  );
};

export const InReviewTicket = memo(InReviewTicketComponent);
