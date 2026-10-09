import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { TrendingUp } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface MonthInPillProps {
  value: Money;
  labelKey: ParseKeys;
}

/** "▲ 640 $ came in this month": glass pill, mint on navy (money coming in, rule 08). */
const MonthInPillComponent: React.FC<MonthInPillProps> = ({ value, labelKey }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const amount = formatMoney(value, i18n.language, { notation: 'compact', rounding: 'down' });

  return (
    <Box
      row
      align="center"
      alignSelf="flex-start"
      gap="xs"
      px="md"
      py="xs"
      borderRadius="full"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.fill}
    >
      <TrendingUp size={sizes.icon.xs} color={colors.glass.iconMoney} />
      <Text variant="caption" color={colors.glass.iconMoney} numberOfLines={1}>
        {t(labelKey, { amount })}
      </Text>
    </Box>
  );
};

export const MonthInPill = memo(MonthInPillComponent);
