import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  KeyValueRow,
  MoneyText,
  ProgressBar,
  Text,
} from '@/shared/ui';
import type { CreatorCampaignPricing } from '../types/campaign';
import { netHeadline, netShare } from '../utils/opportunities';

const BPS_PER_PERCENT = 100;

export interface CreatorNetCardProps {
  pricing: CreatorCampaignPricing;
}

/**
 * The page's first card (PC4.0): what the creator takes home as the big number (the server's `net`),
 * and under it where the rest goes. A fixed price shows the split bar, the campaign price and Sada's
 * cut; a bid shows the span of nets and the two ends (the max is binding, the other only a hint).
 */
const CreatorNetCardComponent: React.FC<CreatorNetCardProps> = ({
  pricing,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const headline = netHeadline(pricing);
  const share = netShare(pricing);
  const percent = formatNumber(pricing.feeBps / BPS_PER_PERCENT);
  const { fixed, bid } = pricing;

  return (
    <Card p="lg" shadow="card">
      <Box gap="md">
        <Box row align="center" justify="space-between" gap="md">
          <Text variant="caption" color={colors.text.secondary}>
            {t(
              bid
                ? 'marketplace.campaign.opportunity.net.bidding'
                : 'marketplace.campaign.opportunity.net.fixed',
            )}
          </Text>
          <Box px="md" py="xs" borderRadius="full" bg={colors.surface.elevated}>
            <Text variant="label" color={colors.text.secondary}>
              {pricing.model.label}
            </Text>
          </Box>
        </Box>
        {headline?.kind === 'fixed' ? (
          <MoneyText value={headline.net} size="hero" tone="money" />
        ) : null}
        {headline?.kind === 'range' ? (
          <Box row align="baseline" gap="sm" wrap>
            <MoneyText value={headline.min} size="lg" tone="money" />
            <Text variant="title" color={colors.text.tertiary}>
              –
            </Text>
            <MoneyText value={headline.max} size="lg" tone="money" />
          </Box>
        ) : null}
        {share !== null ? (
          <ProgressBar
            value={share}
            tone="money"
            accessibilityLabel={t(
              'marketplace.campaign.opportunity.net.share',
              { percent: formatNumber(Math.round(share * 100)) },
            )}
          />
        ) : null}
        {fixed ? (
          <Box>
            <KeyValueRow
              label={t('marketplace.campaign.opportunity.net.campaignPrice')}
              value={<MoneyText value={fixed.gross} size="sm" />}
            />
            <KeyValueRow
              label={t('marketplace.campaign.opportunity.net.fee', { percent })}
              value={<MoneyText value={fixed.fee} size="sm" />}
            />
          </Box>
        ) : null}
        {bid ? (
          <Box gap="xs">
            <KeyValueRow
              label={t('marketplace.campaign.opportunity.net.suggested')}
              value={<MoneyText value={bid.min.gross} size="sm" />}
            />
            <KeyValueRow
              label={t('marketplace.campaign.opportunity.net.cap')}
              value={<MoneyText value={bid.max.gross} size="sm" />}
            />
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.campaign.opportunity.net.bidNote', { percent })}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const CreatorNetCard = memo(CreatorNetCardComponent);
