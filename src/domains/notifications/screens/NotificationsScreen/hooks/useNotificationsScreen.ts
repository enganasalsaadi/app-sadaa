import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParseKeys } from 'i18next';
import type { LucideIcon } from 'lucide-react-native';
import { AtSign, Bell, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react-native';
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
import { toRelativeTime } from '../../../utils/relativeTime';

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

interface TypeLook {
  icon: LucideIcon;
  tone: HueTone;
}

// Status never rides on color alone: the title states the outcome, the icon names the subject.
const TYPE_LOOK: Record<string, TypeLook> = {
  kyc_approved: { icon: ShieldCheck, tone: 'success' },
  kyc_rejected: { icon: ShieldCheck, tone: 'danger' },
  platform_approved: { icon: AtSign, tone: 'success' },
  platform_rejected: { icon: AtSign, tone: 'danger' },
  wallet_top_up_completed: { icon: Wallet, tone: 'success' },
  wallet_top_up_rejected: { icon: Wallet, tone: 'danger' },
  wallet_withdrawal_completed: { icon: Wallet, tone: 'success' },
  wallet_withdrawal_rejected: { icon: Wallet, tone: 'danger' },
  wallet_withdrawal_returned: { icon: Wallet, tone: 'warning' },
  wallet_wallet_frozen: { icon: Wallet, tone: 'warning' },
  wallet_wallet_unfrozen: { icon: Wallet, tone: 'success' },
  // Security alerts: "if this wasn't you, contact support".
  wallet_payout_method_added: { icon: ShieldAlert, tone: 'warning' },
  wallet_payout_method_changed: { icon: ShieldAlert, tone: 'warning' },
};
const DEFAULT_LOOK: TypeLook = { icon: Bell, tone: 'interactive' };

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

  const items = useMemo<AppNotification[]>(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data],
  );

  const rows = useMemo<NotificationRowModel[]>(() => {
    // One clock per fetch, not per row or render.
    const now = new Date(query.fulfilledTimeStamp ?? Date.now());
    return items.map(item => {
      const look = TYPE_LOOK[item.type] ?? DEFAULT_LOOK;
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
  }, [items, query.fulfilledTimeStamp, t]);

  const hasUnread = rows.some(row => row.isUnread);

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
        case 'PlatformDetailScreen':
          navigation.navigate('PlatformDetailScreen', { platformId: route.platformId });
          return;
        case 'WalletTab':
        case 'PayoutMethods':
        case 'TopUpDetail':
        case 'WithdrawalDetail':
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
    hasUnread,
    isLoading: query.isLoading,
    isError: query.isError && items.length === 0,
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
