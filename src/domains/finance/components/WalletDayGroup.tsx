import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Divider, Text } from '@/shared/ui';
import { formatDayLabel, type LedgerDay } from '../utils/walletDates';
import { WalletTransactionRow } from './WalletTransactionRow';

export interface WalletDayGroupProps {
  day: LedgerDay;
  hidden: boolean;
  onPressLine?: (reference: string) => void;
}

/** One day of the ledger: today / yesterday / date caption over one card of rows (wallet tab and statement). */
const WalletDayGroupComponent: React.FC<WalletDayGroupProps> = ({ day, hidden, onPressLine }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const label = formatDayLabel(day, t, i18n.language);

  return (
    <Box gap="sm">
      <Text variant="caption" color={colors.text.tertiary} accessibilityRole="header">
        {label}
      </Text>
      <Card px="lg" py="xs">
        {day.items.map((line, index) => (
          <Box key={line.reference}>
            {index > 0 ? <Divider /> : null}
            <WalletTransactionRow line={line} hidden={hidden} onPress={onPressLine} />
          </Box>
        ))}
      </Card>
    </Box>
  );
};

export const WalletDayGroup = memo(WalletDayGroupComponent);
