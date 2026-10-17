import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, createIdempotentAction, normalizeApiError } from '@/core/api';
import type { IdempotentAction } from '@/core/api';
import type { DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import {
  useGetCampaignAnnouncementsInfiniteQuery,
  useSendCampaignAnnouncementMutation,
} from '../../../api/campaignBatchApi';
import { useClock } from '../../../hooks/useClock';
import {
  createCampaignAnnouncementSchema,
  EMPTY_ANNOUNCEMENT,
  type CampaignAnnouncementFormValues,
} from '../../../schemas/campaignAnnouncementSchema';
import { announcementLockFrom, announcementQuota } from '../../../utils/campaignAnnouncement';

type Route = DealsStackScreenProps<'CampaignAnnouncements'>['route'];

const MINUTE = 60_000;
/** Wake just after the cap lifts so the editor is not shown locked at 00:00:00. */
const WAKE_LAG_MS = 400;
const SERVER_FIELDS = { body: 'body', link: 'link' } as const;

/**
 * The broadcasts of one campaign (contract §3.9). The history is the source of «x of 3 today»
 * (`sent_at` inside the last 24 hours), never a local counter; a `429` with `next_available_at`
 * locks the editor until then and keeps the text; `422 campaign_no_announcement_recipients` is a
 * notice (it doesn't count toward the cap). Sending is binding, so it is a hold and carries an
 * `Idempotency-Key` (rule 06) that survives retries of the same message and changes with the text.
 * The recipient count comes from the server's answer only.
 */
export const useBrandCampaignAnnouncementsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<Route>().params;
  const history = useGetCampaignAnnouncementsInfiniteQuery(id, { refetchOnMountOrArgChange: true });
  // The title only; the campaign page already holds it.
  const campaign = useGetCampaignQuery(id);
  const [send] = useSendCampaignAnnouncementMutation();

  const [serverLock, setServerLock] = useState<number | null>(null);
  const [noRecipients, setNoRecipients] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // — Quota ——————————————————————————————————————————————————————————
  const minute = useClock(MINUTE);
  const [woke, setWoke] = useState(0);
  const now = Math.max(minute, woke);
  const items = useMemo(() => history.data?.pages.flatMap(page => page.items) ?? [], [history.data]);
  // Everything inside the last 24 hours is on the first page (the cap is 3 a day).
  const recent = history.data?.pages[0]?.items;
  const quota = useMemo(() => announcementQuota(recent ?? [], serverLock, now), [now, recent, serverLock]);
  const unlocksAt = quota.unlocksAt;
  useEffect(() => {
    if (unlocksAt === null) return;
    const timer = setTimeout(() => setWoke(Date.now()), Math.max(0, unlocksAt - Date.now()) + WAKE_LAG_MS);
    return () => clearTimeout(timer);
  }, [unlocksAt]);

  // — Editor —————————————————————————————————————————————————————————
  const schema = useMemo(() => createCampaignAnnouncementSchema(t), [t]);
  const form = useForm<CampaignAnnouncementFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_ANNOUNCEMENT,
  });
  const { reset, setError, handleSubmit } = form;

  const intent = useRef<{ signature: string; action: IdempotentAction } | null>(null);
  const sending = useRef(false);
  const refetchHistory = history.refetch;

  const broadcast = useCallback(
    async (values: CampaignAnnouncementFormValues) => {
      const input = { body: values.body.trim(), link: values.link.trim() || null };
      const signature = JSON.stringify(input);
      if (intent.current?.signature !== signature) intent.current = { signature, action: createIdempotentAction() };
      const { action } = intent.current;
      setNoRecipients(false);
      try {
        const sent = await action.run(idempotencyKey => send({ id, ...input, idempotencyKey }).unwrap());
        intent.current = null;
        reset(EMPTY_ANNOUNCEMENT);
        toastService.success(t('marketplace.campaign.announcements.reached', { count: sent.recipients }));
      } catch (err) {
        const error = normalizeApiError(err);
        if (error.code === 'campaign_announcement_limit') {
          // The history was behind (another device, a stale page): lock from the server's word, keep the text.
          const until = announcementLockFrom(error, Date.now());
          if (until === null) {
            toastService.error(error.message);
          } else {
            setServerLock(until);
            toastService.info(t('marketplace.campaign.announcements.toast.limit'));
          }
          refetchHistory();
        } else if (error.code === 'campaign_no_announcement_recipients') {
          setNoRecipients(true);
        } else if (!applyServerFieldErrors(err, SERVER_FIELDS, setError)) {
          toastService.error(error.message);
        }
      }
    },
    [id, refetchHistory, reset, send, setError, t],
  );

  /** The hold's callback: resolves when the call is answered, so the button frees itself. */
  const onSend = useCallback(async (): Promise<void> => {
    if (sending.current) return;
    sending.current = true;
    try {
      await handleSubmit(broadcast)();
    } finally {
      sending.current = false;
    }
  }, [broadcast, handleSubmit]);

  // — History ————————————————————————————————————————————————————————
  const fetchNextPage = history.fetchNextPage;
  const onEndReached = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchHistory();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchHistory]);
  const onRetry = useCallback(() => {
    refetchHistory();
  }, [refetchHistory]);

  const copyLink = useCallback(
    (link: string) => {
      Clipboard.setString(link);
      toastService.success(t('marketplace.campaign.announcements.history.linkCopied'));
    },
    [t],
  );

  return {
    campaignTitle: campaign.data?.title.trim() ?? '',
    items,
    // Loading is the first read only; the quota is unknown until the history is.
    isLoading: !history.data && history.isFetching,
    isError: history.isError,
    isRefreshing,
    isFetchingNextPage: history.isFetchingNextPage,
    hasNextPage: history.hasNextPage,
    onEndReached,
    onRefresh,
    onRetry,
    quota,
    noRecipients,
    control: form.control,
    onSend,
    copyLink,
  };
};

export type BrandCampaignAnnouncementsModel = ReturnType<typeof useBrandCampaignAnnouncementsScreen>;
