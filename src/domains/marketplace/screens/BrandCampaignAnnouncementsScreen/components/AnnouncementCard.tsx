import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Megaphone } from 'lucide-react-native';
import { resolveHue, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { CampaignAnnouncement } from '../../../types/campaignAnnouncement';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

export interface AnnouncementCardProps {
  announcement: CampaignAnnouncement;
  /** One stable handler for every card. */
  onCopyLink: (link: string) => void;
}

/** One past broadcast: the words, when it went, how many creators the server says it reached, its link (copied, never opened). */
const AnnouncementCardComponent: React.FC<AnnouncementCardProps> = ({ announcement, onCopyLink }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, 'info');
  const { link } = announcement;
  const copy = useCallback(() => {
    if (link) onCopyLink(link);
  }, [link, onCopyLink]);

  return (
    <Box row align="flex-start" gap="md" p="lg" borderRadius="lg" bg={colors.surface.main} shadow="card">
      <Box align="center" justify="center" p="sm" borderRadius="full" bg={hue.soft}>
        <Megaphone size={sizes.icon.sm} color={hue.text} />
      </Box>
      <Box flex={1} gap="sm">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {announcement.body}
        </Text>
        <Box row wrap align="center" gap="xs">
          <Text variant="caption" color={colors.text.tertiary}>
            {formatCampaignDateTime(announcement.sentAt)}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            ·
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.campaign.announcements.reached', { count: announcement.recipients })}
          </Text>
        </Box>
        {link ? (
          <Pressable
            row
            align="center"
            gap="xs"
            onPress={copy}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.campaign.announcements.history.copyLink')}
            accessibilityHint={link}
          >
            <Link2 size={sizes.icon.xs} color={colors.interactive.main} />
            <Box flex={1}>
              <Text variant="caption" color={colors.interactive.main} numberOfLines={1}>
                {isolateLtr(link)}
              </Text>
            </Box>
          </Pressable>
        ) : null}
      </Box>
    </Box>
  );
};

export const AnnouncementCard = memo(AnnouncementCardComponent);
