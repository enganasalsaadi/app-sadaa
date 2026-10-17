import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import type { Timestamp } from '../types';
import { useClock } from '../hooks/useClock';
import { applicantExpiry } from '../utils/applicants';
import { CampaignGlassPill } from './CampaignGlassPill';

export interface ApplicantExpiryChipProps {
  expiresAt: Timestamp;
}

/** The 72 h window left to decide, laid over the photo; warm in the last hours, ticks each minute on its own. */
const ApplicantExpiryChipComponent: React.FC<ApplicantExpiryChipProps> = ({ expiresAt }) => {
  const { t } = useTranslation();
  const now = useClock(60_000);
  const { remaining, urgent } = applicantExpiry(expiresAt, now);
  if (!remaining) {
    return <CampaignGlassPill label={t('marketplace.campaign.applicants.card.expired')} icon={Clock} urgent />;
  }
  const time =
    remaining.unit === 'days'
      ? t('marketplace.campaign.list.left.days', { days: formatNumber(remaining.days), hours: formatNumber(remaining.hours) })
      : remaining.unit === 'hours'
        ? t('marketplace.campaign.list.left.hours', {
            hours: formatNumber(remaining.hours),
            minutes: formatNumber(remaining.minutes),
          })
        : t('marketplace.campaign.list.left.minutes', { minutes: formatNumber(remaining.minutes) });
  return <CampaignGlassPill label={t('marketplace.campaign.applicants.card.expiresIn', { time })} icon={Clock} urgent={urgent} />;
};

export const ApplicantExpiryChip = memo(ApplicantExpiryChipComponent);
