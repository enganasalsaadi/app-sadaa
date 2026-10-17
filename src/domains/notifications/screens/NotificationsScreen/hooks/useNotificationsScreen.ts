import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParseKeys } from 'i18next';
import type { LucideIcon } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import type { HueTone } from '@/core/theme';
import { navigate } from '@/core/navigation';
import type { SettingsStackParamList } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import {
  useGetNotificationsInfiniteQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../../api/notificationsApi';
import type { AppNotification } from '../../../types';
import {
  notificationTarget,
  resolveNotificationRoute,
  toTabParams,
} from '../../../utils/notificationRoute';
import {
  inNotificationCategory,
  isNotificationCategory,
  type NotificationCategory,
} from '../../../utils/notificationCategory';
import { notificationLook } from '../../../utils/notificationLook';
import { toRelativeTime } from '../../../utils/relativeTime';

// The filter hides rows of pages already loaded: below a screenful, keep pulling pages until it fills,
// the inbox ends, or this many were pulled for one choice (a rare category must not drain the history).
const MIN_FILTERED_ROWS = 8;
const MAX_FILL_PAGES = 5;

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'NotificationsScreen'>;

export interface NotificationRowModel {
  id: string;
  title: string;
  body: string;
  time: string;
  isUnread: boolean;
  icon: LucideIcon;
  tone: HueTone;
}

const RELATIVE_KEY = {
  now: 'notifications.time.now',
  minutes: 'notifications.time.minutes',
  hours: 'notifications.time.hours',
  yesterday: 'notifications.time.yesterday',
} as const satisfies Record<string, ParseKeys>;

export const useNotificationsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const userType = useAppSelector(selectUser)?.user_type ?? null;

  const query = useGetNotificationsInfiniteQuery(undefined, { refetchOnMountOrArgChange: true });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [category, setCategory] = useState<NotificationCategory>('all');
  const fillPages = useRef(0);

  const items = useMemo<AppNotification[]>(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data],
  );

  const shown = useMemo(
    () => items.filter(item => inNotificationCategory(item.type, category)),
    [category, items],
  );

  const rows = useMemo<NotificationRowModel[]>(() => {
    // One clock per fetch, not per row or render.
    const now = new Date(query.fulfilledTimeStamp ?? Date.now());
    return shown.map(item => {
      const look = notificationLook(item.type);
      const relative = toRelativeTime(item.created_at, now);
      let time = '';
      if (relative?.unit === 'date') time = formatDate(relative.date, { dateStyle: 'medium' });
      else if (relative?.unit === 'minutes' || relative?.unit === 'hours')
        time = t(RELATIVE_KEY[relative.unit], { count: relative.count });
      else if (relative) time = t(RELATIVE_KEY[relative.unit]);
      return {
        id: item.id,
        title: item.title,
        body: item.body,
        time,
        isUnread: !item.read_at,
        icon: look.icon,
        tone: look.tone,
      };
    });
  }, [query.fulfilledTimeStamp, shown, t]);

  // Read-all acts on the whole inbox, not on the filter.
  const onCategory = useCallback((value: string) => {
    if (!isNotificationCategory(value)) return;
    fillPages.current = 0;
    setCategory(value);
  }, []);

  const hasUnread = items.some(item => !item.read_at);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [query]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const fillWanted =
    category !== 'all' && !query.isLoading && !query.isError && shown.length < MIN_FILTERED_ROWS && hasNextPage;
  useEffect(() => {
    if (!fillWanted || isFetchingNextPage || fillPages.current >= MAX_FILL_PAGES) return;
    fillPages.current += 1;
    fetchNextPage();
  }, [fetchNextPage, fillWanted, isFetchingNextPage]);
  // Still looking for the first match: a skeleton, never a false "nothing in this category".
  const isFilling =
    fillWanted && shown.length === 0 && (isFetchingNextPage || fillPages.current < MAX_FILL_PAGES);

  const onMarkAllRead = useCallback(() => {
    // Optimistic; a failure rolls the dots back and the global handlers report it.
    if (!isMarkingAll) markAllRead().catch(() => undefined);
  }, [isMarkingAll, markAllRead]);

  const onPressItem = useCallback(
    (id: string) => {
      const item = items.find(entry => entry.id === id);
      if (!item) return;
      if (!item.read_at) markRead(id).catch(() => undefined);
      const route = resolveNotificationRoute(notificationTarget(item), userType);
      switch (route?.screen) {
        case 'KycScreen':
          navigation.navigate('KycScreen');
          return;
        case 'CompanyVerification':
          navigation.navigate('CompanyVerification');
          return;
        case 'PlatformDetailScreen':
          navigation.navigate('PlatformDetailScreen', { platformId: route.platformId });
          return;
        case 'WalletTab':
        case 'PayoutMethods':
        case 'TopUpDetail':
        case 'WithdrawalDetail':
        case 'DealDetail':
        case 'CampaignDetail':
        case 'Strikes':
          // Another tab: go through the root, like a push tap.
          navigate('Main', toTabParams(route));
          return;
        case 'NotificationsScreen':
        case undefined:
          // Already here: reading it is the whole action.
          return;
        default: {
          const _exhaustive: never = route;
          return _exhaustive;
        }
      }
    },
    [items, markRead, navigation, userType],
  );

  return {
    rows,
    category,
    onCategory,
    hasUnread,
    isLoading: query.isLoading || isFilling,
    isError: query.isError && shown.length === 0,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage,
    onRefresh,
    onRetry: query.refetch,
    onEndReached,
    onMarkAllRead,
    onPressItem,
  };
};

export type NotificationsScreenModel = ReturnType<typeof useNotificationsScreen>;
