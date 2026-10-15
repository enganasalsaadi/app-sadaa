import React, { memo } from 'react';
import { Box, StaggerIn } from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { ActionDeck } from './ActionDeck';
import { DealCountChips } from './DealCountChips';
import { DealsHeading } from './DealsHeading';
import { DealsQuiet } from './DealsQuiet';
import { DealsSkeleton } from './DealsSkeleton';
import { DealsWelcome } from './DealsWelcome';

type HomeDealsProps = Pick<CreatorHomeScreenModel, 'homeDeals' | 'openRates' | 'openPlatforms'>;

/**
 * «Your turn» on Creator Home: the deals waiting on the creator as a deck of cards, the other
 * counts as chips, a calm card when nothing waits and a welcome before the first offer. A
 * skeleton while it loads; nothing on error (the rest of Home still works).
 */
const HomeDealsComponent: React.FC<HomeDealsProps> = ({ homeDeals, openRates, openPlatforms }) => {
  const { deals, counts, openDeal, openDeals, openStrikes } = homeDeals;
  switch (deals.kind) {
    case 'hidden':
      return null;
    case 'loading':
      return <DealsSkeleton />;
    case 'welcome':
      return (
        <Box gap="md">
          <DealsHeading waiting={0} moving={0} />
          <DealsWelcome onSetRates={openRates} onLinkPlatforms={openPlatforms} />
        </Box>
      );
    case 'quiet':
      return (
        <StaggerIn gap="md">
          <DealsHeading waiting={0} moving={deals.totalCount} onSeeAll={openDeals} />
          <DealsQuiet nextUp={deals.nextUp} />
          {counts ? <DealCountChips counts={counts} onOpenDeals={openDeals} onOpenStrikes={openStrikes} /> : null}
        </StaggerIn>
      );
    case 'deals':
      return (
        <StaggerIn gap="md">
          <DealsHeading waiting={deals.needsActionCount} moving={deals.movingCount} onSeeAll={openDeals} />
          <ActionDeck deals={deals.waiting} onOpen={openDeal} />
          {counts ? <DealCountChips counts={counts} onOpenDeals={openDeals} onOpenStrikes={openStrikes} /> : null}
        </StaggerIn>
      );
    default: {
      const _exhaustive: never = deals;
      return _exhaustive;
    }
  }
};

export const HomeDeals = memo(HomeDealsComponent);
