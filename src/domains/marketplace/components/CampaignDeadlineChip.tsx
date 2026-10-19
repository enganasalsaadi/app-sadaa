import React, { memo } from 'react';
import { Clock } from 'lucide-react-native';
import type { Timestamp } from '../types';
import { useCampaignTimeLeft } from '../hooks/useCampaignTimeLeft';
import { CampaignGlassPill } from './CampaignGlassPill';

export interface CampaignDeadlineChipProps {
  /** The apply deadline; nothing renders without one or once it has passed. */
  endsAt: Timestamp | null;
}

/** «5 days left» to recruit, on the cover. */
const CampaignDeadlineChipComponent: React.FC<CampaignDeadlineChipProps> = ({ endsAt }) => {
  const label = useCampaignTimeLeft(endsAt);
  return label ? <CampaignGlassPill label={label} icon={Clock} /> : null;
};

export const CampaignDeadlineChip = memo(CampaignDeadlineChipComponent);
