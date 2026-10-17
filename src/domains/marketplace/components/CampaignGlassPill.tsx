import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface CampaignGlassPillProps {
  label: string;
  icon?: LucideIcon;
  /** Without an icon: a dot in the status color (the label still says it, rule 08). */
  dotColor?: string;
  /** Time running out: a warm fill instead of the frost (the label still says it). */
  urgent?: boolean;
}

/** Frosted chip for status and time laid over a cover photo. */
const CampaignGlassPillComponent: React.FC<CampaignGlassPillProps> = ({ label, icon: Icon, dotColor, urgent = false }) => {
  const { colors, sizes } = useTheme();
  const warning = resolveHue(colors, 'warning');
  return (
    <Box
      row
      align="center"
      gap="xs"
      px="md"
      py="xs"
      borderRadius="full"
      bg={urgent ? warning.main : colors.media.glass}
      borderWidth="thin"
      borderColor={urgent ? warning.main : colors.media.glassBorder}
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
