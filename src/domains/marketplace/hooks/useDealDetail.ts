import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetDealQuery, useGetDealTimelineQuery } from '../api/dealsApi';
import { DEAL_STATUS_META } from '../constants/dealStatus';
import type { DealRole } from '../types';
import { dealDeliverableAction } from '../utils/dealDrafts';
import { dealItemStage, type DealItemStage } from '../utils/dealPublish';
import { dealNextStep } from '../utils/dealNextStep';
import { dealStation } from '../utils/dealStation';
import { groupTimelineByStation } from '../utils/dealTimelineEvents';
import { useDealCancel } from './useDealCancel';
import { useDealRating } from './useDealRating';
import { useDealRespond } from './useDealRespond';
import { useDealShipping } from './useDealShipping';
import { useDealUpsells } from './useDealUpsells';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

/**
 * One deal from the viewer's side (handoff M3): the deal (`funding` for the brand while
 * awaiting payment), its history sorted into stations, where it sits on the journey, the next
 * step, and which station's card is open (the current one until the user picks another; a deal
 * moving on brings it back), the answer/payment actions (P4) and the way into each deliverable
 * (`openItem` from the role's screen, by the item's stage: draft rounds (P6) until approved, then
 * publishing (P7)), shipping the product (P5), the mutual rating once it completes (P10), and
 * the changes mid-deal (P8): addenda, the brand's cancel and the creator's withdrawal. Pull to
 * refresh reads both again.
 */
export const useDealDetail = (
  role: DealRole,
  id: string,
  openItemAt: (itemId: string, stage: DealItemStage) => void,
) => {
  const navigation = useNavigation<Navigation>();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const detail = useGetDealQuery(ref, { refetchOnMountOrArgChange: true });
  const timeline = useGetDealTimelineQuery(ref, {
    refetchOnMountOrArgChange: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deal = detail.data?.deal ?? null;
  const funding = detail.data?.funding ?? null;
  const station = useMemo(() => (deal ? dealStation(deal) : null), [deal]);
  const next = useMemo(
    () => (deal ? dealNextStep(deal, role) : null),
    [deal, role],
  );
  const events = useMemo(
    () => groupTimelineByStation(timeline.data ?? []),
    [timeline.data],
  );
  const nowIndex = station
    ? Math.max(
        0,
        station.stages.findIndex(stage => stage.status === 'now'),
      )
    : 0;

  const [selected, setSelected] = useState(nowIndex);
  const lastNow = useRef(nowIndex);
  useEffect(() => {
    if (lastNow.current === nowIndex) return;
    lastNow.current = nowIndex;
    setSelected(nowIndex);
  }, [nowIndex]);
  const count = station?.stages.length ?? 0;
  const select = useCallback(
    (index: number) =>
      setSelected(Math.min(Math.max(0, index), Math.max(0, count - 1))),
    [count],
  );

  const refetchDeal = detail.refetch;
  const refetchTimeline = timeline.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDeal(), refetchTimeline()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchDeal, refetchTimeline]);
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchTimeline();
  }, [refetchDeal, refetchTimeline]);

  const hasProduct = deal
    ? deal.shippingMode.key !== null && deal.shippingMode.key !== 'none'
    : false;
  const openContract = useCallback(
    () => navigation.navigate('DealContract', { id }),
    [id, navigation],
  );
  const openGuide = useCallback(
    () => navigate('DealGuide', { role, context: 'deal', hasProduct }),
    [hasProduct, role],
  );

  const respond = useDealRespond(
    role,
    id,
    deal,
    funding,
    refetchDeal,
    openContract,
  );

  const shipping = useDealShipping(role, id, deal);

  const rating = useDealRating(role, id, deal?.rating ?? null);

  const cancel = useDealCancel(role, id, deal, shipping.opens.cancel);
  const upsells = useDealUpsells(role, id, deal);

  const status = deal?.status.key ?? null;
  // Rounds only exist once the work has started; the first deliverable waiting on the viewer
  // gets the next-step button.
  const deliverables = status === 'in_progress' && deal ? deal.items : null;
  const focusItem = useMemo(() => {
    for (const item of deliverables ?? []) {
      const action = dealDeliverableAction(item, role);
      if (action !== null && action !== 'view') return { itemId: item.id, action };
    }
    return null;
  }, [deliverables, role]);

  const items = deal?.items;
  const openItem = useCallback(
    (itemId: string) => {
      const item = items?.find(entry => entry.id === itemId);
      if (item) openItemAt(itemId, dealItemStage(item));
    },
    [items, openItemAt],
  );

  const stopped =
    status !== null && DEAL_STATUS_META[status].outcome === 'stopped';

  return {
    role,
    deal,
    funding,
    station,
    next,
    events,
    selected: Math.min(selected, Math.max(0, count - 1)),
    select,
    stopped,
    hasContract: deal?.contract !== null && deal?.contract !== undefined,
    isLoading: !deal && detail.isFetching,
    error: !deal && detail.isError ? detail.error : null,
    isRefreshing,
    onRefresh,
    onRetry,
    openContract,
    openGuide,
    respond,
    shipping,
    rating,
    cancel,
    upsells,
    deliverables,
    focusItem,
    openItem,
  };
};

export type DealDetailModel = ReturnType<typeof useDealDetail>;
