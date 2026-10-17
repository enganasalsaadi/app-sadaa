import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { BellOff, CheckCheck } from 'lucide-react-native';
import { Chip, ChipRow, Layout, SuperList } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import {
  useNotificationsScreen,
  type NotificationRowModel,
} from './hooks/useNotificationsScreen';
import { NotificationItem } from './components/NotificationItem';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABEL,
} from '../../utils/notificationCategory';

const keyExtractor = (row: NotificationRowModel) => row.id;

/** List archetype: newest first, tap = read + open its screen, one header action to read all. */
const NotificationsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useNotificationsScreen();

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
      <ChipRow accessibilityLabel={t('notifications.inbox.categories.title')} accessibilityRole="radiogroup">
        {NOTIFICATION_CATEGORIES.map(category => (
          <Chip
            key={category}
            label={t(NOTIFICATION_CATEGORY_LABEL[category])}
            value={category}
            selected={vm.category === category}
            onSelect={vm.onCategory}
          />
        ))}
      </ChipRow>
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
        emptyMessage={t(vm.category === 'all' ? 'notifications.inbox.empty' : 'notifications.inbox.emptyCategory')}
        emptyIcon={BellOff}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const NotificationsScreen = memo(NotificationsScreenComponent);
