import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type StatusPillSize = 'sm' | 'md';

export interface StatusPillProps {
  label: string;
  tone: HueTone;
  /** Replaces the dot. Status is never color-only: the label always shows (rule 08). */
  icon?: LucideIcon;
  size?: StatusPillSize;
}

/** Soft bg + `text` label + `main` dot. Domain maps (`DealStatus` → tone) live in the domain. */
const StatusPillComponent: React.FC<StatusPillProps> = ({
  label,
  tone,
  icon: Icon,
  size = 'md',
}) => {
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, tone);

  return (
    <Box
      row
      align="center"
      alignSelf="flex-start"
      gap="xs"
      px={size === 'sm' ? 'sm' : 'md'}
      py="xs"
      borderRadius="full"
      bg={hue.soft}
      accessible
      accessibilityLabel={label}
    >
      {Icon ? (
        <Icon size={sizes.icon.xs} color={hue.main} strokeWidth={iconStroke.bold} />
      ) : (
        <Box
          width={size === 'sm' ? sizes.dot.sm : sizes.dot.md}
          height={size === 'sm' ? sizes.dot.sm : sizes.dot.md}
          borderRadius="full"
          bg={hue.main}
        />
      )}
      <Text variant={size === 'sm' ? 'caption' : 'bodySmall'} color={hue.text}>
        {label}
      </Text>
    </Box>
  );
};

export const StatusPill = memo(StatusPillComponent);
