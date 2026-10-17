import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Vibration } from 'react-native';
import { normalizeApiError } from '@/core/api';
import { HAPTIC_TAP_MS } from '@/core/config';
import { toastService } from '@/core/toast';
import { useGetCampaignsInfiniteQuery, useInviteCreatorsMutation } from '../api/brandCampaignsApi';
import { CAMPAIGN_INVITE_BATCH_MAX } from '../constants/campaignInvite';
import type { Campaign, CampaignInviteReport, CampaignInviteSkip } from '../types/campaign';
import type { ExploreCreator } from '../types/explore';
import { isCampaignConflictError } from '../utils/campaignAction';

/** The campaigns that can take invitations: published and open (the server has the last word, `campaign_not_accepting`). */
const INVITABLE = ['open'] as const;

export interface InviteReportRow {
  slug: string;
  name: string;
  avatarUrl: string | null;
  invited: boolean;
  /** The server's own words for why a creator was left out. */
  reasonKey: CampaignInviteSkip | null;
  reasonLabel: string | null;
  eligibility: string[];
}

/**
 * Inviting from the Shortlist (PC3.5, contract §3.6): the brand enters a pick mode, chooses who,
 * then which open campaign; the server answers with a report per creator, which the sheet shows
 * as it is (invited · skipped and why). The campaigns are read only once the sheet opens.
 */
export const useShortlistInvite = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [picks, setPicks] = useState<ExploreCreator[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [report, setReport] = useState<CampaignInviteReport | null>(null);
  const sending = useRef(false);
  const [invite, { isLoading: isSending }] = useInviteCreatorsMutation();
  const campaignsQuery = useGetCampaignsInfiniteQuery(
    { statuses: [...INVITABLE] },
    { skip: !sheetVisible, refetchOnMountOrArgChange: true },
  );

  const campaigns = useMemo<Campaign[]>(
    () => campaignsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [campaignsQuery.data],
  );
  // The newest campaign is ready to go: one tap sends, a choice only when there are several.
  const chosen = campaigns.some(campaign => campaign.id === chosenId) ? chosenId : (campaigns[0]?.id ?? null);
  const pickedSlugs = useMemo(() => new Set(picks.map(pick => pick.slug)), [picks]);

  const start = useCallback(() => setActive(true), []);
  const exit = useCallback(() => {
    setActive(false);
    setPicks([]);
  }, []);

  const toggle = useCallback(
    (creator: ExploreCreator) => {
      if (picks.some(pick => pick.slug === creator.slug)) {
        setPicks(current => current.filter(pick => pick.slug !== creator.slug));
        return;
      }
      if (picks.length >= CAMPAIGN_INVITE_BATCH_MAX) {
        Vibration.vibrate(HAPTIC_TAP_MS);
        toastService.info(t('marketplace.shortlist.invite.full', { max: CAMPAIGN_INVITE_BATCH_MAX }));
        return;
      }
      setPicks(current => [...current, creator]);
    },
    [picks, t],
  );

  const openSheet = useCallback(() => {
    if (picks.length > 0) setSheetVisible(true);
  }, [picks.length]);

  /** Done with the report (or backing out of the sheet before sending keeps the picks). */
  const finish = useCallback(() => {
    setSheetVisible(false);
    setReport(null);
    setChosenId(null);
    exit();
  }, [exit]);
  const closeSheet = useCallback(() => {
    if (report) finish();
    else setSheetVisible(false);
  }, [finish, report]);

  const send = useCallback(async () => {
    if (!chosen || sending.current || picks.length === 0) return;
    sending.current = true;
    try {
      setReport(await invite({ id: chosen, slugs: picks.map(pick => pick.slug) }).unwrap());
    } catch (err: unknown) {
      const error = normalizeApiError(err);
      if (isCampaignConflictError(error)) toastService.error(error.message);
      else if (error.statusCode === 400 || error.statusCode === 404) toastService.error(t('marketplace.shortlist.invite.failed'));
    } finally {
      sending.current = false;
    }
  }, [chosen, invite, picks, t]);

  const rows = useMemo<InviteReportRow[]>(() => {
    if (!report) return [];
    const bySlug = new Map(picks.map(pick => [pick.slug, pick]));
    return report.rows.map(row => {
      const card = bySlug.get(row.slug);
      return {
        slug: row.slug,
        name: row.displayName ?? card?.displayName ?? row.slug,
        avatarUrl: card?.avatarUrl ?? null,
        invited: row.invited,
        reasonKey: row.reason?.key ?? null,
        reasonLabel: row.reason?.label ?? null,
        eligibility: row.eligibility,
      };
    });
  }, [picks, report]);

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = campaignsQuery;
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);
  const more = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    active,
    picks,
    pickedSlugs,
    start,
    exit,
    toggle,
    openSheet,
    sheet: {
      visible: sheetVisible,
      close: closeSheet,
      campaigns,
      chosen,
      choose: setChosenId,
      isLoading: campaignsQuery.isLoading || (campaigns.length === 0 && campaignsQuery.isFetching),
      isError: campaignsQuery.isError && campaigns.length === 0,
      retry,
      hasMore: hasNextPage ?? false,
      isLoadingMore: isFetchingNextPage,
      more,
      send,
      isSending,
      report,
      rows,
      finish,
    },
  };
};

export type ShortlistInvite = ReturnType<typeof useShortlistInvite>;
export type ShortlistInviteSheet = ShortlistInvite['sheet'];
