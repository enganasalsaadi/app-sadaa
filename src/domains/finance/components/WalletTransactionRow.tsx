import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, StatusPill, Text } from '@/shared/ui';
import {
  LINE_KIND_ICON,
  LINE_STATUS_PILL,
  lineBadgeColors,
  lineDisplayAmount,
  lineKind,
  lineTitle,
} from '../constants/walletLineLook';
import type { WalletTransaction } from '../types';

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

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
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();

  const kind = lineKind(line);
  const Icon = LINE_KIND_ICON[kind];
  const badge = lineBadgeColors(kind, colors);
  const title = lineTitle(line);
  const pill = line.status ? LINE_STATUS_PILL[line.status] : null;
  const signed = line.affects_balance;
  const amount = lineDisplayAmount(line);

  const time = useMemo(() => {
    const created = new Date(line.created_at);
    return Number.isNaN(created.getTime()) ? '' : formatDate(created, TIME, i18n.language);
  }, [i18n.language, line.created_at]);

  // Another currency on the line (a SYP payout or top-up): what was actually paid.
  const paid =
    line.original && line.original.currency !== line.amount.currency
      ? t('common.money.approx', {
          amount: formatMoney(
            { amount: Math.abs(line.original.amount), currency: line.original.currency },
            i18n.language,
          ),
        })
      : null;

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
          {title}
        </Text>
        <Box row align="center" gap="sm">
          {line.status_label ? (
            <StatusPill
              label={line.status_label}
              tone={pill?.tone ?? 'neutral'}
              icon={pill?.icon}
              size="sm"
            />
          ) : null}
          {time ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {time}
            </Text>
          ) : null}
        </Box>
      </Box>

      <Box align="flex-end" gap="xs">
        <MoneyText
          value={amount}
          tone={signed && line.direction === 'credit' ? 'money' : 'default'}
          showSign={signed}
          hidden={hidden}
        />
        {paid && !hidden ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {paid}
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
      accessibilityLabel={t('finance.statement.lineA11y', {
        title,
        amount: hidden
          ? t('common.money.hidden')
          : formatMoney(amount, i18n.language, { signDisplay: signed ? 'exceptZero' : 'auto' }),
        time,
      })}
      accessibilityHint={t('finance.statement.lineHint')}
    >
      {content}
    </Pressable>
  );
};

export const WalletTransactionRow = memo(WalletTransactionRowComponent);
