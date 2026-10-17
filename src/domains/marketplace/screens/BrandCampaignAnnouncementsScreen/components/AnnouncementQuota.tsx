import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { AnnouncementQuota as Quota } from '../../../utils/campaignAnnouncement';

const DOT = moderateScale(34);

const Dot = memo<{ lit: boolean; capped: boolean }>(({ lit, capped }) => {
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, capped ? 'warning' : 'info');
  const styles = useStyles(
    ({ borderWidths }): Record<'dot', ViewStyle> => ({
      dot: {
        width: DOT,
        height: DOT,
        borderRadius: DOT / 2,
        borderWidth: borderWidths.thin,
        borderColor: lit ? hue.main : colors.border.strong,
        backgroundColor: lit ? hue.soft : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.border.strong, hue.main, hue.soft, lit],
  );
  return <Box style={styles.dot}>{lit ? <Megaphone size={sizes.icon.xs} color={hue.text} /> : null}</Box>;
});

export interface AnnouncementQuotaProps {
  quota: Quota;
}

/**
 * «x of 3 today»: one dot per slot of the rolling 24 hours, lit for each real broadcast in the
 * history. At the cap all three turn amber (the editor is locked under them). No local counter.
 */
const AnnouncementQuotaComponent: React.FC<AnnouncementQuotaProps> = ({ quota }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const capped = quota.unlocksAt !== null;
  const hue = resolveHue(colors, capped ? 'warning' : 'info');
  const used = formatNumber(quota.used);
  const limit = formatNumber(quota.limit);

  return (
    <Box
      row
      align="center"
      justify="space-between"
      gap="md"
      accessible
      accessibilityLabel={t('marketplace.campaign.announcements.quota.a11y', { used, limit })}
    >
      <Box row gap="sm" importantForAccessibility="no-hide-descendants">
        {Array.from({ length: quota.limit }, (_, index) => (
          <Dot key={index} lit={index < quota.used} capped={capped} />
        ))}
      </Box>
      <Box align="flex-end" flex={1}>
        <Text variant="h3" color={capped ? hue.text : colors.text.primary}>
          {t('marketplace.campaign.announcements.quota.used', { used, limit })}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.campaign.announcements.quota.rolling')}
        </Text>
      </Box>
    </Box>
  );
};

export const AnnouncementQuota = memo(AnnouncementQuotaComponent);
