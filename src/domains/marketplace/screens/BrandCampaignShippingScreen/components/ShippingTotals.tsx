import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignShippingTotals } from '../../../types/campaignShipping';

const CELLS = [
  { key: 'awaiting', label: 'marketplace.campaign.shipping.totals.awaiting', tone: null },
  { key: 'ready', label: 'marketplace.campaign.shipping.totals.ready', tone: 'success' },
  { key: 'blocked', label: 'marketplace.campaign.shipping.totals.blocked', tone: 'warning' },
  { key: 'shipped', label: 'marketplace.campaign.shipping.totals.shipped', tone: null },
] as const satisfies readonly { key: keyof CampaignShippingTotals; label: ParseKeys; tone: 'success' | 'warning' | null }[];

export interface ShippingTotalsProps {
  totals: CampaignShippingTotals;
}

/** Four counts in one sunken strip; the ready one stands up on a white tile, it is the batch you can send. */
const ShippingTotalsComponent: React.FC<ShippingTotalsProps> = ({ totals }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box row p="xs" borderRadius="lg" bg={colors.surface.elevated}>
      {CELLS.map(cell => {
        const count = formatNumber(totals[cell.key]);
        const label = t(cell.label);
        return (
          <Box
            key={cell.key}
            flex={1}
            align="center"
            py="sm"
            borderRadius="md"
            bg={cell.key === 'ready' ? colors.surface.main : undefined}
            accessible
            accessibilityLabel={`${label} ${count}`}
          >
            <Text variant="h3" color={cell.tone ? colors.status[cell.tone].text : colors.text.primary}>
              {count}
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export const ShippingTotals = memo(ShippingTotalsComponent);
