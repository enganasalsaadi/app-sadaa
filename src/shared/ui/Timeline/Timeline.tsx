import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { STATE_LABEL, TimelineMarker } from './TimelineMarker';
import { TimelineTrack } from './TimelineTrack';
import type { TimelineProps, TimelineStep } from './types';

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
          <TimelineMarker state={step.state} />
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
 * Progress of a process with named stages (deal pipeline, profile strength, activity log).
 * The current stage pulses (rule 09 §3.1). Wizard position → `StepProgress`; a
 * continuous value → `ProgressBar`.
 */
const TimelineComponent: React.FC<TimelineProps> = ({ steps, variant = 'vertical' }) =>
  variant === 'track' ? (
    <TimelineTrack steps={steps} />
  ) : (
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
