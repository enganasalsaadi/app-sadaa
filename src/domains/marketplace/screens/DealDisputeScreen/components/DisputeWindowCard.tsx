import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Hourglass } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ProgressBar, StatusPill, Text } from '@/shared/ui';
import { DealDisputeClock } from '../../../components/DealDisputeClock';
import { useClock } from '../../../hooks/useClock';
import { evidenceWindowShare } from '../../../utils/dealDispute';

const MINUTE_MS = 60_000;

export interface DisputeWindowCardProps {
  /** `null` once the window has closed. */
  dueAt: number | null;
  open: boolean;
  /** The team's target time, formatted; shown, never enforced. */
  target: string | null;
}

/** The evidence window: ticking down while open, then the team's target time for its decision. */
const DisputeWindowCardComponent: React.FC<DisputeWindowCardProps> = ({ dueAt, open, target }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const now = useClock(MINUTE_MS);
  const live = open && dueAt !== null;

  return (
    <Box p="lg" gap="md" bg={colors.surface.main} borderRadius="xl" shadow="card">
      <Box row align="center" justify="space-between" gap="md">
        <StatusPill
          label={t(live ? 'marketplace.deals.dispute.window.open' : 'marketplace.deals.dispute.window.closed')}
          tone={live ? 'interactive' : 'neutral'}
          icon={live ? Clock : Hourglass}
          size="sm"
        />
        {live ? <DealDisputeClock endsAt={dueAt} variant="h3" color={colors.text.primary} /> : null}
      </Box>
      {live ? (
        <ProgressBar
          value={evidenceWindowShare(dueAt, now)}
          tone="interactive"
          size="sm"
          accessibilityLabel={t('marketplace.deals.dispute.window.open')}
        />
      ) : null}
      <Text variant="caption" color={colors.text.tertiary}>
        {live ? t('marketplace.deals.dispute.window.openNote') : t('marketplace.deals.dispute.window.closedNote')}
        {target ? ` ${t('marketplace.deals.dispute.window.target', { date: target })}` : ''}
      </Text>
    </Box>
  );
};

export const DisputeWindowCard = memo(DisputeWindowCardComponent);
