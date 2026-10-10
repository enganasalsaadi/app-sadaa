import { useCallback, useEffect, useState } from 'react';
import type { ExploreFilters } from '../../../types/explore';
import {
  sanitizeDigits,
  toFilterDraft,
  type ExploreDraftFlag,
  type ExploreDraftList,
  type ExploreDraftText,
  type ExploreFilterDraft,
} from '../../../utils/exploreFilters';

const EMPTY_DRAFT = toFilterDraft({});

/**
 * Filter sheet working copy: starts from the applied filters each time the sheet opens and
 * reaches the list only on "Show results". Reset clears the draft, not the list.
 */
export const useExploreFilterDraft = (filters: ExploreFilters, visible: boolean) => {
  const [draft, setDraft] = useState<ExploreFilterDraft>(() => toFilterDraft(filters));
  const [allNiches, setAllNiches] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(toFilterDraft(filters));
      setAllNiches(false);
    }
  }, [filters, visible]);

  const setList = useCallback((key: ExploreDraftList, value: string[]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);

  const setText = useCallback((key: ExploreDraftText, text: string) => {
    setDraft(prev => ({ ...prev, [key]: sanitizeDigits(text) }));
  }, []);

  const setFlag = useCallback((key: ExploreDraftFlag, value: boolean) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);

  // Tapping the picked bucket again clears it ("any time").
  const toggleDelivery = useCallback((value: string) => {
    setDraft(prev => ({ ...prev, maxDeliveryDays: prev.maxDeliveryDays === value ? null : value }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_DRAFT), []);
  const showAllNiches = useCallback(() => setAllNiches(true), []);

  return { draft, setList, setText, setFlag, toggleDelivery, reset, allNiches, showAllNiches };
};
