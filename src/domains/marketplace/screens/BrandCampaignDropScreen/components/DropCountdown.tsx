import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Rocket } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { Timestamp } from '../../../types';
import { campaignDropClockParts } from '../../../utils/campaignDrop';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';
import type { CampaignDropMoment } from '../../../utils/campaignDrop';

const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });
/** Keeps the three cells the same width while the seconds change. */
const CELL_MIN_WIDTH = moderateScale(72);

export interface DropCountdownProps {
  moment: CampaignDropMoment;
  endsAt: Timestamp;
  /** While the live link is next: the drop itself, as the secondary line. */
  then: Timestamp | null;
}

const Cell = memo<{ value: string; unit: string; big: boolean }>(({ value, unit, big }) => {
  const { colors } = useTheme();
  return (
    <Box align="center" minWidth={big ? undefined : CELL_MIN_WIDTH}>
      <Text variant={big ? 'amountHero' : 'amountDisplay'} color={colors.text.onBrand} writingDirection="ltr">
        {value}
      </Text>
      <Text variant="caption" color={colors.text.onBrandMuted}>
        {unit}
      </Text>
    </Box>
  );
});

const Separator = memo<{ big: boolean }>(({ big }) => {
  const { colors } = useTheme();
  return (
    <Text variant={big ? 'amountHero' : 'amountDisplay'} color={colors.text.onBrandMuted} writingDirection="ltr">
      :
    </Text>
  );
});

/** The room's big clock: the next moment ticking down by the second, the drop as a smaller line under it. */
const DropCountdownComponent: React.FC<DropCountdownProps> = ({ moment, endsAt, then }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const seconds = useCountdown(endsAt);
  const parts = campaignDropClockParts(seconds);
  const withDays = parts.days > 0;
  const styles = useStyles(
    ({ spacing }): Record<'clock', ViewStyle> => ({
      // The digits read left to right in both languages, whatever the layout direction.
      clock: { direction: 'ltr', alignItems: 'flex-start', justifyContent: 'center', columnGap: spacing.xs },
    }),
  );
  const label = t(moment === 'drop' ? 'marketplace.campaign.drop.hero.untilDrop' : 'marketplace.campaign.drop.hero.untilPublishOpen');
  const spoken = `${label} ${parts.days ? `${formatNumber(parts.days)} ${t('marketplace.campaign.drop.hero.units.days')} ` : ''}${formatNumber(parts.hours)} ${t('marketplace.campaign.drop.hero.units.hours')} ${formatNumber(parts.minutes)} ${t('marketplace.campaign.drop.hero.units.minutes')}`;

  return (
    <Box align="center" gap="xs" accessible accessibilityRole="timer" accessibilityLabel={spoken}>
      <Text variant="bodySmall" color={colors.text.onBrandMuted}>
        {label}
      </Text>
      <Box row style={styles.clock}>
        {withDays ? (
          <>
            <Cell value={formatNumber(parts.days)} unit={t('marketplace.campaign.drop.hero.units.days')} big />
            <Separator big={withDays} />
          </>
        ) : null}
        <Cell value={pad(parts.hours)} unit={t('marketplace.campaign.drop.hero.units.hours')} big={withDays} />
        <Separator big={withDays} />
        <Cell value={pad(parts.minutes)} unit={t('marketplace.campaign.drop.hero.units.minutes')} big={withDays} />
        <Separator big={withDays} />
        <Cell value={pad(parts.seconds)} unit={t('marketplace.campaign.drop.hero.units.seconds')} big={withDays} />
      </Box>
      {then !== null ? (
        <Box
          row
          align="center"
          gap="sm"
          px="md"
          py="xs"
          borderRadius="full"
          bg={colors.glass.fill}
          borderWidth="thin"
          borderColor={colors.glass.border}
        >
          <Rocket size={sizes.icon.xs} color={colors.text.onBrand} strokeWidth={iconStroke.bold} />
          <Text variant="caption" color={colors.text.onBrand}>
            {t('marketplace.campaign.drop.hero.then', { at: formatCampaignDateTime(then) })}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export const DropCountdown = memo(DropCountdownComponent);
