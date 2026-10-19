import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { iconStroke, moderateScale, opacity, resolveHue, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, Pressable, StatusPill, Text } from '@/shared/ui';
import type { BrandActiveCampaign } from '../../../types';
import { campaignDropLeft, campaignSeatSplit } from '../../../utils/campaignHome';
import { getCampaignStatusMeta } from '../../../utils/campaignStatus';
import type { CampaignTimeLeft } from '../../../utils/campaignList';
import { CampaignSeatDots } from './CampaignSeatDots';

export const CAMPAIGN_CARD_WIDTH = moderateScale(292);

interface CampaignSeatCardProps {
  campaign: BrandActiveCampaign;
  now: number;
  onOpen: (campaign: BrandActiveCampaign) => void;
}

/** Only the biggest unit of the time left, spelled out, so the stat cell never squeezes «43ي 4س». */
const dropValueKey = (left: CampaignTimeLeft) => {
  switch (left.unit) {
    case 'days':
      return { key: 'marketplace.brandHome.campaigns.dropIn.days', count: left.days } as const;
    case 'hours':
      return { key: 'marketplace.brandHome.campaigns.dropIn.hours', count: left.hours } as const;
    case 'minutes':
      return { key: 'marketplace.brandHome.campaigns.dropIn.minutes', count: left.minutes } as const;
    default: {
      const _exhaustive: never = left;
      return _exhaustive;
    }
  }
};

interface StatProps {
  value: string;
  label: string;
  hot?: boolean;
}

const Stat = memo<StatProps>(({ value, label, hot = false }) => {
  const { colors } = useTheme();
  return (
    <Box flex={1} align="center" gap="xs">
      <Text variant="title" color={hot ? colors.status.warning.text : colors.text.primary} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
});

/**
 * One active campaign: status and budget trust on one line, the title, seat dots, three numbers, and
 * a quiet arrow in the corner — the whole card opens it. A campaign that needs the brand wears an
 * amber ring and the server's own words beside the arrow.
 */
const CampaignSeatCardComponent: React.FC<CampaignSeatCardProps> = ({ campaign, now, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const warning = resolveHue(colors, 'warning');
  const money = resolveHue(colors, 'money');
  const statusTone = getCampaignStatusMeta(campaign.status.key).tone;
  const { needsAction, action, seats, budgetSecured } = campaign;
  const styles = useStyles(
    ({ borderWidths }): Record<'card' | 'trust' | 'arrow', ViewStyle> => ({
      card: {
        borderWidth: needsAction ? borderWidths.md : borderWidths.thin,
        borderColor: needsAction ? warning.main : colors.border.default,
      },
      trust: { flexShrink: 1 },
      arrow: {
        width: sizes.button.sm,
        height: sizes.button.sm,
        borderRadius: sizes.button.sm / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: needsAction ? warning.soft : colors.interactive.soft,
      },
    }),
    [colors.border.default, colors.interactive.soft, needsAction, sizes.button.sm, warning.main, warning.soft],
  );
  const open = useCallback(() => onOpen(campaign), [campaign, onOpen]);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const actionLabel = needsAction && action ? action.label : null;
  const dropLeft = campaignDropLeft(campaign, now);
  const dropValue = dropLeft ? dropValueKey(dropLeft) : null;
  const Shield = budgetSecured ? ShieldCheck : ShieldAlert;
  const shieldHue = budgetSecured ? money : warning;

  return (
    <Pressable
      width={CAMPAIGN_CARD_WIDTH}
      bg={colors.surface.main}
      borderRadius="xl"
      p="lg"
      gap="lg"
      style={styles.card}
      onPress={open}
      activeOpacity={opacity.pressedSubtle}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.brandHome.campaigns.cardA11y', {
        title: campaign.title,
        status: campaign.status.label,
        free: seats.free,
        total: seats.total,
      })}
      accessibilityHint={actionLabel ?? t('marketplace.brandHome.campaigns.open')}
    >
      <Box gap="sm">
        <Box row align="center" justify="space-between" gap="md">
          <StatusPill label={campaign.status.label} tone={statusTone} size="sm" />
          <Box row align="center" gap="xs" style={styles.trust}>
            <Shield size={sizes.icon.xs} color={shieldHue.main} strokeWidth={iconStroke.bold} />
            <Text variant="caption" color={shieldHue.text} numberOfLines={1}>
              {budgetSecured
                ? t('marketplace.campaign.list.secured')
                : t('marketplace.brandHome.campaigns.unsecured')}
            </Text>
          </Box>
        </Box>
        <Text variant="title" numberOfLines={2}>
          {campaign.title}
        </Text>
      </Box>
      <CampaignSeatDots seats={campaignSeatSplit(campaign)} />
      <Box row>
        <Stat
          value={formatNumber(campaign.applicationsOpen)}
          label={t('marketplace.brandHome.campaigns.stat.applications')}
          hot={needsAction && action?.key === 'review_applicants'}
        />
        <Stat
          value={formatNumber(campaign.awaitingPaymentCount)}
          label={t('marketplace.brandHome.campaigns.stat.awaitingPayment')}
          hot={campaign.awaitingPaymentCount > 0}
        />
        <Stat
          value={dropValue ? t(dropValue.key, { count: dropValue.count }) : '—'}
          label={t('marketplace.brandHome.campaigns.stat.drop')}
        />
      </Box>
      <Box row align="center" justify="space-between" gap="sm">
        <Box flex={1}>
          {actionLabel ? (
            <Text variant="buttonSmall" color={warning.text} numberOfLines={1}>
              {actionLabel}
            </Text>
          ) : null}
        </Box>
        <Box style={styles.arrow}>
          <Arrow
            size={sizes.icon.sm}
            color={needsAction ? warning.text : colors.interactive.main}
            strokeWidth={iconStroke.regular}
          />
        </Box>
      </Box>
    </Pressable>
  );
};

export const CampaignSeatCard = memo(CampaignSeatCardComponent);
