import { useCallback, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { normalizeApiError } from '@/core/api';
import type { DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignDropQuery } from '../../../api/campaignBatchApi';
import { useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import { useClock } from '../../../hooks/useClock';
import {
  campaignDropChips,
  filterDropLanes,
  sortDropBar,
  sortDropLanes,
  type CampaignDropFilter,
} from '../../../utils/campaignDrop';

type Route = DealsStackScreenProps<'CampaignDrop'>['route'];
type Navigation = DealsStackScreenProps<'CampaignDrop'>['navigation'];

const MINUTE = 60_000;

/**
 * The launch room of one campaign: the drop board (re-read on open, by pull-to-refresh and when a
 * campaign or deal push stales it), the squad ordered for the bar and for the rows, and the local
 * state filter. A campaign without a drop answers 409 and gets its own empty state.
 */
export const useBrandCampaignDropScreen = () => {
  const { id } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const drop = useGetCampaignDropQuery(id, { refetchOnMountOrArgChange: true });
  // The title only; the campaign page already holds it.
  const campaign = useGetCampaignQuery(id);
  const [selected, setSelected] = useState<CampaignDropFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const minute = useClock(MINUTE);

  const board = drop.data ?? null;
  const chips = useMemo(() => (board ? campaignDropChips(board.totals) : []), [board]);
  // A state that emptied out on a refresh can't stay selected.
  const filter = chips.some(chip => chip.key === selected) ? selected : 'all';
  const bar = useMemo(() => (board ? sortDropBar(board.creators) : []), [board]);
  const lanes = useMemo(
    () => (board ? filterDropLanes(sortDropLanes(board.creators), filter) : []),
    [board, filter],
  );

  const refetchDrop = drop.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchDrop();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchDrop]);
  const onRetry = useCallback(() => {
    refetchDrop();
  }, [refetchDrop]);

  const selectFilter = useCallback(
    (value: string) => {
      const chip = chips.find(entry => entry.key === value);
      if (chip) setSelected(chip.key);
    },
    [chips],
  );
  const openDeal = useCallback((dealId: string) => navigation.navigate('DealDetail', { id: dealId }), [navigation]);

  return {
    board,
    campaignTitle: campaign.data?.title.trim() ?? '',
    // Loading is the first read only; a refetch keeps the room on screen.
    isLoading: !board && drop.isFetching,
    error: drop.error,
    noDrop: !board && drop.isError && normalizeApiError(drop.error).code === 'campaign_no_drop',
    isRefreshing,
    onRefresh,
    onRetry,
    chips,
    filter,
    selectFilter,
    bar,
    lanes,
    minute,
    openDeal,
  };
};

export type BrandCampaignDropModel = ReturnType<typeof useBrandCampaignDropScreen>;
