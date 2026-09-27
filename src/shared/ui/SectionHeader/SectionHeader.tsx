import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface SectionHeaderAction {
  label: string;
  onPress: () => void;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Teal text link at the reading-end edge ("See all", "Edit"). */
  action?: SectionHeaderAction;
}

const SectionHeaderComponent: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const { colors, sizes } = useTheme();

  return (
    <Box row align="center" gap="md" minHeight={action ? sizes.button.md : undefined}>
      <Box flex={1} gap="xs">
        <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {action ? (
        <Pressable
          onPress={action.onPress}
          minHeight={sizes.button.md}
          justify="center"
          hitSlop={sizes.hitSlop.sm}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const SectionHeader = memo(SectionHeaderComponent);
