import React, { memo } from 'react';
import type { DealCancelModel } from '../hooks/useDealCancel';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { Deal, DealRole } from '../types';
import { DealCancelSheet } from './DealCancelSheet';
import { DealUpsellSheets } from './DealUpsellSheets';
import { DealWithdrawSheet } from './DealWithdrawSheet';

export interface DealChangesSheetsProps {
  deal: Deal;
  role: DealRole;
  cancel: DealCancelModel;
  upsells: DealUpsellsModel;
}

/** Every P8 sheet for the deal page: the role's way out and the addendum sheets. */
const DealChangesSheetsComponent: React.FC<DealChangesSheetsProps> = ({ deal, role, cancel, upsells }) => (
  <>
    {role === 'brand' ? (
      <DealCancelSheet cancel={cancel} deal={deal} />
    ) : (
      <DealWithdrawSheet cancel={cancel} deal={deal} />
    )}
    <DealUpsellSheets deal={deal} upsells={upsells} />
  </>
);

export const DealChangesSheets = memo(DealChangesSheetsComponent);
