import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Timeline } from '@/shared/ui';
import type { TimelineStep, TimelineVariant } from '@/shared/ui';
import { DEAL_PHASE_LABEL } from '../constants';
import { buildDealProgress } from '../utils';
import type { DealProgressInput } from '../utils';

export interface DealProgressProps extends DealProgressInput {
  /** `vertical` (deal detail) · `track`: one row of one-word phases (cards). */
  variant?: TimelineVariant;
}

/** The deal journey as a `Timeline`. Stopped deals render nothing: the screen shows the outcome. */
const DealProgressComponent: React.FC<DealProgressProps> = ({
  status,
  stage,
  hasShipping,
  frozenFrom,
  variant = 'vertical',
}) => {
  const { t } = useTranslation();

  const steps = useMemo<TimelineStep[]>(
    () =>
      buildDealProgress({ status, stage, hasShipping, frozenFrom }).map(step => ({
        key: step.phase,
        title: t(DEAL_PHASE_LABEL[step.phase]),
        state: step.state,
      })),
    [status, stage, hasShipping, frozenFrom, t],
  );

  if (steps.length === 0) return null;
  return <Timeline steps={steps} variant={variant} />;
};

export const DealProgress = memo(DealProgressComponent);
