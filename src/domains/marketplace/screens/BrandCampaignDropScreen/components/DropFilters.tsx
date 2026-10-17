import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { formatNumber } from '@/core/i18n';
import { Chip, Rail } from '@/shared/ui';
import type { CampaignDropFilter, CampaignDropChip } from '../../../utils/campaignDrop';

const FILTER_LABEL = {
  all: 'marketplace.campaign.drop.filters.all',
  late: 'marketplace.campaign.drop.filters.late',
  working: 'marketplace.campaign.drop.filters.working',
  in_review: 'marketplace.campaign.drop.filters.in_review',
  verified: 'marketplace.campaign.drop.filters.verified',
  awaiting_payment: 'marketplace.campaign.drop.filters.awaiting_payment',
  defaulted: 'marketplace.campaign.drop.filters.defaulted',
  ended: 'marketplace.campaign.drop.filters.ended',
} as const satisfies Record<CampaignDropFilter, ParseKeys>;

export interface DropFiltersProps {
  chips: readonly CampaignDropChip[];
  selected: CampaignDropFilter;
  /** One stable handler for every chip. */
  onSelect: (value: string) => void;
}

/** «All» and the states that have creators, counted from the server's totals; they filter the rows here. */
const DropFiltersComponent: React.FC<DropFiltersProps> = ({ chips, selected, onSelect }) => {
  const { t } = useTranslation();
  return (
    <Rail bleed gap="sm" gutter="xl">
      {chips.map(chip => (
        <Chip
          key={chip.key}
          value={chip.key}
          label={`${t(FILTER_LABEL[chip.key])} ${formatNumber(chip.count)}`}
          selected={selected === chip.key}
          onSelect={onSelect}
        />
      ))}
    </Rail>
  );
};

export const DropFilters = memo(DropFiltersComponent);
