import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import { DashedRule } from './DashedRule';

interface RateLineProps {
  /** "1 $ = 14,000", already formatted. */
  value: string;
  /** "Updated today · 9:00 AM". */
  updated: string | null;
}

/** Today's USD → SYP rate printed between dashed rules: live dot, title over its update time, the rate. */
const RateLineComponent: React.FC<RateLineProps> = ({ value, updated }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const title = t('finance.wallet.rate.title');

  return (
    <Box>
      <DashedRule />
      <Box row align="center" gap="sm" py="lg" px="xs" accessible accessibilityLabel={`${title}: ${value}`}>
        <LiveDot color={colors.interactive.main} size={sizes.dot.md} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
            {title}
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
      <DashedRule />
    </Box>
  );
};

export const RateLine = memo(RateLineComponent);
