import React, { memo, useCallback } from 'react';
import { Check, Minus } from 'lucide-react-native';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  /** "Some selected" state of a select-all box; pressing it checks everything. */
  indeterminate?: boolean;
  disabled?: boolean;
  error?: string;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  indeterminate = false,
  disabled = false,
  error,
}) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(
    () => onChange(indeterminate ? true : !checked),
    [checked, indeterminate, onChange],
  );
  const filled = checked || indeterminate;
  const Mark = indeterminate ? Minus : Check;
  const borderColor = error
    ? colors.form.input.borderError
    : filled
    ? colors.interactive.main
    : colors.border.strong;

  return (
    <Box gap="xs">
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        row
        align="center"
        gap="md"
        minHeight={sizes.button.md}
        opacity={disabled ? opacity.disabled : 1}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityState={{
          checked: indeterminate ? 'mixed' : checked,
          disabled,
        }}
      >
        <Box
          width={sizes.control.md}
          height={sizes.control.md}
          borderRadius="xs"
          borderWidth="sm"
          borderColor={borderColor}
          bg={filled ? colors.interactive.main : colors.surface.main}
          align="center"
          justify="center"
        >
          {filled ? (
            <Mark
              size={sizes.icon.xs}
              color={colors.text.onAccent}
              strokeWidth={iconStroke.bold}
            />
          ) : null}
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="body">{label}</Text>
          {description ? (
            <Text variant="caption" color={colors.text.secondary}>
              {description}
            </Text>
          ) : null}
        </Box>
      </Pressable>
      {error ? (
        <Text
          variant="caption"
          color={colors.form.input.error}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

export const Checkbox = memo(CheckboxComponent);
