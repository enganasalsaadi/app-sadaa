import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { ChipGroupItem } from '@/shared/ui';
import { useListLayout } from '@/shared/ui';

const LIST_STATES = ['data', 'loading', 'empty', 'filteredEmpty', 'error'] as const;
type ListState = (typeof LIST_STATES)[number];

const STATE_LABEL_KEY = {
  data: 'devShowcase.listStates.data',
  loading: 'devShowcase.listStates.loading',
  empty: 'devShowcase.listStates.empty',
  filteredEmpty: 'devShowcase.listStates.filteredEmpty',
  error: 'devShowcase.listStates.error',
} as const satisfies Record<ListState, ParseKeys>;

const isListState = (value: string): value is ListState =>
  (LIST_STATES as readonly string[]).includes(value);

const MOCK_ROW_COUNT = 24;
/** Fake network latency for pull-to-refresh. */
const REFRESH_MS = 1200;

export interface MockListRow {
  id: string;
  index: number;
}

const MOCK_ROWS: MockListRow[] = Array.from(
  { length: MOCK_ROW_COUNT },
  (_, index) => ({
    id: `row-${index}`,
    index: index + 1,
  }),
);

export const useLayoutListStatesScreen = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<ListState>('data');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { layout, setLayout } = useListLayout();

  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  const stateItems = useMemo<ChipGroupItem[]>(
    () =>
      LIST_STATES.map(value => ({ value, label: t(STATE_LABEL_KEY[value]) })),
    [t],
  );

  const onChangeState = useCallback((value: string) => {
    if (isListState(value)) setState(value);
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshTimer.current = setTimeout(() => setIsRefreshing(false), REFRESH_MS);
  }, []);

  const onRetry = useCallback(() => setState('data'), []);

  // A filtered list that came back empty offers to clear its filters.
  const emptyAction = useMemo(
    () =>
      state === 'filteredEmpty'
        ? { label: t('devShowcase.listStates.clearFilters'), onPress: onRetry, variant: 'secondary' as const }
        : undefined,
    [onRetry, state, t],
  );

  return {
    state,
    stateItems,
    onChangeState,
    layout,
    setLayout,
    data: state === 'data' ? MOCK_ROWS : [],
    isLoading: state === 'loading',
    isError: state === 'error',
    isRefreshing,
    onRefresh,
    onRetry,
    emptyMessage: t(
      state === 'filteredEmpty'
        ? 'devShowcase.listStates.filteredEmptyMessage'
        : 'devShowcase.listStates.emptyMessage',
    ),
    emptyDescription:
      state === 'filteredEmpty' ? t('devShowcase.listStates.filteredEmptyHint') : undefined,
    emptyAction,
  };
};
