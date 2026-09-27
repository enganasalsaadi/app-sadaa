import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import type { SpacingToken } from '@/core/theme';
import { Box } from '../primitives/Box';

export type DividerVariant = 'default' | 'strong';

export interface DividerProps {
  vertical?: boolean;
  /** `strong` on `surface.elevated` backgrounds, where the default line disappears. */
  variant?: DividerVariant;
  /** Space on both sides of the line, along the stacking axis. */
  spacing?: SpacingToken;
  /** Indent from the reading-start edge (list rows with a leading icon). */
  inset?: SpacingToken;
}

const DividerComponent: React.FC<DividerProps> = ({
  vertical = false,
  variant = 'default',
  spacing,
  inset,
}) => {
  const { colors, borderWidths } = useTheme();
  const color = variant === 'strong' ? colors.border.strong : colors.border.default;

  return vertical ? (
    <Box
      width={borderWidths.hairline}
      alignSelf="stretch"
      bg={color}
      mx={spacing}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  ) : (
    <Box
      height={borderWidths.hairline}
      bg={color}
      my={spacing}
      ms={inset}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
};

export const Divider = memo(DividerComponent);
