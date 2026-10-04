import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { BellOff, CheckCheck } from 'lucide-react-native';
import { Layout, SuperList } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  useNotificationsScreen,
  type NotificationRowModel,
} from './hooks/useNotificationsScreen';
import { NotificationItem } from './components/NotificationItem';

const keyExtractor = (row: NotificationRowModel) => row.id;

/** List archetype: newest first, tap = read + open its screen, one header action to read all. */
const NotificationsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useNotificationsScreen();
  useHideBottomBar();

  const { onPressItem } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NotificationRowModel>) => (
      <NotificationItem row={item} onPress={onPressItem} />
    ),
    [onPressItem],
  );

  return (
    <Layout
      mode="static"
      padding={{ y: 'xs' }}
      header={{
        title: t('notifications.inbox.title'),
        actions: vm.hasUnread
          ? [
              {
                icon: CheckCheck,
                accessibilityLabel: t('notifications.inbox.markAllRead'),
                onPress: vm.onMarkAllRead,
              },
            ]
          : undefined,
      }}
    >
      <SuperList
        data={vm.rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        isFetchingNextPage={vm.isFetchingNextPage}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyMessage={t('notifications.inbox.empty')}
        emptyIcon={BellOff}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const NotificationsScreen = memo(NotificationsScreenComponent);
