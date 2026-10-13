import React, { memo } from 'react';
import { StatusPill } from '@/shared/ui';
import type { StatusPillSize } from '@/shared/ui';
import { DEAL_STATUS_ICON, UNKNOWN_DEAL_STATUS_ICON } from '../constants';
import type { DealStatus, Labeled } from '../types';
import { getDealStatusMeta } from '../utils';

export interface DealStatusPillProps {
  /** Server status; the label is already localized. Unknown `key` → neutral fallback (rule 06). */
  status: Labeled<DealStatus>;
  size?: StatusPillSize;
}

const DealStatusPillComponent: React.FC<DealStatusPillProps> = ({ status, size }) => (
  <StatusPill
    label={status.label}
    tone={getDealStatusMeta(status.key).tone}
    icon={status.key === null ? UNKNOWN_DEAL_STATUS_ICON : DEAL_STATUS_ICON[status.key]}
    size={size}
  />
);

export const DealStatusPill = memo(DealStatusPillComponent);
