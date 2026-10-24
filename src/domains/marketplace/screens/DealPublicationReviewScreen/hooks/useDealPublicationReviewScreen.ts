import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { applyServerFieldErrors } from '@/core/api';
import { formatNumber } from '@/core/i18n';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetDealQuery } from '../../../api/dealsApi';
import { useGetDealItemPublicationsQuery } from '../../../api/dealPublishApi';
import { DEAL_LIVE_PLATFORM_LABEL, DEAL_PUBLISH_LIMITS } from '../../../constants/dealPublish';
import { useClock } from '../../../hooks/useClock';
import { useDealAction } from '../../../hooks/useDealAction';
import { createDealFixSchema, type DealFixFormValues } from '../../../schemas/dealPublishSchema';
import { dealDeliverableAction } from '../../../utils/dealDrafts';
import {
  dealFixCount,
  isLastToVerify,
  parseLiveUrl,
  safeLiveUrl,
  windowShare,
} from '../../../utils/dealPublish';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';
import type { LiveRoomPost } from '../components/LiveRoomHero';

const MINUTE_MS = 60_000;
const NOTE_FIELDS = { note: 'note' } as const;

/**
 * Brand checks a deliverable's live post (handoff M7): the link (opened only on an allow-listed
 * platform host), whether the server matched its account to the contract (`handle_checked`), the
 * screenshots, and the auto-verify window. Press and hold confirms it (on the last deliverable
 * that completes the deal and releases escrow); a fix request sends it back with a note (2 per
 * item). Earlier submissions stay listed as the record.
 */
export const useDealPublicationReviewScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DealsStackScreenProps<'DealPublicationReview'>['navigation']>();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealPublicationReview'>>();
  const { id, itemId } = params;
  const ref = useMemo(() => ({ role: 'brand' as const, id }), [id]);

  const detail = useGetDealQuery(ref);
  const history = useGetDealItemPublicationsQuery({ ...ref, itemId }, { refetchOnMountOrArgChange: true });
  const deal = detail.data?.deal ?? null;
  const item = deal?.items.find(entry => entry.id === itemId) ?? null;
  const position = deal && item ? deal.items.indexOf(item) + 1 : 0;
  const publications = useMemo(() => history.data ?? [], [history.data]);
  const latest = publications[0] ?? null;
  const verifying = item !== null && dealDeliverableAction(item, 'brand', deal?.onHold != null) === 'verify';
  const fixes = useMemo(() => (item ? dealFixCount(item, publications) : null), [item, publications]);
  const creatorName = deal?.creator.name ?? '';
  const last = deal !== null && verifying && isLastToVerify(deal, itemId);

  const post = useMemo((): LiveRoomPost | null => {
    if (!latest) return null;
    const parsed = latest.url ? parseLiveUrl(latest.url) : null;
    const platform = parsed?.platform ?? null;
    return {
      link: parsed ? `${parsed.host}${parsed.path}` : (latest.url ?? t('marketplace.deals.publish.brand.noLink')),
      canOpen: safeLiveUrl(latest.url) !== null,
      platform,
      platformLabel: platform ? t(DEAL_LIVE_PLATFORM_LABEL[platform]) : '',
      handle: latest.handle ? `@${latest.handle.replace(/^@/, '')}` : null,
      handleChecked: latest.handleChecked,
    };
  }, [latest, t]);

  const latestUrl = latest?.url ?? null;
  const onOpen = useCallback(async () => {
    // Rule 07: only an allow-listed platform host leaves the app.
    const url = safeLiveUrl(latestUrl);
    if (!url) {
      toastService.info(t('marketplace.deals.publish.brand.openBlocked'));
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      toastService.error(t('marketplace.deals.publish.brand.openBlocked'));
    }
  }, [latestUrl, t]);

  // — Clock ————————————————————————————————————————————————————————
  const now = useClock(MINUTE_MS);
  const fuse = useMemo(() => {
    if (!verifying || !item || !latest) return null;
    const time = item.dueAt && !item.timerPaused ? formatRemaining(t, timerSecondsLeft(item.dueAt, now)) : null;
    return { time, share: windowShare(latest.submittedAt, item.dueAt, now) };
  }, [item, latest, now, t, verifying]);

  // — Confirm ————————————————————————————————————————————————————————
  const verify = useDealAction(ref);
  const runVerify = verify.run;
  const onVerify = useCallback(async (): Promise<boolean> => {
    const outcome = await runVerify(`items/${itemId}/verify`);
    if (outcome.ok) {
      toastService.success(
        outcome.result.deal.status.key === 'completed'
          ? t('marketplace.deals.publish.brand.toast.completed')
          : t('marketplace.deals.publish.brand.toast.verified'),
      );
      navigation.goBack();
      return true;
    }
    if (!outcome.conflict && [400, 404].includes(outcome.error.statusCode ?? 0)) {
      toastService.error(outcome.error.message);
    }
    return false;
  }, [itemId, navigation, runVerify, t]);

  // — Ask for a fix ——————————————————————————————————————————————————
  const [fixOpen, setFixOpen] = useState(false);
  const closeFix = useCallback(() => setFixOpen(false), []);
  const openFix = useCallback(() => setFixOpen(true), []);
  const schema = useMemo(() => createDealFixSchema(t), [t]);
  const fixForm = useForm<DealFixFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: { note: '' },
  });
  const { getValues, setValue, setError, reset, handleSubmit } = fixForm;
  // A quick reason fills an empty note or joins the one being written.
  const onChip = useCallback(
    (text: string) => {
      const note = getValues('note').trim();
      if (note.includes(text)) return;
      const next = note ? `${note}\n${text}` : text;
      if (next.length > DEAL_PUBLISH_LIMITS.fixNote) return;
      setValue('note', next, { shouldDirty: true, shouldValidate: true });
    },
    [getValues, setValue],
  );
  const fix = useDealAction(ref);
  const runFix = fix.run;
  const onFix = useMemo(
    () =>
      handleSubmit(async ({ note }) => {
        const outcome = await runFix(`items/${itemId}/fix`, { body: { note: note.trim() } });
        if (outcome.ok) {
          toastService.success(t('marketplace.deals.publish.brand.toast.fix'));
          reset({ note: '' });
          setFixOpen(false);
          return;
        }
        // `deal_fix_limit` / a window that closed: the server's words are toasted and the deal refetched.
        if (outcome.conflict) {
          setFixOpen(false);
          return;
        }
        if (applyServerFieldErrors(outcome.error, NOTE_FIELDS, setError)) return;
        if ([400, 404].includes(outcome.error.statusCode ?? 0)) toastService.error(outcome.error.message);
      }),
    [handleSubmit, itemId, reset, runFix, setError, t],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const refetchDeal = detail.refetch;
  const refetchHistory = history.refetch;
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchHistory();
  }, [refetchDeal, refetchHistory]);

  const banner = !item || verifying
    ? null
    : item.status.key === 'verified'
      ? t('marketplace.deals.publish.brand.banner.verified')
      : latest?.review?.decision.key === 'fix_requested'
        ? t('marketplace.deals.publish.brand.banner.fixRequested', { name: creatorName })
        : t('marketplace.deals.publish.brand.banner.waitingPost', { name: creatorName });

  return {
    dealId: id,
    deal,
    item,
    position: t('marketplace.deals.publish.creator.itemOf', {
      index: formatNumber(position),
      total: formatNumber(deal?.items.length ?? 0),
    }),
    publications,
    latest,
    post,
    verifying,
    banner,
    waiting: t('marketplace.deals.publish.brand.banner.waitingPost', { name: creatorName }),
    release: last && deal ? deal.total : null,
    fixes,
    fuse,
    onOpen,
    onVerify,
    isVerifying: verify.isRunning,
    fixOpen,
    openFix,
    closeFix,
    fixControl: fixForm.control,
    onChip,
    onFix,
    isFixing: fix.isRunning,
    goBack,
    isLoading: (!deal && detail.isFetching) || (history.isLoading && !history.data),
    error: (!deal && detail.isError ? detail.error : null) ?? (!history.data && history.isError ? history.error : null),
    onRetry,
  };
};

export type DealPublicationReviewModel = ReturnType<typeof useDealPublicationReviewScreen>;
