import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import type { TabItem } from '@/shared/ui';
import {
  useGetCampaignApplicationsInfiniteQuery,
  useWithdrawCampaignApplicationMutation,
} from '../../../api/creatorCampaignsApi';
import { APPLICATION_TABS } from '../../../constants/campaignStatus';
import type { ApplicationTab } from '../../../constants/campaignStatus';
import { APPLICATION_TAB_ARGS, APPLICATION_TAB_DEF } from '../../../constants/opportunities';
import type { CreatorApplication } from '../../../types/campaign';
import { applicationTarget } from '../../../utils/creatorApplications';

export interface ApplicationsExits {
  openCampaign: (id: string) => void;
  openDeal: (id: string) => void;
  /** An empty tab sends the creator back to the feed. */
  browse: () => void;
}

/** A gone application (404) or one the brand already decided (409): the sheet's answer is the server's words. */
const SETTLED_STATUSES = [404, 409];

/**
 * «My applications» (PC5.2): one tab of the creator's applications at a time (open · selected ·
 * closed), read by status on the server, and the withdraw of a pending one behind a plain
 * confirmation (it costs nothing, but it can't be undone). Only the open destination loads.
 */
export const useMyApplications = (active: boolean, { openCampaign, openDeal, browse }: ApplicationsExits) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ApplicationTab>('open');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<CreatorApplication | null>(null);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdraw, { isLoading: withdrawing }] = useWithdrawCampaignApplicationMutation();

  const list = useGetCampaignApplicationsInfiniteQuery(APPLICATION_TAB_ARGS[tab], {
    skip: !active,
    refetchOnMountOrArgChange: 30,
  });
  const applications = useMemo<CreatorApplication[]>(() => list.data?.pages.flatMap(page => page.items) ?? [], [list.data]);

  const tabs = useMemo<TabItem<ApplicationTab>[]>(
    () => APPLICATION_TABS.map(value => ({ value, label: t(APPLICATION_TAB_DEF[value].label) })),
    [t],
  );

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const open = useCallback(
    (application: CreatorApplication) => {
      const target = applicationTarget(application);
      if (target.kind === 'deal') openDeal(target.id);
      else openCampaign(target.id);
    },
    [openCampaign, openDeal],
  );

  const askWithdraw = useCallback((application: CreatorApplication) => {
    setWithdrawTarget(application);
    setWithdrawVisible(true);
  }, []);
  const closeWithdraw = useCallback(() => setWithdrawVisible(false), []);
  const confirmWithdraw = useCallback(async () => {
    if (!withdrawTarget || withdrawing) return;
    try {
      await withdraw(withdrawTarget.id).unwrap();
      setWithdrawVisible(false);
      toastService.success(t('marketplace.campaign.applications.withdraw.done'));
    } catch (err) {
      const { statusCode, message } = normalizeApiError(err);
      // Everything else was already reported by the base query (offline, server down, validation).
      if (statusCode !== null && SETTLED_STATUSES.includes(statusCode)) {
        setWithdrawVisible(false);
        toastService.error(message);
      }
    }
  }, [t, withdraw, withdrawTarget, withdrawing]);

  const tabDef = APPLICATION_TAB_DEF[tab];
  return {
    tab,
    setTab,
    tabs,
    applications,
    isLoading: !list.data && list.isFetching && !isRefreshing,
    isError: list.isError && !list.data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onRetry,
    onEndReached,
    emptyTitle: t(tabDef.emptyTitle),
    emptyHint: t(tabDef.emptyHint),
    emptyActionLabel: t('marketplace.campaign.applications.empty.action'),
    browse,
    open,
    withdraw: {
      application: withdrawTarget,
      visible: withdrawVisible,
      busy: withdrawing,
      ask: askWithdraw,
      close: closeWithdraw,
      confirm: confirmWithdraw,
    },
  };
};

export type MyApplicationsModel = ReturnType<typeof useMyApplications>;
