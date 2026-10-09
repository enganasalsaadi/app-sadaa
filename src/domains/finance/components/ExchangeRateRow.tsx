import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';

export interface ExchangeRateRowProps {
  /** "1 $ = 14,000 ل.س", already formatted. */
  value: string;
  /** "Updated today · 9:00 AM". */
  updated: string | null;
}

/** Today's USD → SYP rate in one card row (wallet tab; top-up and withdraw previews reuse it). */
const ExchangeRateRowComponent: React.FC<ExchangeRateRowProps> = ({ value, updated }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Card px="lg" py="md">
      <Box row align="center" gap="md" accessible accessibilityLabel={`${t('finance.wallet.rate.title')}: ${value}`}>
        <Box
          width={sizes.iconButton.md}
          height={sizes.iconButton.md}
          borderRadius="md"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
        >
          <ArrowLeftRight size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {t('finance.wallet.rate.title')}
          </Text>
          {updated ? (
            <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
              {updated}
            </Text>
          ) : null}
        </Box>
        <Text variant="amount" numberOfLines={1}>
          {value}
        </Text>
      </Box>
    </Card>
  );
};

export const ExchangeRateRow = memo(ExchangeRateRowComponent);
