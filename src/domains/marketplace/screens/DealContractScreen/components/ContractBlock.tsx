import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/** One titled part of the paper: a hairline, a small caps title, then its lines. */
const ContractBlockComponent: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const { colors } = useTheme();
  return (
    <Box
      gap="sm"
      pt="lg"
      borderTopWidth="hairline"
      borderColor={colors.border.default}
    >
      <Text variant="overline" color={colors.text.tertiary}>
        {title}
      </Text>
      {children}
    </Box>
  );
};

export const ContractBlock = memo(ContractBlockComponent);
