import { useTranslation } from 'react-i18next';
import type { Timestamp } from '../types';
import { campaignTimeLeft } from '../utils/campaignList';
import { useClock } from './useClock';

/** «5 days left» for the apply deadline, ticking each minute on its own; `null` without one or once it has passed. */
export const useCampaignTimeLeft = (endsAt: Timestamp | null): string | null => {
  const { t } = useTranslation();
  const now = useClock(60_000);
  const left = campaignTimeLeft(endsAt, now);
  if (!left) return null;

  switch (left.unit) {
    case 'days':
      return t('marketplace.campaign.list.timeLeft.days', { count: left.days });
    case 'hours':
      return t('marketplace.campaign.list.timeLeft.hours', { count: left.hours });
    case 'minutes':
      return t('marketplace.campaign.list.timeLeft.minutes', { count: left.minutes });
    default: {
      const _exhaustive: never = left;
      return _exhaustive;
    }
  }
};
