import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Plus } from 'lucide-react-native';
import { Layout, SuperList } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { PlatformAccountSheet, type PlatformResource } from '@/domains/auth';
import { usePlatformsScreen } from './hooks/usePlatformsScreen';
import { PlatformListRow } from './components/PlatformListRow';

const keyExtractor = (platform: PlatformResource) => platform.id;

/** List archetype: linked accounts, one tap into each; adding is the header's only action. */
const PlatformsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = usePlatformsScreen();
  useHideBottomBar();

  const { openPlatform } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PlatformResource>) => <PlatformListRow platform={item} onPress={openPlatform} />,
    [openPlatform],
  );

  return (
    <>
      <Layout
        mode="static"
        header={{
          title: t('account.platforms.title'),
          actions: vm.canAdd
            ? [{ icon: Plus, accessibilityLabel: t('account.platforms.add'), onPress: vm.openAdd }]
            : undefined,
        }}
      >
        <SuperList
          data={vm.platforms}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          isLoading={vm.isLoading}
          isRefreshing={vm.isRefreshing}
          isError={vm.isError}
          onRefresh={vm.refetch}
          onRetry={vm.refetch}
          skeletonCount={3}
          emptyMessage={t('account.platforms.empty')}
          onScroll={onScroll}
        />
      </Layout>
      <PlatformAccountSheet {...vm.sheet} />
    </>
  );
};

export const PlatformsScreen = memo(PlatformsScreenComponent);
