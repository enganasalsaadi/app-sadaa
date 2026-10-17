import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface CatalogServiceRowProps {
  platform: string;
  platformLabel: string;
  service: string;
  label: string;
  picked: boolean;
  onToggle: (platform: string, service: string) => void;
}

/** One catalog service as a checkbox row: ticked once it is a line of the campaign. */
const CatalogServiceRowComponent: React.FC<CatalogServiceRowProps> = ({
  platform,
  platformLabel,
  service,
  label,
  picked,
  onToggle,
}) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'row' | 'box', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: sizes.button.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.lg,
        borderWidth: borderWidths.thin,
        borderColor: picked ? colors.interactive.main : colors.border.default,
        backgroundColor: picked ? colors.interactive.soft : colors.surface.main,
      },
      box: {
        width: sizes.icon.lg,
        height: sizes.icon.lg,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: picked ? colors.interactive.main : colors.layout.base,
      },
    }),
    [colors, picked, sizes.button.lg, sizes.icon.lg],
  );
  const toggle = useCallback(() => onToggle(platform, service), [onToggle, platform, service]);

  return (
    <Pressable
      style={styles.row}
      scaleOnPress
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: picked }}
      accessibilityLabel={`${label} ${platformLabel}`}
    >
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary}>
          {label}
        </Text>
      </Box>
      <Box style={styles.box}>{picked ? <Check size={sizes.icon.sm} color={colors.text.onBrand} /> : null}</Box>
    </Pressable>
  );
};

export const CatalogServiceRow = memo(CatalogServiceRowComponent);
