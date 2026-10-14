import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface SheetTitleProps {
  title: string;
  body?: string;
}

/** A sheet's heading and its one-line explanation. */
const SheetTitleComponent: React.FC<SheetTitleProps> = ({ title, body }) => {
  const { colors } = useTheme();
  return (
    <Box gap="xs">
      <Text variant="h4" color={colors.text.primary} accessibilityRole="header">
        {title}
      </Text>
      {body ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {body}
        </Text>
      ) : null}
    </Box>
  );
};

export const SheetTitle = memo(SheetTitleComponent);
