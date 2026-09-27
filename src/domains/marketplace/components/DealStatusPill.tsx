import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusPill } from '@/shared/ui';
import type { StatusPillSize } from '@/shared/ui';
import { DEAL_STATUS_ICON, UNKNOWN_DEAL_STATUS_ICON } from '../constants';
import type { DealStatus } from '../types';
import { getDealStatusMeta } from '../utils';

export interface DealStatusPillProps {
  /** `null` = unknown to this build; renders a neutral fallback instead of crashing (rule 06). */
  status: DealStatus | null;
  size?: StatusPillSize;
}

const DealStatusPillComponent: React.FC<DealStatusPillProps> = ({ status, size }) => {
  const { t } = useTranslation();
  const meta = getDealStatusMeta(status);

  return (
    <StatusPill
      label={t(meta.labelKey)}
      tone={meta.tone}
      icon={status === null ? UNKNOWN_DEAL_STATUS_ICON : DEAL_STATUS_ICON[status]}
      size={size}
    />
  );
};

export const DealStatusPill = memo(DealStatusPillComponent);
