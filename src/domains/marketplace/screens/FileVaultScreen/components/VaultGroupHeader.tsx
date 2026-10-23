import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface VaultGroupHeaderProps {
  title: string;
}

/** A group inside a section: one draft round, one live link, one shipment. */
const VaultGroupHeaderComponent: React.FC<VaultGroupHeaderProps> = ({ title }) => {
  const { colors } = useTheme();
  return (
    <Box pt="sm" pb="xs">
      <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
        {title}
      </Text>
    </Box>
  );
};

export const VaultGroupHeader = memo(VaultGroupHeaderComponent);
