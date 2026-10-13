import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface PassSlotProps {
  icon: LucideIcon;
  /** Read aloud; shown beside the icon unless the slot is a square. */
  label: string;
  onPress: () => void;
  /** Side of a square slot (the missing photo); omit for a full-width row. */
  square?: number;
}

/** A dashed empty slot on the pass: something brands will see once the creator fills it. */
const PassSlotComponent: React.FC<PassSlotProps> = ({ icon: Icon, label, onPress, square }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'dashed', ViewStyle> => ({
      dashed: { borderStyle: 'dashed', borderWidth: borderWidths.md, borderColor: colors.interactive.main },
    }),
    [colors.interactive.main],
  );

  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      row={square === undefined}
      align="center"
      justify="center"
      gap="sm"
      px={square === undefined ? 'md' : undefined}
      width={square}
      height={square}
      minHeight={sizes.button.md}
      borderRadius="md"
      bg={colors.interactive.soft}
      style={styles.dashed}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={sizes.icon.sm} color={colors.interactive.text} />
      {square === undefined ? (
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.interactive.text} numberOfLines={1}>
            {label}
          </Text>
        </Box>
      ) : null}
    </Pressable>
  );
};

export const PassSlot = memo(PassSlotComponent);
