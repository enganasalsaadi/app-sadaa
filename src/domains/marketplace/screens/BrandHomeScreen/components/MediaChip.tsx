import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface MediaChipProps {
  icon?: LucideIcon;
  /** Bold lead (a figure), shown before the label. */
  strong?: string;
  label: string;
}

/** Frosted dark chip laid over a photo: optional icon, a bold figure, a label. */
const MediaChipComponent: React.FC<MediaChipProps> = ({ icon: Icon, strong, label }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="md"
      height={sizes.button.sm}
      borderRadius="full"
      bg={colors.media.glass}
      borderWidth="thin"
      borderColor={colors.media.glassBorder}
    >
      {Icon ? <Icon size={sizes.icon.xs} color={colors.text.onBrand} /> : null}
      {strong ? (
        <Text variant="buttonSmall" color={colors.text.onBrand} numberOfLines={1}>
          {strong}
        </Text>
      ) : null}
      <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
};

export const MediaChip = memo(MediaChipComponent);
