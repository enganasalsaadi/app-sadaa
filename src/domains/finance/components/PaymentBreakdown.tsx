import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, Divider, KeyValueRow, Text } from '@/shared/ui';

export interface PaymentLine {
  key: string;
  label: string;
  value: Money;
  hint?: string;
}

export interface PaymentBreakdownProps {
  lines: readonly PaymentLine[];
  total: Omit<PaymentLine, 'key'>;
  /**
   * Figures are a client-side preview, not the server quote (rule 06):
   * prefixes amounts with `≈` and explains that the final amount comes at checkout.
   */
  estimate?: boolean;
}

/** Price → fees → total, for offers, checkout and invoices. Amounts come from the server. */
const PaymentBreakdownComponent: React.FC<PaymentBreakdownProps> = ({ lines, total, estimate = false }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const show = (value: Money): string =>
    estimate ? t('common.money.approx', { amount: formatMoney(value) }) : formatMoney(value);

  return (
    <Box gap="xs">
      {lines.map(line => (
        <KeyValueRow key={line.key} label={line.label} hint={line.hint} value={show(line.value)} />
      ))}
      <Divider spacing="xs" />
      <KeyValueRow label={total.label} hint={total.hint} value={show(total.value)} emphasis="strong" />
      {estimate ? (
        <Box row align="center" gap="xs" mt="xs">
          <Info size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="caption" color={colors.text.secondary}>
            {t('finance.breakdown.estimateNote')}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export const PaymentBreakdown = memo(PaymentBreakdownComponent);
