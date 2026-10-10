import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { Check, X } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { LiveDot } from '../LiveDot';
import type { TimelineStepState } from './types';

export const STATE_LABEL = {
  done: 'common.timeline.done',
  current: 'common.timeline.current',
  upcoming: 'common.timeline.upcoming',
  error: 'common.timeline.error',
} as const satisfies Record<TimelineStepState, ParseKeys>;

/**
 * `size` defaults to the vertical timeline's marker; the track variant passes a larger node.
 * `number` (steps variant) labels an upcoming node with its position.
 */
export const TimelineMarker = memo<{
  state: TimelineStepState;
  size?: number;
  number?: number;
}>(({ state, size: sizeProp, number }) => {
  const { colors, sizes } = useTheme();
  const size = sizeProp ?? sizes.control.md;
  const icon = sizes.icon.xs;

  switch (state) {
    case 'done':
      return (
        <Box
          width={size}
          height={size}
          borderRadius="full"
          bg={colors.interactive.main}
          align="center"
          justify="center"
        >
          <Check
            size={icon}
            color={colors.text.onAccent}
            strokeWidth={iconStroke.bold}
          />
        </Box>
      );
    case 'error':
      return (
        <Box
          width={size}
          height={size}
          borderRadius="full"
          bg={colors.status.danger.main}
          align="center"
          justify="center"
        >
          <X
            size={icon}
            color={colors.text.onAccent}
            strokeWidth={iconStroke.bold}
          />
        </Box>
      );
    case 'current':
      return (
        <Box
          width={size}
          height={size}
          borderRadius="full"
          borderWidth="md"
          borderColor={colors.interactive.main}
          bg={colors.surface.main}
          align="center"
          justify="center"
        >
          <LiveDot color={colors.interactive.main} size={sizes.dot.md} />
        </Box>
      );
    case 'upcoming':
      return number !== undefined ? (
        <Box
          width={size}
          height={size}
          borderRadius="full"
          bg={colors.brand.soft}
          align="center"
          justify="center"
        >
          <Text variant="caption" color={colors.brand.text}>
            {number}
          </Text>
        </Box>
      ) : (
        <Box
          width={size}
          height={size}
          borderRadius="full"
          borderWidth="md"
          borderColor={colors.border.strong}
          bg={colors.surface.main}
        />
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
});
