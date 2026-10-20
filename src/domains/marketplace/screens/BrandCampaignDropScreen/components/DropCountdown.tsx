import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { Timestamp } from '../../../types';
import { campaignDropClockParts } from '../../../utils/campaignDrop';
import type { CampaignDropMoment } from '../../../utils/campaignDrop';

const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });
const LABEL_WIDTH = moderateScale(76);
const TILE_HEIGHT = moderateScale(64);

export interface DropCountdownProps {
  moment: CampaignDropMoment;
  endsAt: Timestamp;
}

const Tile = memo<{ value: string; unit: string }>(({ value, unit }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'tile', ViewStyle> => ({
      tile: {
        flex: 1,
        height: TILE_HEIGHT,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.fill,
        borderWidth: 1,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.border, colors.glass.fill],
  );
  return (
    <Box style={styles.tile}>
      <Text variant="amountTitle" color={colors.text.onBrand} writingDirection="ltr">
        {value}
      </Text>
      <Text variant="caption" color={colors.text.onBrandMuted}>
        {unit}
      </Text>
    </Box>
  );
});

/** The room's clock: the next moment ticking down by the second in small tiles, the days one only when there are any. */
const DropCountdownComponent: React.FC<DropCountdownProps> = ({ moment, endsAt }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const seconds = useCountdown(endsAt);
  const parts = campaignDropClockParts(seconds);
  const styles = useStyles(
    ({ spacing }): Record<'tiles', ViewStyle> => ({
      // The digits read left to right in both languages, whatever the layout direction.
      tiles: { flex: 1, flexDirection: 'row', direction: 'ltr', columnGap: spacing.xs },
    }),
  );
  const label = t(moment === 'drop' ? 'marketplace.campaign.drop.hero.untilDrop' : 'marketplace.campaign.drop.hero.untilPublishOpen');
  const spoken = `${label} ${parts.days ? `${formatNumber(parts.days)} ${t('marketplace.campaign.drop.hero.units.days')} ` : ''}${formatNumber(parts.hours)} ${t('marketplace.campaign.drop.hero.units.hours')} ${formatNumber(parts.minutes)} ${t('marketplace.campaign.drop.hero.units.minutes')}`;

  return (
    <Box row align="center" gap="md" accessible accessibilityRole="timer" accessibilityLabel={spoken}>
      <Box width={LABEL_WIDTH}>
        <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={2}>
          {label}
        </Text>
      </Box>
      <Box style={styles.tiles}>
        {parts.days > 0 ? <Tile value={formatNumber(parts.days)} unit={t('marketplace.campaign.drop.hero.units.days')} /> : null}
        <Tile value={pad(parts.hours)} unit={t('marketplace.campaign.drop.hero.units.hours')} />
        <Tile value={pad(parts.minutes)} unit={t('marketplace.campaign.drop.hero.units.minutes')} />
        <Tile value={pad(parts.seconds)} unit={t('marketplace.campaign.drop.hero.units.seconds')} />
      </Box>
    </Box>
  );
};

export const DropCountdown = memo(DropCountdownComponent);
