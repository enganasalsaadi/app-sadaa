import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react-native';
import { formatDate, formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, StatusPill, Text } from '@/shared/ui';
import { PAYMENT_CHANNEL_DEF } from '../../../constants/paymentChannels';
import { WITHDRAWAL_STATUS_LOOK } from '../../../constants/withdraw';
import type { Withdrawal } from '../../../types';
import {
  isWithdrawalLost,
  withdrawalBadgeColors,
  withdrawalDestination,
  withdrawalStatusLabel,
} from '../../../utils/withdrawalView';

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

interface WithdrawalRowProps {
  withdrawal: Withdrawal;
  /** Receives the withdrawal's `id` (one stable handler for every row). */
  onPress: (id: string) => void;
}

/**
 * One request in the history (ledger row, rule 09 §2.1): channel badge, "Withdrawal to …",
 * status pill while not completed + time, the amount out (neutral, struck through when it
 * never left or came back) and the pounds received for a pound payout.
 */
const WithdrawalRowComponent: React.FC<WithdrawalRowProps> = ({ withdrawal, onPress }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { colors, sizes } = useTheme();

  const Icon = withdrawal.channel ? PAYMENT_CHANNEL_DEF[withdrawal.channel].icon : ArrowUpRight;
  const badge = withdrawalBadgeColors(withdrawal, colors);
  const destination = withdrawalDestination(withdrawal, t);
  const title = destination
    ? t('finance.withdraw.history.rowTitle', { destination })
    : t('finance.withdraw.history.rowTitleNoDestination');
  const statusLabel = withdrawalStatusLabel(withdrawal, t);
  const look = withdrawal.status ? WITHDRAWAL_STATUS_LOOK[withdrawal.status] : null;
  const lost = isWithdrawalLost(withdrawal);
  const amount = useMemo(
    () => ({ ...withdrawal.gross, amount: -withdrawal.gross.amount }),
    [withdrawal.gross],
  );

  const time = useMemo(() => {
    const created = new Date(withdrawal.created_at);
    return Number.isNaN(created.getTime()) ? '' : formatDate(created, TIME, lang);
  }, [lang, withdrawal.created_at]);

  const payout =
    withdrawal.net_payout && withdrawal.net_payout.currency !== withdrawal.gross.currency
      ? formatMoney(withdrawal.net_payout, lang)
      : null;

  const { id } = withdrawal;
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      row
      align="center"
      gap="md"
      py="md"
      accessibilityRole="button"
      accessibilityLabel={t('finance.withdraw.history.rowA11y', {
        title,
        amount: formatMoney(withdrawal.gross, lang),
        status: statusLabel,
      })}
      accessibilityHint={t('finance.withdraw.history.rowHint')}
    >
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
          {withdrawal.status !== 'completed' && statusLabel ? (
            <StatusPill label={statusLabel} tone={look?.tone ?? 'neutral'} icon={look?.icon} size="sm" />
          ) : null}
          {time ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {time}
            </Text>
          ) : null}
        </Box>
      </Box>

      <Box align="flex-end" gap="xs">
        <MoneyText value={amount} tone={lost ? 'muted' : 'default'} strikethrough={lost} />
        {payout ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {payout}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const WithdrawalRow = memo(WithdrawalRowComponent);
