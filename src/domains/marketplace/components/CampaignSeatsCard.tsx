import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, MoneyText, Text } from '@/shared/ui';
import type { CampaignDetail } from '../types/campaign';
import { SeatPips } from './SeatPips';

export interface CampaignSeatsCardProps {
  campaign: Pick<CampaignDetail, 'seatsTotal' | 'counters' | 'pricing' | 'budgetSecured'>;
  /** Opens the applicants table; omitted when there is nothing to review (a draft). */
  onReview?: () => void;
}

/** The seats as the page's hero number and large circles, then the open applications and the price. */
const CampaignSeatsCardComponent: React.FC<CampaignSeatsCardProps> = ({ campaign, onReview }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { seatsTotal, counters, pricing, budgetSecured } = campaign;
  const price = pricing.seatPrice ?? pricing.bidMax;

  return (
    <Card p="lg" shadow="card">
      <Box gap="lg">
        <Box row align="center" justify="space-between">
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.campaign.detail.seats.title')}
          </Text>
          {budgetSecured ? (
            <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.money.soft}>
              <ShieldCheck size={sizes.icon.xs} color={colors.money.main} strokeWidth={iconStroke.bold} />
              <Text variant="label" color={colors.money.text}>
                {t('marketplace.campaign.list.secured')}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Box row align="baseline" justify="space-between">
          <Box row align="baseline" gap="xs">
            <Text variant="amountHero" color={colors.text.primary}>
              {formatNumber(counters.seatsOccupied)}
            </Text>
            <Text variant="title" color={colors.text.tertiary}>
              {t('marketplace.campaign.detail.seats.of', { total: formatNumber(seatsTotal) })}
            </Text>
          </Box>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.detail.seats.left', { free: formatNumber(Math.max(0, seatsTotal - counters.seatsOccupied)) })}
          </Text>
        </Box>
        <SeatPips total={seatsTotal} filled={counters.seatsOccupied} size="lg" />
        <Box row gap="md">
          <Box flex={1} p="md" gap="xs" borderRadius="lg" bg={colors.interactive.soft}>
            <Text variant="amountTitle" color={colors.interactive.text}>
              {formatNumber(counters.applicationsOpen)}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.campaign.detail.seats.applications')}
            </Text>
          </Box>
          {price ? (
            <Box flex={1} p="md" gap="xs" borderRadius="lg" bg={colors.money.soft}>
              <MoneyText value={price} size="md" tone="money" />
              <Text variant="caption" color={colors.text.secondary}>
                {t(pricing.seatPrice ? 'marketplace.campaign.detail.seats.price' : 'marketplace.campaign.detail.seats.bidMax')}
              </Text>
            </Box>
          ) : null}
        </Box>
        {onReview ? (
          <CustomButton
            title={t('marketplace.campaign.detail.seats.review')}
            variant="secondary"
            size="md"
            fullWidth
            onPress={onReview}
          />
        ) : null}
      </Box>
    </Card>
  );
};

export const CampaignSeatsCard = memo(CampaignSeatsCardComponent);
