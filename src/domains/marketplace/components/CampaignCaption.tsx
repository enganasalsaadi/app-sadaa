import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { CheckCircle2, Clock, Flag, Hourglass } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useCampaignTimeLeft } from '../hooks/useCampaignTimeLeft';
import type { Campaign } from '../types';
import { getCampaignStatusMeta } from '../utils/campaignStatus';

export interface CampaignCaptionProps {
  campaign: Campaign;
}

/**
 * The one line under a card's track that says what the state means right now: how long applications
 * stay open («5 days left»), that recruiting closed, that the seats are full, or that the review is
 * under way. It tints with the status; states with nothing to add (suspended: the ribbon says it)
 * show nothing.
 */
const CampaignCaptionComponent: React.FC<CampaignCaptionProps> = ({ campaign }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { status, counters, seatsTotal } = campaign;
  const timeLeft = useCampaignTimeLeft(status.key === 'open' ? campaign.applyDeadlineAt : null);
  const hue = resolveHue(colors, getCampaignStatusMeta(status.key).tone);

  let Icon: LucideIcon = Clock;
  let text: string | null = null;
  switch (status.key) {
    case 'open': {
      const noApplicants = counters.applicationsOpen === 0 && counters.seatsOccupied === 0;
      text = [timeLeft, noApplicants ? t('marketplace.campaign.list.caption.noApplicants') : null]
        .filter(Boolean)
        .join(' · ');
      break;
    }
    case 'closed':
      Icon = Flag;
      text = t('marketplace.campaign.list.caption.closed', { filled: counters.seatsOccupied, total: seatsTotal });
      break;
    case 'filled':
      Icon = CheckCircle2;
      text = t('marketplace.campaign.list.caption.filled');
      break;
    case 'pending_review':
      Icon = Hourglass;
      text = t('marketplace.campaign.list.caption.review');
      break;
    default:
      break;
  }
  if (!text) return null;

  return (
    <Box row align="center" gap="sm" px="md" py="sm" borderRadius="md" bg={hue.soft}>
      <Icon size={sizes.icon.xs} color={hue.main} strokeWidth={iconStroke.bold} />
      <Box flex={1}>
        <Text variant="bodySmall" color={hue.text} numberOfLines={2}>
          {text}
        </Text>
      </Box>
    </Box>
  );
};

export const CampaignCaption = memo(CampaignCaptionComponent);
