import React, { memo } from 'react';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { ActionDeck } from './ActionDeck';
import { DealsQuiet } from './DealsQuiet';
import { DealsSkeleton } from './DealsSkeleton';

type HomeTasksProps = Pick<CreatorHomeScreenModel, 'deck' | 'notice' | 'onStepStage'> & {
  onOpenDeal: (id: string) => void;
};

/**
 * The sheet's first section: what waits on the creator, as one deck (the blocker, the deals,
 * and before the first offer the storefront steps). A calm card when nothing waits; a skeleton
 * while the deals load; nothing before the first offer once every step is done (the deals
 * section below says what comes next).
 */
const HomeTasksComponent: React.FC<HomeTasksProps> = ({ deck, notice, onStepStage, onOpenDeal }) => {
  switch (deck.kind) {
    case 'loading':
      return <DealsSkeleton />;
    case 'tasks':
      return (
        <ActionDeck
          tasks={deck.tasks}
          welcome={deck.welcome}
          notice={notice}
          onOpenDeal={onOpenDeal}
          onStep={onStepStage}
        />
      );
    case 'quiet':
      return <DealsQuiet nextUp={deck.nextUp} />;
    case 'none':
      return null;
    default: {
      const _exhaustive: never = deck;
      return _exhaustive;
    }
  }
};

export const HomeTasks = memo(HomeTasksComponent);
