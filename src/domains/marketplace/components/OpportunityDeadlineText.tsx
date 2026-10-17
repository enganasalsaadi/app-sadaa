import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { OpportunityDeadline } from '../utils/opportunities';

const DEADLINE_KEY = {
  days: 'marketplace.campaign.feed.card.deadline.days',
  hours: 'marketplace.campaign.feed.card.deadline.hours',
} as const;

export interface OpportunityDeadlineTextProps {
  deadline: OpportunityDeadline;
}

/** «3 days to apply» with a clock; warm once a day or less is left. */
const OpportunityDeadlineTextComponent: React.FC<OpportunityDeadlineTextProps> = ({ deadline }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const warning = resolveHue(colors, 'warning');
  return (
    <Box row align="center" gap="xs">
      <Clock
        size={sizes.icon.xs}
        color={deadline.urgent ? warning.main : colors.icon.secondary}
        strokeWidth={iconStroke.bold}
      />
      <Text variant="label" color={deadline.urgent ? warning.text : colors.text.primary}>
        {deadline.unit === 'lastHour'
          ? t('marketplace.campaign.feed.card.deadline.lastHour')
          : t(DEADLINE_KEY[deadline.unit], { count: deadline.count })}
      </Text>
    </Box>
  );
};

export const OpportunityDeadlineText = memo(OpportunityDeadlineTextComponent);
