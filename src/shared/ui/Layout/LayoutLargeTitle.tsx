import React, { memo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/core/theme';
import type { SpacingToken } from '@/core/theme/types';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

interface LayoutLargeTitleProps {
  title: string;
  subtitle?: string;
  paddingX: SpacingToken | undefined;
  paddingY: SpacingToken | undefined;
  onLayout: (event: LayoutChangeEvent) => void;
}

/** `headerBehavior="collapse"`: the big title that scrolls away into the bar. */
const LayoutLargeTitleComponent: React.FC<LayoutLargeTitleProps> = ({
  title,
  subtitle,
  paddingX,
  paddingY,
  onLayout,
}) => {
  const { colors } = useTheme();

  return (
    <Box px={paddingX} pt={paddingY} gap="xs" onLayout={onLayout}>
      <Text variant="h2" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" color={colors.text.secondary}>
          {subtitle}
        </Text>
      ) : null}
    </Box>
  );
};

export const LayoutLargeTitle = memo(LayoutLargeTitleComponent);
