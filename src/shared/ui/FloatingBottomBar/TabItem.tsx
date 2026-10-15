import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '../primitives';
import { TabBadge } from './TabBadge';

interface TabItemProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  /** Amber count on the icon; 0 = none. */
  badge: number;
  /** Spoken label (the count included); defaults to `label`. */
  accessibilityLabel?: string;
  onPress: () => void;
}

/** Stacked icon + label; the active tab is teal over the bar's liquid lens (rule 08). */
const TabItemComponent: React.FC<TabItemProps> = ({
  isActive,
  label,
  icon,
  badge,
  accessibilityLabel,
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
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Box>
        {icon}
        <TabBadge count={badge} />
      </Box>
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
