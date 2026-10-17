import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, StatusPill, Text } from '@/shared/ui';
import type { BrandActiveCampaign } from '../../../types';
import { campaignDropLeft, campaignSeatSplit } from '../../../utils/campaignHome';
import { getCampaignStatusMeta } from '../../../utils/campaignStatus';
import type { CampaignTimeLeft } from '../../../utils/campaignList';
import { CampaignSeatStrip } from './CampaignSeatStrip';

export const CAMPAIGN_CARD_WIDTH = moderateScale(292);

interface CampaignSeatCardProps {
  campaign: BrandActiveCampaign;
  now: number;
  onOpen: (campaign: BrandActiveCampaign) => void;
}

/** The biggest unit of the time left, short enough for a stat cell. */
const dropValueKey = (left: CampaignTimeLeft) => {
  switch (left.unit) {
    case 'days':
      return { key: 'marketplace.campaign.list.left.days', values: { days: left.days, hours: left.hours } } as const;
    case 'hours':
      return { key: 'marketplace.campaign.list.left.hours', values: { hours: left.hours, minutes: left.minutes } } as const;
    case 'minutes':
      return { key: 'marketplace.campaign.list.left.minutes', values: { minutes: left.minutes } } as const;
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
  divider?: boolean;
}

const Stat = memo<StatProps>(({ value, label, hot = false, divider = false }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'cell', ViewStyle> => ({
      cell: { borderStartWidth: divider ? borderWidths.thin : 0, borderStartColor: colors.border.default },
    }),
    [colors.border.default, divider],
  );
  return (
    <Box flex={1} align="center" py="md" px="xs" style={styles.cell}>
      <Text variant="amountTitle" color={hot ? colors.status.warning.text : colors.text.primary} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
});

/**
 * One active campaign as a seat strip over three numbers and a decision bar. A campaign that needs
 * the brand wears an amber ring and the server's own words on its bar; a calm one just opens.
 */
const CampaignSeatCardComponent: React.FC<CampaignSeatCardProps> = ({ campaign, now, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const warning = resolveHue(colors, 'warning');
  const money = resolveHue(colors, 'money');
  const statusTone = getCampaignStatusMeta(campaign.status.key).tone;
  const { needsAction, action, seats, budgetSecured } = campaign;
  const styles = useStyles(
    ({ borderWidths }): Record<'card' | 'divider', ViewStyle> => ({
      card: {
        overflow: 'hidden',
        borderWidth: needsAction ? borderWidths.md : borderWidths.thin,
        borderColor: needsAction ? warning.main : colors.border.default,
      },
      divider: { borderTopWidth: borderWidths.thin, borderTopColor: colors.border.default },
    }),
    [colors.border.default, needsAction, warning.main],
  );
  const open = useCallback(() => onOpen(campaign), [campaign, onOpen]);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const barLabel = needsAction && action ? action.label : t('marketplace.brandHome.campaigns.open');
  const dropLeft = campaignDropLeft(campaign, now);
  const dropValue = dropLeft ? dropValueKey(dropLeft) : null;
  const barInk = needsAction ? warning.text : colors.text.secondary;
  const Shield = budgetSecured ? ShieldCheck : ShieldAlert;
  const shieldHue = budgetSecured ? money : warning;

  return (
    <Pressable
      width={CAMPAIGN_CARD_WIDTH}
      bg={colors.surface.main}
      borderRadius="xl"
      style={styles.card}
      onPress={open}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.brandHome.campaigns.cardA11y', {
        title: campaign.title,
        status: campaign.status.label,
        free: seats.free,
        total: seats.total,
      })}
      accessibilityHint={barLabel}
    >
      <Box p="lg" gap="md">
        <Box row align="center" justify="space-between" gap="sm">
          <StatusPill label={campaign.status.label} tone={statusTone} size="sm" />
          <Box row align="center" gap="xs" flex={1} justify="flex-end">
            <Shield size={sizes.icon.xs} color={shieldHue.main} strokeWidth={iconStroke.bold} />
            <Text variant="caption" color={shieldHue.text} numberOfLines={1}>
              {budgetSecured
                ? t('marketplace.campaign.list.secured')
                : t('marketplace.brandHome.campaigns.unsecured')}
            </Text>
          </Box>
        </Box>
        <Text variant="h4" numberOfLines={2}>
          {campaign.title}
        </Text>
        <Box gap="sm">
          <CampaignSeatStrip seats={campaignSeatSplit(campaign)} />
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.brandHome.campaigns.seatsLeft', {
              free: formatNumber(seats.free),
              total: formatNumber(seats.total),
            })}
          </Text>
        </Box>
      </Box>
      <Box row style={styles.divider}>
        <Stat
          value={formatNumber(campaign.applicationsOpen)}
          label={t('marketplace.brandHome.campaigns.stat.applications')}
          hot={needsAction && action?.key === 'review_applicants'}
        />
        <Stat
          value={formatNumber(campaign.awaitingPaymentCount)}
          label={t('marketplace.brandHome.campaigns.stat.awaitingPayment')}
          hot={campaign.awaitingPaymentCount > 0}
          divider
        />
        <Stat
          value={dropValue ? t(dropValue.key, dropValue.values) : '—'}
          label={t('marketplace.brandHome.campaigns.stat.drop')}
          divider
        />
      </Box>
      <Box
        row
        align="center"
        justify="space-between"
        gap="sm"
        px="lg"
        py="md"
        bg={needsAction ? warning.soft : colors.surface.elevated}
      >
        <Text variant="buttonSmall" color={barInk} numberOfLines={1}>
          {barLabel}
        </Text>
        <Arrow size={sizes.icon.sm} color={barInk} strokeWidth={iconStroke.bold} />
      </Box>
    </Pressable>
  );
};

export const CampaignSeatCard = memo(CampaignSeatCardComponent);
