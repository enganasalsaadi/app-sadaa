import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import type { Deal } from '../types';
import { dealDropView, type DealDropView } from '../utils/dealDrop';
import { formatRemaining, timerSecondsLeft } from '../utils/dealTimer';
import { useClock } from './useClock';

const MINUTE_MS = 60_000;
const DROP_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export interface DealDropModel {
  view: DealDropView;
  /** «41 ساعة» until the next moment (live link, then the drop); `null` once the drop has passed. */
  remaining: string | null;
  /** The drop's date and time, in the viewer's language. */
  when: string;
}

/**
 * The synchronized drop of a linked deal (PC6.3), ticking once a minute: which moment is next, how
 * long until it, and whether the creator is behind. `null` for a deal without a drop.
 */
export const useDealDrop = (deal: Deal | null): DealDropModel | null => {
  const { t, i18n } = useTranslation();
  const now = useClock(MINUTE_MS);
  return useMemo(() => {
    const view = deal ? dealDropView(deal, now) : null;
    if (!view) return null;
    return {
      view,
      remaining: view.nextAt === null ? null : formatRemaining(t, timerSecondsLeft(view.nextAt, now)),
      when: formatDate(view.dropAt, DROP_FORMAT, i18n.language),
    };
  }, [deal, i18n.language, now, t]);
};
