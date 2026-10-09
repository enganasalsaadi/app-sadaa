import React, { memo } from 'react';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';

interface WalletHeaderBalanceProps {
  label: string;
  available: Money | null;
  hidden: boolean;
}

/** The balance pinned in the navy bar once the hero scrolls away (rule 09 §2.1). */
const WalletHeaderBalanceComponent: React.FC<WalletHeaderBalanceProps> = ({ label, available, hidden }) => {
  const { colors, sizes } = useTheme();
  if (!available) return null;

  return (
    <Box alignSelf="flex-start">
      <Box row align="center" gap="xs">
        <Box width={sizes.dot.sm} height={sizes.dot.sm} borderRadius="full" bg={colors.glass.iconMoney} />
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {label}
        </Text>
      </Box>
      <MoneyText
        value={available}
        size="title"
        tone="onBrand"
        splitFraction
        rounding="down"
        hidden={hidden}
      />
    </Box>
  );
};

export const WalletHeaderBalance = memo(WalletHeaderBalanceComponent);
