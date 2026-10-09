import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ListFilter, Wallet } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import type { WalletStackScreenProps } from '@/core/navigation';
import type { RadioGroupItem } from '@/shared/ui';
import { useGetWalletTransactionsInfiniteQuery } from '../../../api/walletApi';
import {
  STATEMENT_PERIOD_LABEL,
  STATEMENT_PERIOD_PRESETS,
  STATEMENT_TYPE_FILTERS,
  WALLET_ROLE_COPY,
  type StatementPeriodPreset,
} from '../../../constants';
import { useAmountsHidden } from '../../../hooks/useAmountsHidden';
import type { WalletRole, WalletTransactionType } from '../../../types';
import {
  ALL_TIME,
  resolvePeriodSpan,
  toStatementFilters,
  type DateSpan,
  type StatementPeriod,
} from '../../../utils/statementPeriods';
import { groupLinesByDay, type LedgerDay } from '../../../utils/walletDates';

type Navigation = WalletStackScreenProps<'Statement'>['navigation'];

/** One list item: a day card, the loading-more placeholder, or the end-of-statement caption. */
export type StatementItem =
  | { kind: 'day'; key: string; day: LedgerDay }
  | { kind: 'more'; key: 'more' }
  | { kind: 'end'; key: 'end' };

/** Radio values in the date sheet ("custom" is its own row below them). */
export type PeriodOption = 'all' | StatementPeriodPreset;

export interface TypeChip {
  value: string;
  label: string;
}

const ALL_TYPES = 'all';
const MORE_ITEM: StatementItem = { kind: 'more', key: 'more' };
const END_ITEM: StatementItem = { kind: 'end', key: 'end' };
const MONTH: Intl.DateTimeFormatOptions = { month: 'long' };
const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
const YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' };
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
const DAY_MONTH_YEAR: Intl.DateTimeFormatOptions = { ...DAY_MONTH, year: 'numeric' };

/**
 * Statement, both roles: every line newest first, grouped by day across all loaded pages,
 * filtered by one type (role chips) and a period (date sheet). Shares the wallet's eye.
 */
export const useStatementScreen = (role: WalletRole) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const { hidden, toggleHidden } = useAmountsHidden();

  const [type, setType] = useState<WalletTransactionType | null>(null);
  const [period, setPeriod] = useState<StatementPeriod>(ALL_TIME);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // The clock is read when a filter changes, so the cache key stays put between renders.
  const filters = useMemo(() => toStatementFilters(type, period, new Date()), [type, period]);
  const query = useGetWalletTransactionsInfiniteQuery(filters);
  const { currentData, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    query;

  // `currentData` (not `data`): a new filter shows its skeleton, not the previous filter's lines.
  const pages = currentData?.pages;
  const lines = useMemo(() => pages?.flatMap(page => page.items) ?? [], [pages]);
  const total = pages?.[0]?.meta.total ?? null;
  const days = useMemo(() => groupLinesByDay(lines, new Date()), [lines]);

  const items = useMemo<StatementItem[]>(() => {
    const dayItems = days.map<StatementItem>(day => ({ kind: 'day', key: day.key, day }));
    if (dayItems.length === 0) return dayItems;
    if (isFetchingNextPage) return [...dayItems, MORE_ITEM];
    return hasNextPage ? dayItems : [...dayItems, END_ITEM];
  }, [days, hasNextPage, isFetchingNextPage]);

  const hasFilters = type !== null || period.kind !== 'all';

  // ── Type chips ────────────────────────────────────────────────────────────
  const typeChips = useMemo<TypeChip[]>(
    () => [
      { value: ALL_TYPES, label: t('finance.statement.types.all') },
      ...STATEMENT_TYPE_FILTERS[role].map(filter => ({ value: filter.type, label: t(filter.label) })),
    ],
    [role, t],
  );

  const onSelectType = useCallback(
    (value: string) => {
      const picked = STATEMENT_TYPE_FILTERS[role].find(filter => filter.type === value);
      setType(picked ? picked.type : null);
    },
    [role],
  );

  // ── Period ────────────────────────────────────────────────────────────────
  const formatSpan = useCallback(
    (span: DateSpan, unit: 'day' | 'month'): string => {
      const thisYear = new Date().getFullYear();
      const sameYear = span.from.getFullYear() === span.to.getFullYear();
      const pick = (withYear: boolean) =>
        unit === 'day' ? (withYear ? DAY_MONTH_YEAR : DAY_MONTH) : withYear ? MONTH_YEAR : MONTH;
      // The year shows once at the end, and on the start too when the range crosses years.
      const toLabel = formatDate(span.to, pick(span.to.getFullYear() !== thisYear), lang);
      const fromLabel = formatDate(span.from, pick(!sameYear), lang);
      return fromLabel === toLabel ? toLabel : t('finance.statement.period.range', { from: fromLabel, to: toLabel });
    },
    [lang, t],
  );

  const periodLabel = useMemo(() => {
    switch (period.kind) {
      case 'all':
        return t('finance.statement.period.all');
      case 'preset':
        return t(STATEMENT_PERIOD_LABEL[period.preset]);
      case 'custom': {
        const span = resolvePeriodSpan(period, new Date());
        return span ? formatSpan(span, 'day') : t('finance.statement.period.custom');
      }
      default: {
        const _exhaustive: never = period;
        return _exhaustive;
      }
    }
  }, [formatSpan, period, t]);

  /** Radios with the months each preset covers as their description ("August – October"). */
  const periodOptions = useMemo<RadioGroupItem<PeriodOption>[]>(() => {
    const now = new Date();
    const presets = STATEMENT_PERIOD_PRESETS.map<RadioGroupItem<PeriodOption>>(preset => {
      const span = resolvePeriodSpan({ kind: 'preset', preset }, now);
      return {
        value: preset,
        label: t(STATEMENT_PERIOD_LABEL[preset]),
        description: span
          ? preset === 'thisYear'
            ? formatDate(span.from, YEAR, lang)
            : formatSpan(span, 'month')
          : undefined,
      };
    });
    return [{ value: 'all', label: t('finance.statement.period.all') }, ...presets];
  }, [formatSpan, lang, t]);

  const periodOption: PeriodOption | undefined =
    period.kind === 'all' ? 'all' : period.kind === 'preset' ? period.preset : undefined;

  const customSpan = useMemo<DateSpan>(() => {
    if (period.kind === 'custom') return { from: period.from, to: period.to };
    // Opens on this month so far.
    const now = new Date();
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  }, [period]);

  const openPeriodSheet = useCallback(() => setSheetVisible(true), []);
  const closePeriodSheet = useCallback(() => setSheetVisible(false), []);

  const onSelectPeriod = useCallback((option: PeriodOption) => {
    setPeriod(option === 'all' ? ALL_TIME : { kind: 'preset', preset: option });
    setSheetVisible(false);
  }, []);

  const onConfirmCustom = useCallback((from: Date, to: Date) => {
    setPeriod({ kind: 'custom', from, to });
  }, []);

  const clearPeriod = useCallback(() => setPeriod(ALL_TIME), []);

  const clearFilters = useCallback(() => {
    setType(null);
    setPeriod(ALL_TIME);
  }, []);

  // ── List ──────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openReceipt = useCallback(
    (reference: string) => navigation.navigate('TransactionReceipt', { reference }),
    [navigation],
  );

  const emptyAction = useMemo(
    () =>
      hasFilters
        ? { label: t('finance.statement.clearFilters'), onPress: clearFilters, variant: 'secondary' as const }
        : undefined,
    [clearFilters, hasFilters, t],
  );

  return {
    title: t('finance.statement.title'),
    hidden,
    toggleHidden,
    hiddenLabel: t(hidden ? 'finance.wallet.showAmounts' : 'finance.wallet.hideAmounts'),
    items,
    countLabel: total !== null && lines.length > 0 ? t('finance.statement.count', { count: total }) : null,
    isLoading: !currentData && isFetching && !isRefreshing,
    isError: isError && !currentData,
    isRefreshing,
    // The list draws its own loading-more placeholder (a day skeleton), not the kit spinner.
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    openReceipt,
    emptyMessage: t(hasFilters ? 'finance.statement.filteredEmptyTitle' : 'finance.wallet.activity.emptyTitle'),
    emptyDescription: t(hasFilters ? 'finance.statement.filteredEmptyHint' : WALLET_ROLE_COPY[role].emptyMessage),
    emptyAction,
    emptyIcon: hasFilters ? ListFilter : Wallet,
    // Filters
    typeChips,
    selectedType: type ?? ALL_TYPES,
    onSelectType,
    periodLabel,
    periodSet: period.kind !== 'all',
    clearPeriod,
    // Date sheet
    sheetVisible,
    openPeriodSheet,
    closePeriodSheet,
    periodOptions,
    periodOption,
    onSelectPeriod,
    customSelected: period.kind === 'custom',
    customLabel: period.kind === 'custom' ? periodLabel : null,
    customSpan,
    onConfirmCustom,
  };
};

export type StatementScreenModel = ReturnType<typeof useStatementScreen>;
