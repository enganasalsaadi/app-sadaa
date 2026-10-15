import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { CreatorDealSummary } from '../../../types';

const BADGE = moderateScale(24);
const CHIP_MIN = moderateScale(44);

type ChipTone = 'info' | 'warning' | 'danger';

interface CountChipProps {
  count: number;
  label: string;
  tone: ChipTone;
  onPress: () => void;
}

const CountChip = memo<CountChipProps>(({ count, label, tone, onPress }) => {
  const { colors } = useTheme();
  const hue = colors.status[tone];
  return (
    <Pressable
      row
      align="center"
      gap="sm"
      pe="md"
      ps="sm"
      minHeight={CHIP_MIN}
      borderRadius="full"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatNumber(count)} ${label}`}
    >
      <Box
        minWidth={BADGE}
        height={BADGE}
        px="xs"
        borderRadius="full"
        bg={hue.soft}
        align="center"
        justify="center"
      >
        <Text variant="buttonSmall" color={hue.text}>
          {formatNumber(count)}
        </Text>
      </Box>
      <Text variant="buttonSmall">{label}</Text>
    </Pressable>
  );
});

interface DealCountChipsProps {
  counts: CreatorDealSummary['counts'];
  onOpenDeals: () => void;
  onOpenStrikes: () => void;
}

/** What else needs a look, one chip each and only when above 0: new offers, upsells waiting, live strikes. */
const DealCountChipsComponent: React.FC<DealCountChipsProps> = ({ counts, onOpenDeals, onOpenStrikes }) => {
  const { t } = useTranslation();
  const { newOffers, pendingUpsells, liveStrikes } = counts;
  if (newOffers + pendingUpsells + liveStrikes === 0) return null;

  return (
    <Box row wrap gap="sm" px="xl">
      {newOffers > 0 ? (
        <CountChip
          count={newOffers}
          label={t('marketplace.creatorHome.deals.chips.newOffers', { count: newOffers })}
          tone="info"
          onPress={onOpenDeals}
        />
      ) : null}
      {pendingUpsells > 0 ? (
        <CountChip
          count={pendingUpsells}
          label={t('marketplace.creatorHome.deals.chips.pendingUpsells', { count: pendingUpsells })}
          tone="warning"
          onPress={onOpenDeals}
        />
      ) : null}
      {liveStrikes > 0 ? (
        <CountChip
          count={liveStrikes}
          label={t('marketplace.creatorHome.deals.chips.liveStrikes', { count: liveStrikes })}
          tone="danger"
          onPress={onOpenStrikes}
        />
      ) : null}
    </Box>
  );
};

export const DealCountChips = memo(DealCountChipsComponent);
