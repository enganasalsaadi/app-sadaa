import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';

interface RadioMarkProps {
  selected: boolean;
}

/** The radio circle alone, shared by `Radio` and a selectable `ListRow`. */
const RadioMarkComponent: React.FC<RadioMarkProps> = ({ selected }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      width={sizes.control.md}
      height={sizes.control.md}
      borderRadius="full"
      borderWidth="sm"
      borderColor={selected ? colors.interactive.main : colors.border.strong}
      bg={colors.surface.main}
      align="center"
      justify="center"
    >
      {selected ? (
        <Box width={sizes.control.dot} height={sizes.control.dot} borderRadius="full" bg={colors.interactive.main} />
      ) : null}
    </Box>
  );
};

export const RadioMark = memo(RadioMarkComponent);
