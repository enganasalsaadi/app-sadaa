import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@/shared/ui';
import type { CreatorDealSummary } from '../../../types';
import { CountChip } from './CountChip';

interface DealCountChipsProps {
  counts: CreatorDealSummary['counts'];
  onOpenDeals: () => void;
  onOpenStrikes: () => void;
}

/** What else needs a look, one chip each and only when above 0: new offers, upsells waiting, live strikes. */
const DealCountChipsComponent: React.FC<DealCountChipsProps> = ({ counts, onOpenDeals, onOpenStrikes }) => {
  const { t } = useTranslation();
  const { newOffers, pendingUpsells, liveStrikes } = counts;
  if (newOffers + pendingUpsells + liveStrikes === 0) return null;

  return (
    <Box row wrap gap="sm" px="xl">
      {newOffers > 0 ? (
        <CountChip
          count={newOffers}
          label={t('marketplace.creatorHome.deals.chips.newOffers', { count: newOffers })}
          tone="info"
          onPress={onOpenDeals}
        />
      ) : null}
      {pendingUpsells > 0 ? (
        <CountChip
          count={pendingUpsells}
          label={t('marketplace.creatorHome.deals.chips.pendingUpsells', { count: pendingUpsells })}
          tone="warning"
          onPress={onOpenDeals}
        />
      ) : null}
      {liveStrikes > 0 ? (
        <CountChip
          count={liveStrikes}
          label={t('marketplace.creatorHome.deals.chips.liveStrikes', { count: liveStrikes })}
          tone="danger"
          onPress={onOpenStrikes}
        />
      ) : null}
    </Box>
  );
};

export const DealCountChips = memo(DealCountChipsComponent);
