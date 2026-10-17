import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_OPPORTUNITY_FILTERS } from '../constants/opportunities';
import type { CampaignActivityType, CampaignPricingModel, CreatorFeedArgs } from '../types/campaign';
import { toFeedArgs } from '../utils/opportunities';

/**
 * The filter sheet's working copy: it starts from the applied filters each time the sheet opens and
 * reaches the feed only on «Show results»; «Reset» clears the copy, not the feed.
 */
export const useOpportunityFilterDraft = (filters: CreatorFeedArgs, visible: boolean) => {
  const [draft, setDraft] = useState<CreatorFeedArgs>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  const setActivityTypes = useCallback((value: CampaignActivityType[]) => {
    setDraft(prev => ({ ...prev, activityTypes: value }));
  }, []);
  // Tapping the chosen pricing chip again clears it («all»).
  const togglePricing = useCallback((value: CampaignPricingModel) => {
    setDraft(prev => ({ ...prev, pricingModel: prev.pricingModel === value ? null : value }));
  }, []);
  const reset = useCallback(() => setDraft(DEFAULT_OPPORTUNITY_FILTERS), []);

  return { draft: toFeedArgs(draft), setActivityTypes, togglePricing, reset };
};
