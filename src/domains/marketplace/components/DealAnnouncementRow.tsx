import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { Copy, Megaphone } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { toastService } from '@/core/toast';
import { Box, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealTimelineEvent } from '../utils/dealTimelineEvents';

const BADGE = moderateScale(28);
const EVENT_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export interface DealAnnouncementRowProps {
  event: DealTimelineEvent;
}

/**
 * A brand's announcement to its campaign, in the history (PC6.3): informational only, terms never
 * change with it. The address is shown and copied, not opened: a brand can type any host, and only
 * allow-listed ones leave the app (rule 07).
 */
const DealAnnouncementRowComponent: React.FC<DealAnnouncementRowProps> = ({ event }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { announcement } = event;
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'badge' | 'card' | 'link', ViewStyle> => ({
      badge: {
        width: BADGE,
        height: BADGE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      card: {
        borderRadius: radii.md,
        padding: spacing.md,
        gap: spacing.sm,
        backgroundColor: colors.surface.elevated,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
      },
      link: { alignSelf: 'flex-start' },
    }),
    [colors.border.card, colors.interactive.soft, colors.surface.elevated],
  );
  const link = announcement?.link ?? null;
  const copyLink = useCallback(() => {
    if (link === null) return;
    Clipboard.setString(link);
    toastService.info(t('marketplace.deals.announcement.copied'));
  }, [link, t]);

  if (!announcement) return null;
  return (
    <Box style={styles.card} accessible accessibilityRole="text">
      <Box row align="center" gap="sm">
        <Box style={styles.badge}>
          <Megaphone size={sizes.icon.xs} color={colors.interactive.text} />
        </Box>
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.primary}>
            {t('marketplace.deals.announcement.title')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {formatDate(event.at, EVENT_FORMAT, i18n.language)}
          </Text>
        </Box>
      </Box>
      <Text variant="bodyMedium" color={colors.text.primary}>
        {announcement.body}
      </Text>
      {link !== null ? (
        <Pressable
          style={styles.link}
          onPress={copyLink}
          row
          align="center"
          gap="xs"
          minHeight={sizes.button.md}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.announcement.copy')}
        >
          <Copy size={sizes.icon.xs} color={colors.interactive.text} />
          <Text variant="buttonSmall" color={colors.interactive.text} numberOfLines={1}>
            {isolateLtr(link)}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DealAnnouncementRow = memo(DealAnnouncementRowComponent);
