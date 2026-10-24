import React, { memo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, RatingMark, Text } from '@/shared/ui';
import { useClock } from '../hooks/useClock';
import type { Deal, DealRole } from '../types';
import type { DealStationView } from '../utils/dealStation';
import {
  dealTimeView,
  formatRemaining,
  type DealTimeView,
} from '../utils/dealTimer';
import { DealCampaignChip } from './DealCampaignChip';
import { DealFace } from './DealFace';
import { DealOrbit } from './DealOrbit';

const FACE = moderateScale(56);
const MINUTE = 60_000;
const SECONDS_PER_HOUR = 3600;
/** Under this the centre ticks as hours:minutes; above it reads in days. */
const CLOCK_MAX_SECONDS = 48 * SECONDS_PER_HOUR;
const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

export interface DealDetailHeroProps {
  deal: Deal;
  role: DealRole;
  station: DealStationView;
  selected: number;
  onSelect: (index: number) => void;
  /** Set on a linked deal: opens its campaign from the chip. */
  onOpenCampaign: ((campaignId: string) => void) | null;
}

/** The orbit's centre: the other side's face and the current window ticking down. */
const OrbitCore = memo<{
  deal: Deal;
  role: DealRole;
  station: DealStationView;
  view: DealTimeView;
}>(({ deal, role, station, view }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const left = useCountdown(view.kind === 'left' ? deal.dueAt : null);
  const party = role === 'brand' ? deal.creator : deal.brand;
  const clock =
    view.kind !== 'left'
      ? null
      : left < CLOCK_MAX_SECONDS
      ? `${formatNumber(Math.floor(left / SECONDS_PER_HOUR))}:${pad(
          Math.floor((left % SECONDS_PER_HOUR) / 60),
        )}`
      : formatRemaining(t, left);
  const caption =
    station.state === 'disputed'
      ? t('marketplace.deals.orbit.disputed')
      : station.state === 'done'
      ? t('marketplace.deals.orbit.done')
      : station.state === 'stopped'
      ? t('marketplace.deals.orbit.stopped')
      : view.kind === 'held'
      ? t('marketplace.deals.orbit.held')
      : view.kind === 'paused'
      ? t('marketplace.deals.orbit.paused')
      : view.kind === 'left'
      ? t('marketplace.deals.orbit.left')
      : null;

  return (
    <Box
      align="center"
      gap="xs"
      accessible
      accessibilityRole="timer"
      accessibilityLabel={[clock, caption].filter(Boolean).join(' ')}
    >
      <DealFace party={party} size={FACE} surface="brand" rim />
      {clock ? (
        <Text
          variant="amountTitle"
          color={colors.text.onBrand}
          writingDirection="ltr"
        >
          {clock}
        </Text>
      ) : null}
      {caption ? (
        <Text
          variant="caption"
          color={colors.text.onBrandMuted}
          numberOfLines={1}
        >
          {caption}
        </Text>
      ) : null}
    </Box>
  );
});

/**
 * Navy detail hero, transparent (Layout paints the live gradient and its lights, and the body
 * slides over it like every hero in the app): the other side's name (+ the brand's ★ for the
 * creator), the deal orbit with its
 * clock, then the server's status and the deal total.
 */
const DealDetailHeroComponent: React.FC<DealDetailHeroProps> = ({
  deal,
  role,
  station,
  selected,
  onSelect,
  onOpenCampaign,
}) => {
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const now = useClock(MINUTE);
  const view = dealTimeView(deal, now);
  const party = role === 'brand' ? deal.creator : deal.brand;
  // The brand's public score is sent to the creator only; the brand never sees its own here.
  const brandRating = role === 'creator' ? deal.brand.rating : null;

  const styles = useStyles(
    (): Record<'container' | 'titleRow' | 'name', ViewStyle> => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the back button and the two header actions.
      titleRow: {
        minHeight: sizes.iconButton.md,
        paddingStart: sizes.iconButton.md + spacing.sm,
        paddingEnd: sizes.iconButton.md * 2 + spacing.sm * 2,
      },
      name: { flexShrink: 1 },
    }),
    [sizes.iconButton.md, spacing.sm, top],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="lg">
      <Box row align="center" gap="sm" style={styles.titleRow}>
        <Box style={styles.name}>
          <Text
            variant="h4"
            color={colors.text.onBrand}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {party.name ?? ''}
          </Text>
        </Box>
        {brandRating ? (
          <RatingMark value={brandRating.average} count={brandRating.count} surface="onBrand" pill />
        ) : null}
      </Box>

      {deal.campaign ? (
        <DealCampaignChip campaign={deal.campaign} surface="hero" onOpen={onOpenCampaign ?? undefined} />
      ) : null}

      <DealOrbit
        stages={station.stages}
        state={station.state}
        selected={selected}
        onSelect={onSelect}
        windowShare={view.kind === 'left' ? view.share : null}
        windowWarn={view.kind === 'left' && view.late}
        // Wider than the hero's gutter (centred over it) so side names keep room off the ring.
        width={width - spacing.md * 2}
      >
        <OrbitCore deal={deal} role={role} station={station} view={view} />
      </DealOrbit>

      <Box row align="center" justify="space-between" gap="md">
        <Box
          alignSelf="flex-start"
          px="md"
          py="xs"
          borderRadius="full"
          bg={colors.glass.fill}
          borderWidth="thin"
          borderColor={colors.glass.border}
        >
          <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
            {deal.stage
              ? `${deal.status.label} · ${deal.stage.label}`
              : deal.status.label}
          </Text>
        </Box>
        <MoneyText value={deal.total} size="title" tone="onBrand" />
      </Box>
    </Box>
  );
};

export const DealDetailHero = memo(DealDetailHeroComponent);
