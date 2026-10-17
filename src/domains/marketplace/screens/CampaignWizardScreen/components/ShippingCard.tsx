import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealShippingMode } from '../../../types/deal';

interface ShippingCardProps {
  value: DealShippingMode;
  icon: LucideIcon;
  title: string;
  hint: string;
  selected: boolean;
  onChoose: (value: DealShippingMode) => void;
}

/** One answer to «does it include a product?»: a mark, the short answer and what it means. */
const ShippingCardComponent: React.FC<ShippingCardProps> = ({ value, icon: Icon, title, hint, selected, onChoose }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'mark', ViewStyle> => ({
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? colors.interactive.main : colors.surface.elevated,
      },
    }),
    [colors.interactive.main, colors.surface.elevated, selected, sizes.icon.xl],
  );
  const onPress = useCallback(() => onChoose(value), [onChoose, value]);

  return (
    <Pressable
      flex={1}
      align="center"
      gap="xs"
      px="xs"
      py="md"
      borderRadius="xl"
      borderWidth="md"
      borderColor={selected ? colors.interactive.main : colors.border.default}
      bg={selected ? colors.interactive.soft : colors.surface.main}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      accessibilityHint={hint}
    >
      <Box style={styles.mark}>
        <Icon size={sizes.icon.md} color={selected ? colors.button.primary.text : colors.icon.secondary} />
      </Box>
      <Text variant="bodyMedium" color={colors.text.primary} align="center">
        {title}
      </Text>
      <Text variant="caption" color={colors.text.tertiary} align="center">
        {hint}
      </Text>
    </Pressable>
  );
};

export const ShippingCard = memo(ShippingCardComponent);
