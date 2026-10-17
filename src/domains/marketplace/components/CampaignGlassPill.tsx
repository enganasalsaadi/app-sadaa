import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface CampaignGlassPillProps {
  label: string;
  icon?: LucideIcon;
  /** Without an icon: a dot in the status color (the label still says it, rule 08). */
  dotColor?: string;
}

/** Frosted chip for status and time laid over a cover photo. */
const CampaignGlassPillComponent: React.FC<CampaignGlassPillProps> = ({ label, icon: Icon, dotColor }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="md"
      py="xs"
      borderRadius="full"
      bg={colors.media.glass}
      borderWidth="thin"
      borderColor={colors.media.glassBorder}
      alignSelf="flex-start"
    >
      {Icon ? (
        <Icon size={sizes.icon.xs} color={colors.text.onBrand} strokeWidth={iconStroke.bold} />
      ) : (
        <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={dotColor ?? colors.text.onBrand} />
      )}
      <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
};

export const CampaignGlassPill = memo(CampaignGlassPillComponent);
