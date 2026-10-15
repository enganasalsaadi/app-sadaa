import React, { memo } from 'react';
import { useClock } from '../hooks/useClock';
import type { DealRatingModel } from '../hooks/useDealRating';
import type { DealParty } from '../types';
import { DealRatingEnvelopesCard } from './DealRatingEnvelopesCard';
import { DealRatingInvite } from './DealRatingInvite';
import { DealRatingReveal } from './DealRatingReveal';
import { DealRatingSheet } from './DealRatingSheet';

/** The window runs in days; a minute is plenty for its clock. */
const TICK_MS = 60_000;

export interface DealRatingSectionProps {
  rating: DealRatingModel;
  /** The side being rated. */
  party: DealParty;
}

/**
 * The completed deal's mutual rating (P10, «الختم»): the invite while you haven't rated, the two
 * envelopes while one waits on the other or the reveal, both opened after it. The rating sheet
 * opens over the page from here.
 */
const DealRatingSectionComponent: React.FC<DealRatingSectionProps> = ({
  rating,
  party,
}) => {
  const now = useClock(TICK_MS);
  const { view } = rating;
  if (!view) return null;
  const name = party.name ?? '';

  const card = (() => {
    switch (view.stage) {
      case 'invite':
        return (
          <DealRatingInvite
            name={name}
            questions={view.criteria.length}
            theirsAnswered={view.theirs.answered}
            dueAt={view.dueAt}
            now={now}
            onStart={rating.open}
          />
        );
      case 'sealed':
      case 'closing':
        return (
          <DealRatingEnvelopesCard
            name={name}
            view={view}
            sentOverall={rating.sentOverall}
            now={now}
          />
        );
      case 'revealed':
        return (
          <DealRatingReveal
            name={name}
            view={view}
            mineOpen={rating.mineOpen}
            onToggleMine={rating.toggleMine}
          />
        );
      default: {
        const _exhaustive: never = view.stage;
        return _exhaustive;
      }
    }
  })();

  return (
    <>
      {card}
      <DealRatingSheet rating={rating} party={party} now={now} />
    </>
  );
};

export const DealRatingSection = memo(DealRatingSectionComponent);
