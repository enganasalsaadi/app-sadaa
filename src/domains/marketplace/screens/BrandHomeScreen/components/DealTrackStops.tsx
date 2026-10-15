import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import { DEAL_TRACK_STOP_LABEL, DEAL_TRACK_STOPS } from '../../../constants/brandHomeDeals';
import type { DealTrack } from '../../../utils/brandHomeDeals';

const DOT = moderateScale(10);
const NOW = moderateScale(14);
const NOW_CORE = moderateScale(6);
const LINE = moderateScale(3);

interface DealTrackStopsProps {
  track: DealTrack;
  /** Server status label: replaces the current stop's name when the deal is stopped. */
  stoppedLabel: string;
}

/**
 * Agree ← prepare ← publish ← done as dots on a line: the ones passed fill teal, the current
 * one is a ring that pulses (red and still for a dispute), names under them. Decorative to
 * screen readers: the row's label says the stage.
 */
const DealTrackStopsComponent: React.FC<DealTrackStopsProps> = ({ track, stoppedLabel }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const hot = track.stopped ? colors.status.danger.main : colors.interactive.main;
  const styles = useStyles(
    ({ colors: palette, borderWidths }): Record<'dot' | 'core' | 'line', ViewStyle> => ({
      dot: {
        width: DOT,
        height: DOT,
        borderRadius: DOT / 2,
        borderWidth: borderWidths.md,
      },
      core: {
        position: 'absolute',
        width: NOW_CORE,
        height: NOW_CORE,
        borderRadius: NOW_CORE / 2,
        backgroundColor: palette.surface.main,
      },
      line: { flex: 1, height: LINE, borderRadius: LINE / 2, marginHorizontal: 2 },
    }),
    [],
  );

  return (
    <Box accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box row align="center" mt="sm">
        {DEAL_TRACK_STOPS.map((stop, at) => {
          const passed = at < track.stop;
          const dot =
            at === track.stop ? (
              <Box width={NOW} height={NOW} align="center" justify="center">
                {track.stopped ? (
                  <Box width={NOW} height={NOW} borderRadius="full" bg={hot} />
                ) : (
                  <LiveDot color={hot} size={NOW} />
                )}
                <Box style={styles.core} />
              </Box>
            ) : (
              <Box
                style={styles.dot}
                bg={passed ? colors.interactive.main : colors.layout.base}
                borderColor={passed ? colors.interactive.main : colors.border.default}
              />
            );
          return (
            <React.Fragment key={stop}>
              {at > 0 ? (
                <Box
                  style={styles.line}
                  bg={at <= track.stop ? colors.interactive.main : colors.layout.base}
                />
              ) : null}
              {dot}
            </React.Fragment>
          );
        })}
      </Box>
      <Box row justify="space-between" mt="xs">
        {DEAL_TRACK_STOPS.map((stop, at) => {
          const now = at === track.stop;
          return (
            <Text
              key={stop}
              variant="caption"
              color={now ? (track.stopped ? colors.status.danger.text : colors.interactive.text) : colors.text.tertiary}
            >
              {now && track.stopped ? stoppedLabel : t(DEAL_TRACK_STOP_LABEL[stop])}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
};

export const DealTrackStops = memo(DealTrackStopsComponent);
