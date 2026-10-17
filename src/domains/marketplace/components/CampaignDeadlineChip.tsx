import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import type { Timestamp } from '../types';
import { useClock } from '../hooks/useClock';
import { campaignTimeLeft } from '../utils/campaignList';
import { CampaignGlassPill } from './CampaignGlassPill';

export interface CampaignDeadlineChipProps {
  /** The apply deadline; nothing renders without one or once it has passed. */
  endsAt: Timestamp | null;
}

/** «5d 4h» left to recruit, on the cover; ticks each minute on its own (a list cell won't re-render from its parent). */
const CampaignDeadlineChipComponent: React.FC<CampaignDeadlineChipProps> = ({ endsAt }) => {
  const { t } = useTranslation();
  const now = useClock(60_000);
  const left = campaignTimeLeft(endsAt, now);
  if (!left) return null;

  const label =
    left.unit === 'days'
      ? t('marketplace.campaign.list.left.days', { days: formatNumber(left.days), hours: formatNumber(left.hours) })
      : left.unit === 'hours'
        ? t('marketplace.campaign.list.left.hours', {
            hours: formatNumber(left.hours),
            minutes: formatNumber(left.minutes),
          })
        : t('marketplace.campaign.list.left.minutes', { minutes: formatNumber(left.minutes) });
  return <CampaignGlassPill label={label} icon={Clock} />;
};

export const CampaignDeadlineChip = memo(CampaignDeadlineChipComponent);
