import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useGetDealQuery, useGetDealTimelineQuery } from '../api/dealsApi';
import { DEAL_STATUS_META } from '../constants/dealStatus';
import type { DealRole } from '../types';
import { dealNextStep } from '../utils/dealNextStep';
import { dealStation } from '../utils/dealStation';
import { groupTimelineByStation } from '../utils/dealTimelineEvents';
import { useDealRespond } from './useDealRespond';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

/**
 * One deal from the viewer's side (handoff M3): the deal (`funding` for the brand while
 * awaiting payment), its history sorted into stations, where it sits on the journey, the next
 * step, and which station's card is open (the current one until the user picks another; a deal
 * moving on brings it back), and the answer/payment actions (P4). Pull to refresh reads both again.
 */
export const useDealDetail = (role: DealRole, id: string) => {
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

  const status = deal?.status.key ?? null;
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
  };
};

export type DealDetailModel = ReturnType<typeof useDealDetail>;
