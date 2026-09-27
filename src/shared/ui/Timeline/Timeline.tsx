import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Check, X } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'error';

export interface TimelineStep {
  key: string;
  title: string;
  /** Date, actor or note (audit trail line). Pre-formatted by the caller. */
  caption?: string;
  state: TimelineStepState;
}

export interface TimelineProps {
  steps: readonly TimelineStep[];
}

const STATE_LABEL = {
  done: 'common.timeline.done',
  current: 'common.timeline.current',
  upcoming: 'common.timeline.upcoming',
  error: 'common.timeline.error',
} as const satisfies Record<TimelineStepState, ParseKeys>;

const Marker = memo<{ state: TimelineStepState }>(({ state }) => {
  const { colors, sizes } = useTheme();
  const size = sizes.control.md;
  const icon = sizes.icon.xs;

  switch (state) {
    case 'done':
      return (
        <Box width={size} height={size} borderRadius="full" bg={colors.interactive.main} align="center" justify="center">
          <Check size={icon} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
        </Box>
      );
    case 'error':
      return (
        <Box width={size} height={size} borderRadius="full" bg={colors.status.danger.main} align="center" justify="center">
          <X size={icon} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
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
          <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.interactive.main} />
        </Box>
      );
    case 'upcoming':
      return (
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

const TimelineRow = memo<{ step: TimelineStep; last: boolean; lineDone: boolean }>(
  ({ step, last, lineDone }) => {
    const { t } = useTranslation();
    const { colors, spacing, borderWidths } = useTheme();
    const muted = step.state === 'upcoming';

    return (
      <Box
        row
        gap="md"
        accessible
        accessibilityLabel={[step.title, t(STATE_LABEL[step.state]), step.caption]
          .filter(Boolean)
          .join(', ')}
      >
        <Box align="center">
          <Marker state={step.state} />
          {last ? null : (
            <Box
              flex={1}
              width={borderWidths.md}
              minHeight={spacing.lg}
              my="xs"
              bg={lineDone ? colors.interactive.main : colors.border.default}
            />
          )}
        </Box>
        <Box flex={1} gap="xs" pb={last ? undefined : 'lg'}>
          <Text
            variant={step.state === 'current' ? 'bodyMedium' : 'body'}
            color={
              step.state === 'error'
                ? colors.status.danger.text
                : muted
                  ? colors.text.tertiary
                  : colors.text.primary
            }
          >
            {step.title}
          </Text>
          {step.caption ? (
            <Text variant="caption" color={colors.text.secondary}>
              {step.caption}
            </Text>
          ) : null}
        </Box>
      </Box>
    );
  },
);

/**
 * Vertical progress of a process with named stages (deal pipeline, activity log).
 * Wizard position → `StepProgress`; a continuous value → `ProgressBar`.
 */
const TimelineComponent: React.FC<TimelineProps> = ({ steps }) => (
  <Box>
    {steps.map((step, index) => (
      <TimelineRow
        key={step.key}
        step={step}
        last={index === steps.length - 1}
        lineDone={step.state === 'done'}
      />
    ))}
  </Box>
);

export const Timeline = memo(TimelineComponent);
