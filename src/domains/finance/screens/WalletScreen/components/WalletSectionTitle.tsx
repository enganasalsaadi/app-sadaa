import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface WalletSectionTitleProps {
  title: string;
  /** A line under the title (a count, a total). */
  children?: React.ReactNode;
  /** Beside the title at the reading end (a period switch). */
  end?: React.ReactNode;
}

/** Big confident section title with its quiet supporting line. */
const WalletSectionTitleComponent: React.FC<WalletSectionTitleProps> = ({ title, children, end }) => {
  const { colors } = useTheme();
  return (
    <Box row align="flex-end" justify="space-between" gap="md">
      <Box flex={1} gap="xs">
        <Text variant="h4" numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {children ? (
          <Box row align="center" gap="xs">
            {typeof children === 'string' ? (
              <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
                {children}
              </Text>
            ) : (
              children
            )}
          </Box>
        ) : null}
      </Box>
      {end}
    </Box>
  );
};

export const WalletSectionTitle = memo(WalletSectionTitleComponent);
