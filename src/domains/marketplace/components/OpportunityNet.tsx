import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import type { NetHeadline } from '../utils/opportunities';

export interface OpportunityNetProps {
  headline: NetHeadline;
  /** A bid shows the span of nets its ends could land in. */
  bidding: boolean;
}

/** The creator's take-home as the card's big number (the server's `net`, never the gross): one figure, or «min – max» for a bid. */
const OpportunityNetComponent: React.FC<OpportunityNetProps> = ({ headline, bidding }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="xs">
      <Text variant="caption" color={colors.text.secondary}>
        {t(bidding ? 'marketplace.campaign.feed.card.netBidding' : 'marketplace.campaign.feed.card.netFixed')}
      </Text>
      {headline.kind === 'fixed' ? (
        <MoneyText value={headline.net} size="lg" tone="money" />
      ) : (
        <Box row align="baseline" gap="xs">
          <MoneyText value={headline.min} size="title" tone="money" />
          <Text variant="bodyMedium" color={colors.text.tertiary}>
            –
          </Text>
          <MoneyText value={headline.max} size="title" tone="money" />
        </Box>
      )}
    </Box>
  );
};

export const OpportunityNet = memo(OpportunityNetComponent);
