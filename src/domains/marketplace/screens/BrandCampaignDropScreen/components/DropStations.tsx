import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignDropPhase } from '../../../types/campaignDrop';
import { CAMPAIGN_DROP_STATION } from '../../../utils/campaignDrop';

const STATIONS = ['open', 'drop', 'live'] as const;
type Station = (typeof STATIONS)[number];

const STATION_LABEL = {
  open: 'marketplace.campaign.drop.hero.stations.open',
  drop: 'marketplace.campaign.drop.hero.stations.drop',
  live: 'marketplace.campaign.drop.hero.stations.live',
} as const satisfies Record<Station, ParseKeys>;

const NODE = moderateScale(28);
const LABEL_WIDTH = moderateScale(80);
const TRACK = moderateScale(3);
/** The track runs from the middle of the first label to the middle of the last. */
const FILL = { upcoming: '0%', publish_open: '50%', live: '100%' } as const satisfies Record<CampaignDropPhase, string>;

export interface DropStationsProps {
  phase: CampaignDropPhase;
}

/** The three stations of the drop (link opens → the drop → on air) with the light on the one it is at. */
const DropStationsComponent: React.FC<DropStationsProps> = ({ phase }) => {
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
        backgroundColor: colors.glass.progressTrack,
      },
      fill: {
        position: 'absolute',
        top: 0,
        start: 0,
        width: FILL[phase],
        height: TRACK,
        borderRadius: radii.xs,
        backgroundColor: colors.glass.progressFill,
      },
    }),
    [colors.glass.progressFill, colors.glass.progressTrack, phase],
  );

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
              bg={done ? colors.glass.iconInteractive : colors.glass.badge}
              borderWidth="md"
              borderColor={done || now ? colors.glass.iconInteractive : colors.glass.border}
            >
              {done ? (
                <Check size={sizes.icon.xs} color={colors.glass.onIconInteractive} strokeWidth={iconStroke.bold} />
              ) : now ? (
                <Box width={sizes.dot.md} height={sizes.dot.md} borderRadius="full" bg={colors.glass.iconInteractive} />
              ) : null}
            </Box>
            <Text variant="caption" color={done || now ? colors.text.onBrand : colors.text.onBrandMuted} align="center">
              {t(STATION_LABEL[station])}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export const DropStations = memo(DropStationsComponent);
