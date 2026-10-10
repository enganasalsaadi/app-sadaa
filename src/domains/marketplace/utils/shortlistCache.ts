import type { ExploreCreator } from '../types/explore';

/** Flips ❤️ on every copy of the creator in a cached list (Immer draft). */
export const setShortlistedIn = (cards: ExploreCreator[], slug: string, shortlisted: boolean) => {
  for (const card of cards) {
    if (card.slug === slug) {
      card.isShortlisted = shortlisted;
    }
  }
};
