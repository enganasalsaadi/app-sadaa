import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PauseCircle, ShieldCheck, Users } from 'lucide-react-native';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, Card, MoneyText, Text } from '@/shared/ui';
import type { Campaign } from '../types';
import { getCampaignStatusMeta } from '../utils/campaignStatus';
import { campaignAttentionKind } from '../utils/campaignList';
import { CampaignCover } from './CampaignCover';
import { CampaignDeadlineChip } from './CampaignDeadlineChip';
import { CampaignGlassPill } from './CampaignGlassPill';
import { CampaignRibbon } from './CampaignRibbon';
import { SeatPips } from './SeatPips';

const COVER_HEIGHT = moderateScale(132);

export interface CampaignCardProps {
  campaign: Campaign;
  onPress: (id: string) => void;
}

/**
 * A running (or in-review) campaign: the cover leads with its status and time left, then the
 * seats as the hero, the applications waiting and the price. A suspension or freed seat adds a
 * ribbon so the brand sees it before opening.
 */
const CampaignCardComponent: React.FC<CampaignCardProps> = ({ campaign, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'card' | 'divider', ViewStyle> => ({
      card: { overflow: 'hidden', padding: 0 },
      divider: { borderTopWidth: borderWidths.thin, borderTopColor: colors.border.default },
    }),
    [colors.border.default],
  );
  const { id, status, pricing, counters, seatsTotal, budgetSecured } = campaign;
  const meta = getCampaignStatusMeta(status.key);
  const attention = campaignAttentionKind(campaign);
  const open = useCallback(() => onPress(id), [id, onPress]);
  const waiting = counters.applicationsOpen;

  return (
    <Card
      onPress={open}
      style={styles.card}
      accessibilityLabel={t('marketplace.campaign.list.cardA11y', { title: campaign.title, status: status.label })}
    >
      <CampaignCover uri={campaign.cover?.url ?? null} height={COVER_HEIGHT}>
        <Box row justify="space-between" align="flex-start" gap="sm">
          <CampaignGlassPill label={status.label} dotColor={resolveHue(colors, meta.tone).main} />
          {status.key === 'open' ? <CampaignDeadlineChip endsAt={campaign.applyDeadlineAt} /> : null}
        </Box>
        <Text variant="h3" color={colors.text.onBrand} numberOfLines={1}>
          {campaign.title}
        </Text>
      </CampaignCover>
      {attention === 'suspended' ? (
        <CampaignRibbon
          tone="warning"
          icon={PauseCircle}
          label={t('marketplace.campaign.list.ribbon.suspended')}
          action={t('marketplace.campaign.list.ribbon.decide')}
        />
      ) : null}
      {attention === 'seat_freed' ? (
        <CampaignRibbon
          tone="interactive"
          icon={Users}
          label={t('marketplace.campaign.list.ribbon.seatFreed')}
          action={t('marketplace.campaign.list.ribbon.decide')}
        />
      ) : null}
      <Box p="lg" gap="md">
        <Box row align="center" justify="space-between" gap="md">
          <Box row align="center" gap="md" flex={1}>
            <SeatPips total={seatsTotal} filled={counters.seatsOccupied} />
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.campaign.list.seats', { filled: counters.seatsOccupied, total: seatsTotal })}
            </Text>
          </Box>
          {waiting > 0 ? (
            <Box px="md" py="xs" borderRadius="full" bg={colors.interactive.soft}>
              <Text variant="label" color={colors.interactive.text}>
                {t('marketplace.campaign.list.applications', { count: waiting })}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Box row align="center" justify="space-between" gap="sm" pt="md" style={styles.divider}>
          {pricing.seatPrice ? (
            <Box row align="baseline" gap="xs">
              <MoneyText value={pricing.seatPrice} size="sm" tone="money" />
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.campaign.list.perSeat')}
              </Text>
            </Box>
          ) : pricing.bidMax ? (
            <Box row align="baseline" gap="xs">
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.campaign.list.upTo')}
              </Text>
              <MoneyText value={pricing.bidMax} size="sm" tone="money" />
            </Box>
          ) : null}
          {budgetSecured ? (
            <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.money.soft}>
              <ShieldCheck size={sizes.icon.xs} color={colors.money.main} strokeWidth={iconStroke.bold} />
              <Text variant="label" color={colors.money.text}>
                {t('marketplace.campaign.list.secured')}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Card>
  );
};

export const CampaignCard = memo(CampaignCardComponent);
