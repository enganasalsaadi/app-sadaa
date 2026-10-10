import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { push, type PublicStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useSetShortlistedMutation } from '../api/shortlistApi';
import type { ExploreCreator } from '../types/explore';

/**
 * Card taps shared by Home rails, Explore and the Shortlist: open the public Media Kit
 * (views beacon `src=search`) and toggle ❤️. The toggle is optimistic in every cached list.
 */
export const useCreatorCardActions = () => {
  const { t } = useTranslation();
  const [setShortlisted] = useSetShortlistedMutation();

  const openCreator = useCallback((creator: ExploreCreator) => {
    const params: PublicStackParamList['MediaKitPublic'] = {
      slug: creator.slug,
      source: 'search',
    };
    push('MediaKitPublic', params);
  }, []);

  // One request per creator at a time: a second tap waits for the first to settle.
  const inFlight = useRef(new Set<string>());
  /** Resolves `true` once the server took the change; failures toast and resolve `false`. */
  const setShortlist = useCallback(
    async (creator: ExploreCreator, shortlisted: boolean) => {
      const { slug } = creator;
      if (inFlight.current.has(slug)) return false;
      inFlight.current.add(slug);
      try {
        await setShortlisted({ card: creator, shortlisted }).unwrap();
        return true;
      } catch (error: unknown) {
        toastService.error(
          normalizeApiError(error).code === 'shortlist_full'
            ? t('marketplace.shortlist.full')
            : t('marketplace.shortlist.failed'),
        );
        return false;
      } finally {
        inFlight.current.delete(slug);
      }
    },
    [setShortlisted, t],
  );

  const toggleShortlist = useCallback(
    (creator: ExploreCreator) => {
      setShortlist(creator, !creator.isShortlisted);
    },
    [setShortlist],
  );

  return { openCreator, toggleShortlist, setShortlist };
};
