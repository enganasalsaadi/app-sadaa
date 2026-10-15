import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealItem } from '../../../types';

export interface UpsellItemPickerProps {
  items: readonly Pick<DealItem, 'id' | 'title'>[];
  value: string | null;
  onChange: (itemId: string) => void;
}

interface ItemRowProps {
  id: string;
  title: string;
  selected: boolean;
  onPick: (itemId: string) => void;
}

const ItemRow = memo<ItemRowProps>(({ id, title, selected, onPick }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'row' | 'check', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: sizes.button.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        borderColor: selected ? colors.interactive.main : colors.border.default,
        backgroundColor: selected ? colors.interactive.soft : colors.surface.main,
      },
      check: {
        width: sizes.icon.md,
        height: sizes.icon.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.main,
      },
    }),
    [colors.border.default, colors.interactive.main, colors.interactive.soft, colors.surface.main, selected, sizes],
  );
  const onPress = useCallback(() => onPick(id), [id, onPick]);
  return (
    <Pressable
      style={styles.row}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
    >
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary}>
          {title}
        </Text>
      </Box>
      {selected ? (
        <Box style={styles.check}>
          <Check size={sizes.icon.xs} color={colors.text.onAccent} />
        </Box>
      ) : null}
    </Pressable>
  );
});

/** The deal's deliverables as a radio list: which one the add-on goes on. */
const UpsellItemPickerComponent: React.FC<UpsellItemPickerProps> = ({ items, value, onChange }) => (
  <Box gap="sm" accessibilityRole="radiogroup">
    {items.map(item => (
      <ItemRow key={item.id} id={item.id} title={item.title} selected={value === item.id} onPick={onChange} />
    ))}
  </Box>
);

export const UpsellItemPicker = memo(UpsellItemPickerComponent);
