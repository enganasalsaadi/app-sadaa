import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Divider, MoneyText, Pressable, SectionHeader, Skeleton, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import { DEAL_STATUS_META } from '../../../constants/dealStatus';
import { useClock } from '../../../hooks/useClock';
import type { CreatorActiveDeal } from '../../../types';
import { buildDealProgress } from '../../../utils/dealStatus';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';
import type { CreatorHomeDeals } from '../hooks/useCreatorHomeDeals';
import { DealsWelcome } from './DealsWelcome';

const FACE = moderateScale(44);
const TICK = moderateScale(4);
const ROW_MIN_HEIGHT = moderateScale(72);
const SKELETON_HEIGHT = moderateScale(232);
/** Home shows the first few; the deals tab has the rest. */
const MAX_ROWS = 3;
const MINUTE = 60_000;

/** The deal's journey as thin ticks: done teal, the current one half lit. */
const PhaseTicks = memo<{ deal: CreatorActiveDeal }>(({ deal }) => {
  const { colors } = useTheme();
  const status = deal.status.key;
  const steps = useMemo(
    () =>
      buildDealProgress({
        status,
        stage: deal.stage?.key ?? null,
        hasShipping: status !== null && DEAL_STATUS_META[status].phase === 'shipping',
      }),
    [deal.stage?.key, status],
  );
  if (steps.length === 0) return null;
  return (
    <Box row gap="xs" importantForAccessibility="no-hide-descendants">
      {steps.map(step => (
        <Box
          key={step.phase}
          flex={1}
          height={TICK}
          borderRadius="full"
          overflow="hidden"
          row
          bg={step.state === 'done' ? colors.interactive.main : colors.surface.elevated}
        >
          {step.state === 'current' || step.state === 'error' ? (
            <Box
              flex={1}
              bg={step.state === 'error' ? colors.status.danger.main : colors.interactive.main}
            />
          ) : null}
          {step.state === 'current' || step.state === 'error' ? <Box flex={1} /> : null}
        </Box>
      ))}
    </Box>
  );
});

const DealRow = memo<{ deal: CreatorActiveDeal; now: number; onOpen: (id: string) => void }>(
  ({ deal, now, onOpen }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const open = useCallback(() => onOpen(deal.id), [deal.id, onOpen]);
    const name = deal.brand.name ?? '';
    const status = deal.stage?.label ?? deal.status.label;
    const left = deal.dueAt !== null ? formatRemaining(t, timerSecondsLeft(deal.dueAt, now)) : null;

    return (
      <Pressable
        row
        align="center"
        gap="md"
        px="lg"
        py="md"
        minHeight={ROW_MIN_HEIGHT}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.creatorHome.running.rowA11y', {
          name: name || deal.title,
          status,
          price: formatMoney(deal.total),
        })}
      >
        <DealFace party={deal.brand} size={FACE} />
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" numberOfLines={1}>
            {name ? `${name} · ${deal.title}` : deal.title}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {status}
          </Text>
          <PhaseTicks deal={deal} />
        </Box>
        <Box align="flex-end" gap="xs">
          <MoneyText value={deal.total} size="sm" />
          {left ? (
            <Box px="sm" py="xs" borderRadius="full" bg={colors.surface.elevated}>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {t('marketplace.creatorHome.deals.left', { time: left })}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Pressable>
    );
  },
);

interface RunningDealsProps {
  deals: CreatorHomeDeals;
  onOpenDeal: (id: string) => void;
  onOpenDeals: () => void;
  onSetRates: () => void;
  onLinkPlatforms: () => void;
}

/**
 * The deals moving without the creator (the ball is with the brand): who, where it stands on the
 * journey, what it is worth and how long is left; the deals tab for the rest. Before the first
 * offer ever it turns into the «first offer on its way» card.
 */
const RunningDealsComponent: React.FC<RunningDealsProps> = ({
  deals,
  onOpenDeal,
  onOpenDeals,
  onSetRates,
  onLinkPlatforms,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const now = useClock(MINUTE);
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  switch (deals.kind) {
    case 'hidden':
      return null;
    case 'loading':
      return (
        <Box px="xl" accessibilityLabel={t('marketplace.creatorHome.running.loadingA11y')}>
          <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="xl" />
        </Box>
      );
    case 'welcome':
      return (
        <Box gap="md">
          <Box px="xl">
            <SectionHeader title={t('marketplace.creatorHome.running.welcomeTitle')} emphasis="strong" />
          </Box>
          <DealsWelcome onSetRates={onSetRates} onLinkPlatforms={onLinkPlatforms} />
        </Box>
      );
    case 'deals': {
      const rows = deals.moving.slice(0, MAX_ROWS);
      return (
        <Box gap="md">
          <Box px="xl">
            <SectionHeader
              title={t('marketplace.creatorHome.running.title')}
              subtitle={rows.length > 0 ? t('marketplace.creatorHome.running.subtitle') : undefined}
              emphasis="strong"
            />
          </Box>
          <Box mx="xl" borderRadius="xl" bg={colors.surface.main} shadow="card" overflow="hidden">
            {rows.length > 0 ? (
              rows.map((deal, index) => (
                <Box key={deal.id}>
                  {index > 0 ? <Divider /> : null}
                  <DealRow deal={deal} now={now} onOpen={onOpenDeal} />
                </Box>
              ))
            ) : (
              <Box px="lg" py="xl" align="center">
                <Text variant="bodySmall" color={colors.text.secondary} align="center">
                  {t('marketplace.creatorHome.running.empty')}
                </Text>
              </Box>
            )}
            <Divider />
            <Pressable
              row
              align="center"
              justify="center"
              gap="xs"
              minHeight={sizes.button.md}
              onPress={onOpenDeals}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.creatorHome.running.all', { count: deals.totalCount })}
            >
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {t('marketplace.creatorHome.running.all', { count: deals.totalCount })}
              </Text>
              <Chevron size={sizes.icon.sm} color={colors.interactive.text} />
            </Pressable>
          </Box>
        </Box>
      );
    }
    default: {
      const _exhaustive: never = deals;
      return _exhaustive;
    }
  }
};

export const RunningDeals = memo(RunningDealsComponent);
