import React, { memo } from 'react';
import type { TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type MoneyTextSize = 'md' | 'lg';
/** `money` only for money flow (balance, earning, payout, rule 08); `default` for prices and totals. */
export type MoneyTextTone = 'default' | 'money' | 'muted';

export interface MoneyTextProps {
  value: Money;
  /** `md` = `amount`, `lg` = `amountLarge`. Default `md`. */
  size?: MoneyTextSize;
  tone?: MoneyTextTone;
  /** `+$50.00` / `-$50.00` (ledger lines). */
  showSign?: boolean;
  /** Client-side preview, not a server figure (rule 06): `≈` + "estimate". */
  estimate?: boolean;
  align?: TextStyle['textAlign'];
}

/** The one way to render an amount: formatted from minor units, tabular digits. */
const MoneyTextComponent: React.FC<MoneyTextProps> = ({
  value,
  size = 'md',
  tone = 'default',
  showSign = false,
  estimate = false,
  align,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const formatted = formatMoney(value, undefined, {
    signDisplay: showSign ? 'exceptZero' : 'auto',
  });
  const amount = estimate ? t('common.money.approx', { amount: formatted }) : formatted;
  const color =
    tone === 'money'
      ? colors.money.text
      : tone === 'muted'
        ? colors.text.secondary
        : colors.text.primary;

  const text = (
    <Text variant={size === 'lg' ? 'amountLarge' : 'amount'} color={color} align={align}>
      {amount}
    </Text>
  );

  if (!estimate) return text;

  return (
    <Box
      row
      align="baseline"
      gap="xs"
      accessible
      accessibilityLabel={`${amount} ${t('common.money.estimate')}`}
    >
      {text}
      <Text variant="caption" color={colors.text.tertiary}>
        {t('common.money.estimate')}
      </Text>
    </Box>
  );
};

export const MoneyText = memo(MoneyTextComponent);
