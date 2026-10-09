import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { Timeline } from '@/shared/ui';
import type { TimelineStep, TimelineVariant } from '@/shared/ui';
import type { DealStatus } from '../types';
import { buildDealProgress, getDealStatusMeta } from '../utils';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

export interface DealProgressProps {
  status: DealStatus | null;
  /** Off-path deals only: the last pipeline stage reached before the dispute / cancel / refund. */
  stoppedAt?: DealStatus;
  /** When each stage was reached (epoch ms, from the server's status history). */
  reachedAt?: Partial<Record<DealStatus, number>>;
  /** `vertical` (deal detail, with dates) · `track`: one row of one-word stages (cards). */
  variant?: TimelineVariant;
}

/** Deal pipeline as a `Timeline`: vertical on the deal detail screen, a stage track on cards. */
const DealProgressComponent: React.FC<DealProgressProps> = ({
  status,
  stoppedAt,
  reachedAt,
  variant = 'vertical',
}) => {
  const track = variant === 'track';
  const { t, i18n } = useTranslation();

  const steps = useMemo<TimelineStep[]>(
    () =>
      buildDealProgress(status, stoppedAt).map(step => {
        const at = reachedAt?.[step.status];
        const meta = getDealStatusMeta(step.status);
        return {
          key: step.status,
          title: t(track ? meta.stageKey : meta.labelKey),
          caption: at === undefined || track ? undefined : formatDate(at, DATE_FORMAT, i18n.language),
          state: step.state,
        };
      }),
    [status, stoppedAt, reachedAt, track, t, i18n.language],
  );

  return <Timeline steps={steps} variant={variant} />;
};

export const DealProgress = memo(DealProgressComponent);
