import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type KeyValueEmphasis = 'default' | 'strong' | 'money';

export interface KeyValueRowProps {
  label: string;
  /** Text, or a node (e.g. `StatusPill`) for a status value. */
  value: React.ReactNode;
  hint?: string;
  /** `money` = tabular amount in the money color (balance, payout); `strong` = totals. */
  emphasis?: KeyValueEmphasis;
}

/** Label / value line for summaries (deal terms, invoice, escrow split). */
const KeyValueRowComponent: React.FC<KeyValueRowProps> = ({
  label,
  value,
  hint,
  emphasis = 'default',
}) => {
  const { colors } = useTheme();

  return (
    <Box row align="flex-start" justify="space-between" gap="lg" py="xs">
      <Box flex={1} gap="xs">
        <Text variant={emphasis === 'strong' ? 'bodyMedium' : 'body'} color={emphasis === 'strong' ? colors.text.primary : colors.text.secondary}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {hint}
          </Text>
        ) : null}
      </Box>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text
          variant={emphasis === 'default' ? 'body' : 'amount'}
          color={emphasis === 'money' ? colors.money.text : colors.text.primary}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </Box>
  );
};

export const KeyValueRow = memo(KeyValueRowComponent);
