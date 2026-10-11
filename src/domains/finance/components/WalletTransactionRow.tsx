import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, StatusPill, Text } from '@/shared/ui';
import { LINE_KIND_ICON, lineBadgeColors } from '../constants/walletLineLook';
import { useWalletLineView } from '../hooks/useWalletLineView';
import type { WalletTransaction } from '../types';

export interface WalletTransactionRowProps {
  line: WalletTransaction;
  hidden?: boolean;
  /** Opens the line's receipt; receives its `reference` (one stable handler for every row). */
  onPress?: (reference: string) => void;
}

/**
 * One statement line: badge by what the money did, "type · subject", the status pill
 * while the line is open, the time, and the signed amount (credit mint, debit neutral).
 * Memo lines (`affects_balance: false`) carry no sign; SYP payouts add the paid amount.
 */
const WalletTransactionRowComponent: React.FC<WalletTransactionRowProps> = ({
  line,
  hidden = false,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const view = useWalletLineView(line, hidden);
  const Icon = LINE_KIND_ICON[view.kind];
  const badge = lineBadgeColors(view.kind, colors);

  const { reference } = line;
  const handlePress = useCallback(() => onPress?.(reference), [onPress, reference]);

  const content = (
    <Box row align="center" gap="md" py="md">
      <Box
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="md"
        bg={badge.bg}
        align="center"
        justify="center"
      >
        <Icon size={sizes.icon.sm} color={badge.icon} />
      </Box>

      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" numberOfLines={1}>
          {view.title}
        </Text>
        <Box row align="center" gap="sm">
          {line.status_label ? (
            <StatusPill
              label={line.status_label}
              tone={view.pill?.tone ?? 'neutral'}
              icon={view.pill?.icon}
              size="sm"
            />
          ) : null}
          {view.time ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {view.time}
            </Text>
          ) : null}
        </Box>
      </Box>

      <Box align="flex-end" gap="xs">
        <MoneyText
          value={view.amount}
          tone={view.credit ? 'money' : 'default'}
          showSign={view.signed}
          hidden={hidden}
        />
        {view.paid && !hidden ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {view.paid}
          </Text>
        ) : null}
      </Box>
    </Box>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint={t('finance.statement.lineHint')}
    >
      {content}
    </Pressable>
  );
};

export const WalletTransactionRow = memo(WalletTransactionRowComponent);
