import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { Timestamp } from '../../../types';
import type { CampaignDropPhase } from '../../../types/campaignDrop';
import { CAMPAIGN_DROP_STATION } from '../../../utils/campaignDrop';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

const STATIONS = ['open', 'drop', 'live'] as const;
type Station = (typeof STATIONS)[number];

const STATION_LABEL = {
  open: 'marketplace.campaign.drop.hero.stations.open',
  drop: 'marketplace.campaign.drop.hero.stations.drop',
  live: 'marketplace.campaign.drop.hero.stations.live',
} as const satisfies Record<Station, ParseKeys>;

const NODE = moderateScale(28);
const LABEL_WIDTH = moderateScale(96);
const TRACK = moderateScale(3);
/** The track runs from the middle of the first label to the middle of the last. */
const FILL = { upcoming: '0%', publish_open: '50%', live: '100%' } as const satisfies Record<CampaignDropPhase, string>;

export interface DropStationsProps {
  phase: CampaignDropPhase;
  openAt: Timestamp;
  dropAt: Timestamp;
}

/** The three stations of the drop (link opens → the drop → on air), each with its time, the light on the one it is at. */
const DropStationsComponent: React.FC<DropStationsProps> = ({ phase, openAt, dropAt }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const at = CAMPAIGN_DROP_STATION[phase];
  const styles = useStyles(
    ({ radii }): Record<'track' | 'fill', ViewStyle> => ({
      track: {
        position: 'absolute',
        top: (NODE - TRACK) / 2,
        start: LABEL_WIDTH / 2,
        end: LABEL_WIDTH / 2,
        height: TRACK,
        borderRadius: radii.xs,
        backgroundColor: colors.border.default,
      },
      fill: {
        position: 'absolute',
        top: 0,
        start: 0,
        width: FILL[phase],
        height: TRACK,
        borderRadius: radii.xs,
        backgroundColor: colors.interactive.main,
      },
    }),
    [colors.border.default, colors.interactive.main, phase],
  );
  const caption = (station: Station): string =>
    station === 'open'
      ? formatCampaignDateTime(openAt)
      : station === 'drop'
        ? formatCampaignDateTime(dropAt)
        : t(phase === 'live' ? 'marketplace.campaign.drop.runway.now' : 'marketplace.campaign.drop.runway.afterDrop');

  return (
    <Box row justify="space-between">
      <Box style={styles.track}>
        <Box style={styles.fill} />
      </Box>
      {STATIONS.map((station, index) => {
        const done = index < at;
        const now = index === at;
        return (
          <Box key={station} width={LABEL_WIDTH} align="center" gap="xs">
            <Box
              width={NODE}
              height={NODE}
              borderRadius="full"
              align="center"
              justify="center"
              bg={done ? colors.interactive.main : colors.surface.main}
              borderWidth="md"
              borderColor={done || now ? colors.interactive.main : colors.border.default}
            >
              {done ? (
                <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
              ) : now ? (
                <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.interactive.main} />
              ) : null}
            </Box>
            <Box align="center">
              <Text variant="label" color={now ? colors.interactive.text : done ? colors.text.secondary : colors.text.tertiary} align="center">
                {t(STATION_LABEL[station])}
              </Text>
              <Text variant="caption" color={colors.text.tertiary} align="center">
                {caption(station)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export const DropStations = memo(DropStationsComponent);
