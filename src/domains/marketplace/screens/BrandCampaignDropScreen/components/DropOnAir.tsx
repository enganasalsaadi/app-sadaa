import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import { CampaignRing } from '../../../components/CampaignRing';
import type { CampaignDropTotals } from '../../../types/campaignDrop';
import type { Timestamp } from '../../../types';
import { campaignDropVerifiedShare, secondsBetween } from '../../../utils/campaignDrop';
import { formatRemaining } from '../../../utils/dealTimer';

export interface DropOnAirProps {
  totals: CampaignDropTotals;
  dropAt: Timestamp;
  now: number;
}

/** After the drop the clock gives way to the ring: it fills as creators get verified live. */
const DropOnAirComponent: React.FC<DropOnAirProps> = ({ totals, dropAt, now }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { linked, verified, late } = totals;
  const since = secondsBetween(dropAt, now);
  const ringLabel = t('marketplace.campaign.drop.hero.ringLabel', {
    verified: formatNumber(verified),
    total: formatNumber(linked),
  });

  return (
    <Box row align="center" gap="lg">
      <CampaignRing
        progress={campaignDropVerifiedShare(totals)}
        color={colors.glass.iconMoney}
        trackColor={colors.glass.progressTrack}
        size={104}
        strokeWidth={10}
        accessibilityLabel={ringLabel}
      >
        <Box align="center">
          <Text variant="amountTitle" color={colors.text.onBrand} writingDirection="ltr">
            {`${formatNumber(verified)}/${formatNumber(linked)}`}
          </Text>
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.campaign.drop.hero.verifiedCaption')}
          </Text>
        </Box>
      </CampaignRing>
      <Box flex={1} gap="xs">
        <Box row align="center" gap="sm">
          <LiveDot color={colors.glass.iconWarning} />
          <Text variant="title" color={colors.text.onBrand}>
            {t('marketplace.campaign.drop.hero.onAir')}
          </Text>
        </Box>
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('marketplace.campaign.drop.hero.sinceDrop', { ago: formatRemaining(t, since) })}
        </Text>
        {late > 0 ? (
          <Text variant="bodySmall" color={colors.text.onBrand}>
            {t('marketplace.campaign.drop.hero.lateNote', { count: late })}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export const DropOnAir = memo(DropOnAirComponent);
