import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { Timeline } from '@/shared/ui';
import type { TimelineStep } from '@/shared/ui';
import type { DealStatus } from '../types';
import { buildDealProgress, getDealStatusMeta } from '../utils';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

export interface DealProgressProps {
  status: DealStatus | null;
  /** Off-path deals only: the last pipeline stage reached before the dispute / cancel / refund. */
  stoppedAt?: DealStatus;
  /** When each stage was reached (epoch ms, from the server's status history). */
  reachedAt?: Partial<Record<DealStatus, number>>;
}

/** Deal pipeline as a `Timeline` (deal detail screen). */
const DealProgressComponent: React.FC<DealProgressProps> = ({ status, stoppedAt, reachedAt }) => {
  const { t, i18n } = useTranslation();

  const steps = useMemo<TimelineStep[]>(
    () =>
      buildDealProgress(status, stoppedAt).map(step => {
        const at = reachedAt?.[step.status];
        return {
          key: step.status,
          title: t(getDealStatusMeta(step.status).labelKey),
          caption: at === undefined ? undefined : formatDate(at, DATE_FORMAT, i18n.language),
          state: step.state,
        };
      }),
    [status, stoppedAt, reachedAt, t, i18n.language],
  );

  return <Timeline steps={steps} />;
};

export const DealProgress = memo(DealProgressComponent);
