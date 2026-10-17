import { useState } from 'react';
import type { CampaignScope } from '../../../components/CampaignScopeSwitch';
import { useCampaignsEnabled } from '../../../hooks/useCampaignsEnabled';

/** Which face of the brand's tab root is up. Campaigns lead; without them (flag off or not known yet) it is the deals board alone. */
export const useBrandDealsRoot = () => {
  const [scope, setScope] = useState<CampaignScope>('campaigns');
  const campaignsEnabled = useCampaignsEnabled('brand') === true;
  return { scope: campaignsEnabled ? scope : 'deals', setScope, campaignsEnabled };
};
