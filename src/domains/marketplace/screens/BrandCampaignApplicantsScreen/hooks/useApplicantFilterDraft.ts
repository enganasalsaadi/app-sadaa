import { useCallback, useEffect, useState } from 'react';
import { isApplicantStatusFilter } from '../../../constants/applicants';
import type { ApplicantFilters } from '../../../types/campaign';
import { DEFAULT_APPLICANT_FILTERS } from '../../../utils/applicants';

/**
 * Filter sheet working copy: starts from the applied filters each time the sheet opens and reaches
 * the list only on «Show results». Reset clears the draft, not the list (same as Explore).
 */
export const useApplicantFilterDraft = (filters: ApplicantFilters, visible: boolean) => {
  const [draft, setDraft] = useState<ApplicantFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  const set = useCallback(<K extends keyof ApplicantFilters>(key: K, value: ApplicantFilters[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);
  // Tapping the picked single-choice chip again clears it («any»).
  const toggleStatus = useCallback((value: string) => {
    setDraft(prev => ({
      ...prev,
      status: prev.status === value || !isApplicantStatusFilter(value) ? null : value,
    }));
  }, []);
  const toggleFloor = useCallback((value: string) => {
    setDraft(prev => ({ ...prev, minFollowers: prev.minFollowers === Number(value) ? null : Number(value) }));
  }, []);
  // The sort is not part of «reset»: it is an order, not a narrowing.
  const reset = useCallback(() => setDraft(prev => ({ ...DEFAULT_APPLICANT_FILTERS, sort: prev.sort })), []);

  return { draft, set, toggleStatus, toggleFloor, reset };
};
