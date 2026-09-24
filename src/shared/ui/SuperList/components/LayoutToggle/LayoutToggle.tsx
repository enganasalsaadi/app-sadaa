import React from 'react';
import { LayoutList, Grid2x2, Grid3x3 } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import { Pressable } from '../../../primitives/Pressable';
import type { ListLayout } from '../../types';

interface LayoutToggleProps {
  currentLayout: ListLayout;
  onLayoutChange: (layout: ListLayout) => void;
}

const LAYOUTS: Array<{ layout: ListLayout; Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }> }> = [
  { layout: 'list', Icon: LayoutList },
  { layout: 'grid-2', Icon: Grid2x2 },
  { layout: 'grid-3', Icon: Grid3x3 },
];

export const LayoutToggle: React.FC<LayoutToggleProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  const { colors } = useTheme();

  return (
    <Box row gap="xs">
      {LAYOUTS.map(({ layout, Icon }) => {
        const isActive = currentLayout === layout;
        return (
          <Pressable
            key={layout}
            onPress={() => onLayoutChange(layout)}
            p="sm"
            borderRadius="md"
            bg={isActive ? colors.interactive.main : colors.surface.elevated}
          >
            <Icon
              size={moderateScale(17)}
              color={isActive ? colors.text.onAccent : colors.icon.secondary}
              strokeWidth={2}
            />
          </Pressable>
        );
      })}
    </Box>
  );
};
