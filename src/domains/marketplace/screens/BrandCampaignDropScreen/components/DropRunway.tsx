import React, { memo, useMemo } from 'react';
import { Card, Divider } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { CampaignDropBoard } from '../../../types/campaignDrop';
import { campaignDropView, sortDropReminders } from '../../../utils/campaignDrop';
import { DropBeacons } from './DropBeacons';
import { DropStations } from './DropStations';

export interface DropRunwayProps {
  board: CampaignDropBoard;
}

/** First card of the body: where the drop stands (the three stations with their times) and the reminders the server sends. */
const DropRunwayComponent: React.FC<DropRunwayProps> = ({ board }) => {
  const now = useClock(1000);
  const { phase } = campaignDropView(board, now);
  const reminders = useMemo(() => sortDropReminders(board.reminders), [board.reminders]);

  return (
    <Card p="lg" borderRadius="lg">
      <DropStations phase={phase} openAt={board.publishOpensAt} dropAt={board.dropAt} />
      <Divider spacing="md" />
      <DropBeacons reminders={reminders} />
    </Card>
  );
};

export const DropRunway = memo(DropRunwayComponent);
