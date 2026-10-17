import React, { memo } from 'react';
import { CampaignScopeSwitch } from '../../components/CampaignScopeSwitch';
import { BrandCampaignsScreen } from '../BrandCampaignsScreen';
import { BrandDealsBoard } from './components/BrandDealsBoard';
import { useBrandDealsRoot } from './hooks/useBrandDealsRoot';

/**
 * Brand `DealsTab` root: «My campaigns» and «My deals» as two faces under one switching title.
 * With Public Campaigns off it is the deal board, as before.
 */
const BrandDealsScreenComponent: React.FC = () => {
  const { scope, setScope, campaignsEnabled } = useBrandDealsRoot();
  if (campaignsEnabled && scope === 'campaigns') {
    return <BrandCampaignsScreen scope={scope} onScope={setScope} />;
  }
  return (
    <BrandDealsBoard
      titleSlot={campaignsEnabled ? <CampaignScopeSwitch scope={scope} onScope={setScope} /> : undefined}
    />
  );
};

export const BrandDealsScreen = memo(BrandDealsScreenComponent);
