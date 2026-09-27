import React, { memo, useCallback } from 'react';
import { useTheme } from '@/core/theme';
import { Pressable, Text } from '../primitives';

export type DateRangeSelecting = 'checkin' | 'checkout';

export interface DateTabProps {
  value: DateRangeSelecting;
  active: boolean;
  label: string;
  dateLabel: string;
  onSelect: (value: DateRangeSelecting) => void;
}

const DateTabComponent: React.FC<DateTabProps> = ({
  value,
  active,
  label,
  dateLabel,
  onSelect,
}) => {
  const { colors } = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  const textColor = active ? colors.text.onAccent : colors.text.primary;

  return (
    <Pressable
      flex={1}
      onPress={handlePress}
      py="sm"
      px="md"
      borderRadius="md"
      bg={active ? colors.interactive.main : undefined}
      borderColor={active ? undefined : colors.border.strong}
      borderWidth={active ? 'none' : 'hairline'}
      align="center"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} ${dateLabel}`}
    >
      <Text variant="caption" color={textColor}>
        {label}
      </Text>
      <Text variant="title" color={textColor} mt="xs">
        {dateLabel}
      </Text>
    </Pressable>
  );
};

export const DateTab = memo(DateTabComponent);
