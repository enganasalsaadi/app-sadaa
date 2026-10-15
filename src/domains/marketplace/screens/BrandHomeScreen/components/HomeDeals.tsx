import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Pressable, StaggerIn, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { DealsCalmCard } from './DealsCalmCard';
import { DealsWelcome } from './DealsWelcome';
import { DealTrackList } from './DealTrackList';
import { HomeDealsSkeleton } from './HomeDealsSkeleton';
import { NextStepDeck } from './NextStepDeck';

type HomeDealsProps = Pick<BrandHomeScreenModel, 'deals' | 'openDeal' | 'openDeals' | 'browseAll'>;

/** Section title; the line under it counts what waits on the brand (amber) and what doesn't. */
const DealsHeading = memo<{ waiting: number; moving: number; onSeeAll?: () => void }>(
  ({ waiting, moving, onSeeAll }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const waitingText = waiting > 0 ? t('marketplace.brandHome.deals.waiting', { count: waiting }) : null;
    const movingText = moving > 0 ? t('marketplace.brandHome.deals.moving', { count: moving }) : null;
    return (
      <Box row align="flex-end" justify="space-between" gap="md" px="xl">
        <Box flex={1}>
          <Text variant="h4" accessibilityRole="header">
            {t('marketplace.brandHome.deals.title')}
          </Text>
          {waitingText || movingText ? (
            <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
              {waitingText ? (
                <Text variant="buttonSmall" color={colors.status.warning.text}>
                  {waitingText}
                </Text>
              ) : null}
              {waitingText && movingText ? ' · ' : null}
              {movingText}
            </Text>
          ) : null}
        </Box>
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            minHeight={sizes.button.md}
            justify="center"
            hitSlop={sizes.hitSlop.sm}
            accessibilityRole="button"
          >
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t('marketplace.brandHome.deals.seeAll')}
            </Text>
          </Pressable>
        ) : null}
      </Box>
    );
  },
);

/**
 * «Your deals» on Brand Home, two layers: on top the one thing waiting on the brand (a card
 * per deal, swipe for the next) or a calm «all smooth» card; under it every other open deal on
 * its tracker. A skeleton while Home loads, a welcome when no deal is open, nothing on error.
 */
const HomeDealsComponent: React.FC<HomeDealsProps> = ({ deals, openDeal, openDeals, browseAll }) => {
  switch (deals.kind) {
    case 'hidden':
      return null;
    case 'loading':
      return (
        <Box gap="md">
          <DealsHeading waiting={0} moving={0} />
          <HomeDealsSkeleton />
        </Box>
      );
    case 'welcome':
      return (
        <Box gap="md">
          <DealsHeading waiting={0} moving={0} />
          <DealsWelcome faces={deals.faces} onExplore={browseAll} />
        </Box>
      );
    case 'deals':
      return (
        <StaggerIn gap="xl">
          <Box gap="md">
            <DealsHeading
              waiting={deals.needsActionCount}
              moving={deals.movingCount}
              onSeeAll={openDeals}
            />
            {deals.waiting.length > 0 ? (
              <NextStepDeck deals={deals.waiting} onOpen={openDeal} />
            ) : (
              <DealsCalmCard />
            )}
          </Box>
          {deals.moving.length > 0 ? (
            <DealTrackList
              deals={deals.moving}
              onOpen={openDeal}
              moreCount={deals.moreCount}
              onSeeAll={openDeals}
            />
          ) : null}
        </StaggerIn>
      );
    default: {
      const _exhaustive: never = deals;
      return _exhaustive;
    }
  }
};

export const HomeDeals = memo(HomeDealsComponent);
