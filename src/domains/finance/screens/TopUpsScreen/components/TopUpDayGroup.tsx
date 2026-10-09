import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Divider, Text } from '@/shared/ui';
import type { TopUp } from '../../../types';
import { formatDayLabel, type LedgerDay } from '../../../utils/walletDates';
import { TopUpRow } from './TopUpRow';

interface TopUpDayGroupProps {
  day: LedgerDay<TopUp>;
  onPressTopUp: (id: string) => void;
}

/** One day of the history: the day caption over one card of requests (same shape as the statement). */
const TopUpDayGroupComponent: React.FC<TopUpDayGroupProps> = ({ day, onPressTopUp }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="caption" color={colors.text.tertiary} accessibilityRole="header">
        {formatDayLabel(day, t, i18n.language)}
      </Text>
      <Card px="lg" py="xs">
        {day.items.map((topUp, index) => (
          <Box key={topUp.id}>
            {index > 0 ? <Divider /> : null}
            <TopUpRow topUp={topUp} onPress={onPressTopUp} />
          </Box>
        ))}
      </Card>
    </Box>
  );
};

export const TopUpDayGroup = memo(TopUpDayGroupComponent);
