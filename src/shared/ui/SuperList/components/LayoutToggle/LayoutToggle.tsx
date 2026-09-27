import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutList, Grid2x2, Grid3x3 } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import { Pressable } from '../../../primitives/Pressable';
import type { ParseKeys } from 'i18next';
import type { ListLayout } from '../../types';

interface LayoutToggleProps {
  currentLayout: ListLayout;
  onLayoutChange: (layout: ListLayout) => void;
}

const LAYOUTS = [
  { layout: 'list', Icon: LayoutList, labelKey: 'common.layoutList' },
  { layout: 'grid-2', Icon: Grid2x2, labelKey: 'common.layoutGrid2' },
  { layout: 'grid-3', Icon: Grid3x3, labelKey: 'common.layoutGrid3' },
] as const satisfies ReadonlyArray<{
  layout: ListLayout;
  Icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  labelKey: ParseKeys;
}>;

export const LayoutToggle: React.FC<LayoutToggleProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box row gap="xs">
      {LAYOUTS.map(({ layout, Icon, labelKey }) => {
        const isActive = currentLayout === layout;
        return (
          <Pressable
            key={layout}
            onPress={() => onLayoutChange(layout)}
            accessibilityRole="button"
            accessibilityLabel={t(labelKey)}
            accessibilityState={{ selected: isActive }}
            hitSlop={sizes.hitSlop.sm}
            p="sm"
            borderRadius="md"
            bg={isActive ? colors.interactive.main : colors.surface.elevated}
          >
            <Icon
              size={sizes.icon.sm}
              color={isActive ? colors.text.onAccent : colors.icon.secondary}
              strokeWidth={iconStroke.regular}
            />
          </Pressable>
        );
      })}
    </Box>
  );
};
