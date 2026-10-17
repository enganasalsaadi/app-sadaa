import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, ChipRow } from '@/shared/ui';
import { CAMPAIGN_PRICING_MODEL } from '../types/campaign';
import type { CampaignPricingModel } from '../types/campaign';
import { OPPORTUNITY_PRICING_LABEL } from '../constants/opportunities';

export interface OpportunityFilterChipsProps {
  /** «Campaign type», or the chosen type (with «+2» for more). */
  activityLabel: string;
  activitySelected: boolean;
  pricingModel: CampaignPricingModel | null;
  onOpenSheet: () => void;
  /** Receives a pricing model's value; the chosen one again clears it. */
  onPricing: (value: string) => void;
}

/** The feed's quick filters under the header: the type picker (opens the sheet) and the two pricing models. */
const OpportunityFilterChipsComponent: React.FC<OpportunityFilterChipsProps> = ({
  activityLabel,
  activitySelected,
  pricingModel,
  onOpenSheet,
  onPricing,
}) => {
  const { t } = useTranslation();
  return (
    <ChipRow accessibilityLabel={t('marketplace.campaign.feed.filters.title')}>
      <Chip label={activityLabel} value="activity" selected={activitySelected} dropdown onSelect={onOpenSheet} />
      {CAMPAIGN_PRICING_MODEL.map(model => (
        <Chip
          key={model}
          label={t(OPPORTUNITY_PRICING_LABEL[model])}
          value={model}
          selected={pricingModel === model}
          onSelect={onPricing}
        />
      ))}
    </ChipRow>
  );
};

export const OpportunityFilterChips = memo(OpportunityFilterChipsComponent);
