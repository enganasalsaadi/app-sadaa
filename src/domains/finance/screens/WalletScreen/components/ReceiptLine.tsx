import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, StatusPill, Text } from '@/shared/ui';
import { useWalletLineView } from '../../../hooks/useWalletLineView';
import type { WalletTransaction } from '../../../types';

interface ReceiptLineProps {
  line: WalletTransaction;
  hidden: boolean;
  onPress: (reference: string) => void;
}

/**
 * One printed line of the activity receipt: what happened, with whom, the time and the open
 * status; the signed amount at the end (credit mint, debit neutral) with `≈ USD` under SYP.
 */
const ReceiptLineComponent: React.FC<ReceiptLineProps> = ({ line, hidden, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const view = useWalletLineView(line, hidden);
  const { reference } = line;
  const press = useCallback(() => onPress(reference), [onPress, reference]);

  return (
    <Pressable
      row
      justify="space-between"
      gap="md"
      py="md"
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint={t('finance.statement.lineHint')}
    >
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" numberOfLines={1}>
          {line.type_label}
        </Text>
        {line.description ? (
          <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
            {line.description}
          </Text>
        ) : null}
        {view.time ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {view.time}
          </Text>
        ) : null}
        {line.status_label ? (
          <Box alignSelf="flex-start">
            <StatusPill
              label={line.status_label}
              tone={view.pill?.tone ?? 'neutral'}
              icon={view.pill?.icon}
              size="sm"
            />
          </Box>
        ) : null}
      </Box>
      <Box align="flex-end" gap="xs">
        <MoneyText
          value={view.amount}
          tone={view.credit ? 'money' : view.signed ? 'default' : 'muted'}
          showSign={view.signed}
          hidden={hidden}
        />
        {view.paid && !hidden ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {view.paid}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const ReceiptLine = memo(ReceiptLineComponent);
