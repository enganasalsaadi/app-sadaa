import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, InlineError, Pressable, Text } from '@/shared/ui';

interface DateFieldButtonProps {
  icon: LucideIcon;
  /** The chosen date as words; the placeholder shows while it is empty. */
  value: string | null;
  placeholder: string;
  /** Muted words at the end («in 11 days», «Damascus time»). */
  caption?: string;
  error?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

/** A date that opens its sheet: reads like a field, presses like a button. */
const DateFieldButtonComponent: React.FC<DateFieldButtonProps> = ({
  icon: Icon,
  value,
  placeholder,
  caption,
  error,
  onPress,
  accessibilityLabel,
}) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'field', ViewStyle> => ({
      field: {
        minHeight: sizes.input.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        borderWidth: borderWidths.thin,
        borderColor: error ? colors.form.input.borderError : colors.border.default,
        backgroundColor: colors.form.input.background,
      },
    }),
    [colors.border.default, colors.form.input, error, sizes.input.lg],
  );

  return (
    <Box gap="xs">
      <Pressable
        style={styles.field}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: [value ?? placeholder, caption].filter(Boolean).join(', ') }}
      >
        <Icon size={sizes.icon.md} color={colors.interactive.main} />
        <Box flex={1}>
          <Text variant="body" color={value ? colors.text.primary : colors.form.input.placeholder} numberOfLines={1}>
            {value ?? placeholder}
          </Text>
        </Box>
        {caption ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {caption}
          </Text>
        ) : null}
      </Pressable>
      {error ? <InlineError error={error} /> : null}
    </Box>
  );
};

export const DateFieldButton = memo(DateFieldButtonComponent);
