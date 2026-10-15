import React, { memo } from 'react';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { Deal, DealRole } from '../types';
import { DealUpsellPaper } from './DealUpsellPaper';
import { DealUpsellPending } from './DealUpsellPending';

export interface DealUpsellSectionProps {
  deal: Deal;
  role: DealRole;
  upsells: DealUpsellsModel;
}

/** The addendum waiting for an answer, near the top of the page: the creator signs it, the brand watches it. */
const DealUpsellSectionComponent: React.FC<DealUpsellSectionProps> = ({ deal, role, upsells }) => {
  const { pending } = upsells;
  if (!pending) return null;
  return role === 'creator' ? (
    <DealUpsellPaper deal={deal} upsell={pending} upsells={upsells} />
  ) : (
    <DealUpsellPending deal={deal} upsell={pending} upsells={upsells} />
  );
};

export const DealUpsellSection = memo(DealUpsellSectionComponent);
