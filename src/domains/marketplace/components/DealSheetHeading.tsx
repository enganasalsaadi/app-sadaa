import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface DealSheetHeadingProps {
  title: string;
  body?: string;
}

/** A respond sheet's big title over one muted line. */
const DealSheetHeadingComponent: React.FC<DealSheetHeadingProps> = ({
  title,
  body,
}) => {
  const { colors } = useTheme();
  return (
    <Box gap="xs">
      <Text variant="h3" color={colors.text.primary} accessibilityRole="header">
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

export const DealSheetHeading = memo(DealSheetHeadingComponent);
