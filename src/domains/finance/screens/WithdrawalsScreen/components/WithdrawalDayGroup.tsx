import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Divider, Text } from '@/shared/ui';
import type { Withdrawal } from '../../../types';
import { formatDayLabel, type LedgerDay } from '../../../utils/walletDates';
import { WithdrawalRow } from './WithdrawalRow';

interface WithdrawalDayGroupProps {
  day: LedgerDay<Withdrawal>;
  onPressWithdrawal: (id: string) => void;
}

/** One day of the history: the day caption over one card of requests (same shape as the statement). */
const WithdrawalDayGroupComponent: React.FC<WithdrawalDayGroupProps> = ({ day, onPressWithdrawal }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="caption" color={colors.text.tertiary} accessibilityRole="header">
        {formatDayLabel(day, t, i18n.language)}
      </Text>
      <Card px="lg" py="xs">
        {day.items.map((withdrawal, index) => (
          <Box key={withdrawal.id}>
            {index > 0 ? <Divider /> : null}
            <WithdrawalRow withdrawal={withdrawal} onPress={onPressWithdrawal} />
          </Box>
        ))}
      </Card>
    </Box>
  );
};

export const WithdrawalDayGroup = memo(WithdrawalDayGroupComponent);
