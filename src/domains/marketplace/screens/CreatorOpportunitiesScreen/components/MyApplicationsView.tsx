import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, SuperList, Tabs } from '@/shared/ui';
import type { EmptyStateAction } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { ApplicationCard } from '../../../components/ApplicationCard';
import { ApplicationsSkeleton } from '../../../components/ApplicationsSkeleton';
import { WithdrawApplicationSheet } from '../../../components/WithdrawApplicationSheet';
import type { CreatorApplication } from '../../../types/campaign';
import type { MyApplicationsModel } from '../hooks/useMyApplications';

const keyExtractor = (application: CreatorApplication) => application.id;

export interface MyApplicationsViewProps {
  applications: MyApplicationsModel;
}

/** The «طلباتي» destination (PC5.2): open · selected · closed under the capsule, then the creator's application cards. */
const MyApplicationsViewComponent: React.FC<MyApplicationsViewProps> = ({ applications: model }) => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const { open, withdraw } = model;
  const styles = useStyles(({ spacing }) => ({
    tabs: { paddingHorizontal: spacing.xl },
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] * 1.5 },
    item: { paddingBottom: spacing.lg },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CreatorApplication>) => (
      <Box style={styles.item}>
        <ApplicationCard application={item} onOpen={open} onWithdraw={withdraw.ask} />
      </Box>
    ),
    [open, styles.item, withdraw.ask],
  );
  const emptyAction = useMemo<EmptyStateAction>(
    () => ({ label: model.emptyActionLabel, onPress: model.browse }),
    [model.browse, model.emptyActionLabel],
  );

  return (
    <>
      <Box style={styles.tabs}>
        <Tabs
          items={model.tabs}
          value={model.tab}
          onChange={model.setTab}
          accessibilityLabel={t('marketplace.campaign.applications.tabsLabel')}
        />
      </Box>
      <SuperList
        key={model.tab}
        data={model.applications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={model.isLoading}
        isError={model.isError}
        isRefreshing={model.isRefreshing}
        isFetchingNextPage={model.isFetchingNextPage}
        hasNextPage={model.hasNextPage}
        onEndReached={model.onEndReached}
        onRefresh={model.onRefresh}
        onRetry={model.onRetry}
        emptyIcon={ClipboardList}
        emptyMessage={model.emptyTitle}
        emptyDescription={model.emptyHint}
        emptyAction={emptyAction}
        errorMessage={t('marketplace.campaign.applications.loadFailed')}
        ListSkeletonComponent={<ApplicationsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <WithdrawApplicationSheet
        application={withdraw.application}
        visible={withdraw.visible}
        busy={withdraw.busy}
        onClose={withdraw.close}
        onConfirm={withdraw.confirm}
      />
    </>
  );
};

export const MyApplicationsView = memo(MyApplicationsViewComponent);
