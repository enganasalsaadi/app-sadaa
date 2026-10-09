import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { formatDate, formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, StatusPill, Text } from '@/shared/ui';
import { TOP_UP_CHANNEL_DEF, TOP_UP_STATUS_LOOK } from '../../../constants/topUp';
import type { TopUp } from '../../../types';
import { topUpBadgeColors, topUpChannelLabel, topUpStatusLabel } from '../../../utils/topUpView';

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

interface TopUpRowProps {
  topUp: TopUp;
  /** Receives the top-up's `id` (one stable handler for every row). */
  onPress: (id: string) => void;
}

/**
 * One request in the history (ledger row, rule 09 §2.1): channel badge, "Top-up · channel",
 * status pill while not completed + time, the amount sent (mint and signed once credited,
 * struck through when it never arrived) and ≈ the dollars for a pound transfer.
 */
const TopUpRowComponent: React.FC<TopUpRowProps> = ({ topUp, onPress }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { colors, sizes } = useTheme();

  const Icon = topUp.channel ? TOP_UP_CHANNEL_DEF[topUp.channel].icon : Wallet;
  const badge = topUpBadgeColors(topUp, colors);
  const channel = topUpChannelLabel(topUp, t);
  const title = channel
    ? t('finance.topUp.history.rowTitle', { channel })
    : t('finance.topUp.history.rowTitleNoChannel');
  const statusLabel = topUpStatusLabel(topUp, t);
  const look = topUp.status ? TOP_UP_STATUS_LOOK[topUp.status] : null;
  const completed = topUp.status === 'completed';
  const lost = topUp.status === 'rejected' || topUp.status === 'reversed';

  const time = useMemo(() => {
    const submitted = new Date(topUp.submitted_at);
    return Number.isNaN(submitted.getTime()) ? '' : formatDate(submitted, TIME, lang);
  }, [lang, topUp.submitted_at]);

  const usd =
    topUp.amount_usd && topUp.amount.currency !== topUp.amount_usd.currency
      ? t('common.money.approx', { amount: formatMoney(topUp.amount_usd, lang) })
      : null;

  const { id } = topUp;
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      row
      align="center"
      gap="md"
      py="md"
      accessibilityRole="button"
      accessibilityLabel={t('finance.topUp.history.rowA11y', {
        title,
        amount: formatMoney(topUp.amount, lang),
        status: statusLabel,
      })}
      accessibilityHint={t('finance.topUp.history.rowHint')}
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
          {!completed && statusLabel ? (
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
        <MoneyText
          value={topUp.amount}
          tone={completed ? 'money' : lost ? 'muted' : 'default'}
          showSign={completed}
          strikethrough={lost}
        />
        {usd ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {usd}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const TopUpRow = memo(TopUpRowComponent);
