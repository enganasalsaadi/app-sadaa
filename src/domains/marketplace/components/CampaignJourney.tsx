import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HueTone } from '@/core/theme';
import { Box, SectionHeader } from '@/shared/ui';
import type { JourneyStation } from '../utils/campaignJourney';
import { CampaignJourneyStation } from './CampaignJourneyStation';

export interface CampaignJourneyProps {
  stations: readonly JourneyStation[];
  /** The hue of the campaign's present state (its node and halo). */
  tone: HueTone;
  onOpenApplicants: () => void;
}

/**
 * The campaign's five stops on a spine — reviewed, taking applications, seats, running, done —
 * with the finished ones filled and the present one lit. Opens on the present station; any other
 * opens on a tap to say what happened there or what comes.
 */
const CampaignJourneyComponent: React.FC<CampaignJourneyProps> = ({ stations, tone, onOpenApplicants }) => {
  const { t } = useTranslation();
  // The present station starts open; a tap flips whichever one it lands on, so the lit station
  // follows the campaign when its status moves on while the page is open.
  const [flipped, setFlipped] = useState<ReadonlySet<JourneyStation['key']>>(() => new Set());
  const toggle = useCallback((key: JourneyStation['key']) => {
    setFlipped(previous => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <Box gap="md">
      <SectionHeader
        title={t('marketplace.campaign.detail.journey.title')}
        subtitle={t('marketplace.campaign.detail.journey.where')}
        emphasis="strong"
      />
      <Box>
        {stations.map((station, index) => (
          <CampaignJourneyStation
            key={station.key}
            station={station}
            index={index}
            last={index === stations.length - 1}
            tone={tone}
            open={(station.state === 'current') !== flipped.has(station.key)}
            onToggle={toggle}
            onOpenApplicants={onOpenApplicants}
          />
        ))}
      </Box>
    </Box>
  );
};

export const CampaignJourney = memo(CampaignJourneyComponent);
