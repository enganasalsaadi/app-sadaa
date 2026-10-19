import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PauseCircle, ShieldCheck, Users } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box, Card, MoneyText, StatusPill, Text, Timeline, type TimelineStep } from '@/shared/ui';
import { CAMPAIGN_STATIONS, CAMPAIGN_STATION_LABEL } from '../constants/campaignStatus';
import type { Campaign } from '../types';
import { campaignAttentionKind } from '../utils/campaignList';
import { getCampaignStatusMeta } from '../utils/campaignStatus';
import { CampaignCaption } from './CampaignCaption';
import { CampaignRibbon } from './CampaignRibbon';
import { OpportunityDeliverables } from './OpportunityDeliverables';
import { SeatPips } from './SeatPips';

/** Campaign prices are USD: a whole-dollar price reads «$100», not «$100.00». */
const USD_MINOR_UNITS = 100;
const priceDigits = (price: Money) => (price.amount % USD_MINOR_UNITS === 0 ? 0 : undefined);

export interface CampaignCardProps {
  campaign: Campaign;
  onPress: (id: string) => void;
}

/**
 * A campaign in review or running, on the same card the deal board uses: title and status, what
 * it is for (activity · city, seats as dots), what is asked of each creator, then the stations it
 * passes (reviewed → applications → seats → running → done) with a line saying what the current
 * one means. A suspension or freed seat adds a strip so the brand sees it before opening.
 */
const CampaignCardComponent: React.FC<CampaignCardProps> = ({ campaign, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'divider', ViewStyle> => ({
      divider: { borderTopWidth: borderWidths.thin, borderTopColor: colors.border.default },
    }),
    [colors.border.default],
  );
  const { id, status, pricing, counters, seatsTotal, budgetSecured } = campaign;
  const meta = getCampaignStatusMeta(status.key);
  const attention = campaignAttentionKind(campaign);
  const open = useCallback(() => onPress(id), [id, onPress]);
  const waiting = counters.applicationsOpen;
  const price = pricing.seatPrice;
  const hasFooter = price !== null || pricing.bidMax !== null || budgetSecured;
  const where = [campaign.activityType?.label, campaign.targeting.cities[0]].filter(Boolean).join(' · ');
  const seatsShown = meta.tab === 'live' && seatsTotal > 0;

  const steps: TimelineStep[] = useMemo(() => {
    const current = meta.station;
    if (current === null) return [];
    return CAMPAIGN_STATIONS.map((station, index) => ({
      key: station,
      title: t(CAMPAIGN_STATION_LABEL[station]),
      state: index < current ? 'done' : index === current ? 'current' : 'upcoming',
    }));
  }, [meta.station, t]);

  return (
    <Card
      onPress={open}
      p="lg"
      accessibilityLabel={t('marketplace.campaign.list.cardA11y', { title: campaign.title, status: status.label })}
    >
      <Box gap="md">
        <Box row align="flex-start" justify="space-between" gap="md">
          <Box flex={1}>
            <Text variant="title" color={colors.text.primary} numberOfLines={2}>
              {campaign.title}
            </Text>
          </Box>
          <StatusPill label={status.label} tone={meta.tone} size="sm" />
        </Box>
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
        {where || seatsShown ? (
          <Box row align="center" justify="space-between" gap="md">
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
                {where}
              </Text>
            </Box>
            {seatsShown ? (
              <Box row align="center" gap="sm">
                <SeatPips total={seatsTotal} filled={counters.seatsOccupied} size="dot" />
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.campaign.list.seatsFilled', { filled: counters.seatsOccupied, total: seatsTotal })}
                </Text>
              </Box>
            ) : null}
          </Box>
        ) : null}
        <OpportunityDeliverables campaign={campaign} />
        {steps.length > 0 ? <Timeline variant="track" steps={steps} /> : null}
        <CampaignCaption campaign={campaign} />
        {hasFooter || waiting > 0 ? (
          <Box row align="center" justify="space-between" gap="sm" pt="md" style={styles.divider}>
            {price ? (
              <Box row align="baseline" gap="xs">
                <MoneyText value={price} size="md" tone="money" precision={priceDigits(price)} />
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.campaign.list.perCreator')}
                </Text>
              </Box>
            ) : pricing.bidMax ? (
              <Box row align="baseline" gap="xs">
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.campaign.list.upTo')}
                </Text>
                <MoneyText value={pricing.bidMax} size="md" tone="money" precision={priceDigits(pricing.bidMax)} />
              </Box>
            ) : (
              <Box />
            )}
            <Box row align="center" gap="sm">
              {waiting > 0 ? (
                <Box px="md" py="xs" borderRadius="full" bg={colors.status.warning.soft}>
                  <Text variant="label" color={colors.status.warning.text}>
                    {t('marketplace.campaign.list.applications', { count: waiting })}
                  </Text>
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
        ) : null}
      </Box>
    </Card>
  );
};

export const CampaignCard = memo(CampaignCardComponent);
