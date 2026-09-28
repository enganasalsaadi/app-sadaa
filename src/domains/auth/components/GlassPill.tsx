import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface GlassPillProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  /** Caps the label to one line inside tight spots (orbit chips). */
  maxWidth?: number;
}

/** Caption pill on glass; navy surfaces only (rule 08). */
const GlassPillComponent: React.FC<GlassPillProps> = ({ label, icon: Icon, iconColor, maxWidth }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="center"
      gap="sm"
      px="md"
      py="sm"
      borderRadius="full"
      bg={colors.glass.badge}
      borderWidth="thin"
      borderColor={colors.glass.border}
      maxWidth={maxWidth}
    >
      {Icon ? <Icon size={sizes.icon.xs} color={iconColor ?? colors.glass.iconInteractive} /> : null}
      <Text variant="caption" color={colors.text.onBrand} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </Box>
  );
};

export const GlassPill = memo(GlassPillComponent);

const styles = StyleSheet.create({
  label: { flexShrink: 1 },
});
