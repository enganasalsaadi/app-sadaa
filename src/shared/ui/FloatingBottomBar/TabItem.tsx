import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Pressable, Text } from '../primitives';

interface TabItemProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

/** Stacked icon + label; the active tab is marked by color alone (rule 08). */
const TabItemComponent: React.FC<TabItemProps> = ({
  isActive,
  label,
  icon,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      flex={1}
      align="center"
      justify="center"
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      {icon}
      <Text
        variant="caption"
        mt="xs"
        numberOfLines={1}
        color={
          isActive
            ? colors.navigation.tabBar.active
            : colors.navigation.tabBar.inactive
        }
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const TabItem = memo(TabItemComponent);
