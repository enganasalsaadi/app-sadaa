import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCheck } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignEligibilityReasonRow, CreatorCampaign } from '../types/campaign';
import type { ApplyAction, OpportunityDeadline } from '../utils/opportunities';
import { OpportunityDeadlineText } from './OpportunityDeadlineText';
import { OpportunitySeats } from './OpportunitySeats';

export interface CreatorApplyDockTopProps {
  seats: CreatorCampaign['seats'];
  deadline: OpportunityDeadline | null;
  action: ApplyAction;
}

const Reason = memo<{ row: CampaignEligibilityReasonRow }>(({ row }) => {
  const { colors, sizes } = useTheme();
  const applied = row.key === 'already_applied';
  const hue = resolveHue(colors, applied ? 'interactive' : 'warning');
  const Icon = applied ? CheckCheck : AlertTriangle;
  return (
    <Box row align="flex-start" gap="sm">
      <Icon size={sizes.icon.sm} color={hue.main} strokeWidth={iconStroke.bold} />
      <Box flex={1}>
        <Text variant="bodySmall" color={colors.text.primary}>
          {row.label}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * Above the apply button: the seats left and the time to apply, then, when the creator can't apply,
 * the server's reasons in its own words (never our guess), or a line that the campaign closed.
 */
const CreatorApplyDockTopComponent: React.FC<CreatorApplyDockTopProps> = ({ seats, deadline, action }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reasons = action.kind === 'blocked' || action.kind === 'closed' ? action.reasons : [];
  const closedBare = action.kind === 'closed' && reasons.length === 0;

  return (
    <Box gap="md">
      <Box row align="center" justify="space-between" gap="lg">
        <OpportunitySeats total={seats.total} free={seats.free} />
        {deadline && action.kind !== 'closed' ? <OpportunityDeadlineText deadline={deadline} /> : null}
      </Box>
      {reasons.length > 0 ? (
        <Box gap="sm" p="md" borderRadius="lg" bg={colors.surface.elevated}>
          {reasons.map((row, index) => (
            <Reason key={`${row.key ?? 'unknown'}:${index}`} row={row} />
          ))}
        </Box>
      ) : null}
      {closedBare ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.campaign.opportunity.dock.closedHint')}
        </Text>
      ) : null}
    </Box>
  );
};

export const CreatorApplyDockTop = memo(CreatorApplyDockTopComponent);
