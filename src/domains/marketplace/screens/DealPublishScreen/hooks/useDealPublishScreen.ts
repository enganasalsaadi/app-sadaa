import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { launchImageLibrary } from 'react-native-image-picker';
import { applyServerFieldErrors } from '@/core/api';
import { useDiscardGuard } from '@/core/hooks';
import { formatDate, formatNumber } from '@/core/i18n';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadSource } from '@/core/upload';
import { isolateLtr, isolateText } from '@/shared/utils';
import { useGetDealQuery } from '../../../api/dealsApi';
import { useGetDealItemPublicationsQuery, useRequestProofUploadSlotMutation } from '../../../api/dealPublishApi';
import { DEAL_LIVE_PLATFORM_LABEL, DEAL_LIVE_URL_REASON_COPY } from '../../../constants/dealPublish';
import { DEAL_UPLOAD_LIMIT, DEAL_UPLOAD_POLICY } from '../../../constants/dealUploads';
import { useClock } from '../../../hooks/useClock';
import { useDealAction } from '../../../hooks/useDealAction';
import { createDealPublishSchema, type DealPublishFormValues } from '../../../schemas/dealPublishSchema';
import { dealDeliverableAction } from '../../../utils/dealDrafts';
import {
  checkLiveUrl,
  dealFixAsk,
  dealFixCount,
  dealItemStage,
  isLivePlatform,
  parseLiveUrl,
  readLiveUrlReason,
  safeLiveUrl,
  toPublishBody,
  windowShare,
} from '../../../utils/dealPublish';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';
import type { PublishSubmitState } from '../components/PublishDock';

const MINUTE_MS = 60_000;
const URL_FIELDS = { url: 'url' } as const;
const VERIFIED_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

/**
 * Creator hands in one deliverable's live post (handoff M7): the post's link (required unless the
 * item has no platform; checked against the platform's hosts before sending, the server then reads
 * the account) and 1–3 screenshots, uploaded as they're picked. A refused link says why (server
 * `meta.reason`). After a fix request the brand's note leads. Once handed in, the screen shows the
 * post on air until the brand confirms (or the window auto-verifies), then verified.
 */
export const useDealPublishScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<DealsStackScreenProps<'DealPublish'>['navigation']>();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealPublish'>>();
  const { id, itemId } = params;
  const ref = useMemo(() => ({ role: 'creator' as const, id }), [id]);

  const detail = useGetDealQuery(ref);
  const history = useGetDealItemPublicationsQuery({ ...ref, itemId }, { refetchOnMountOrArgChange: true });
  const deal = detail.data?.deal ?? null;
  const item = deal?.items.find(entry => entry.id === itemId) ?? null;
  const position = deal && item ? deal.items.indexOf(item) + 1 : 0;
  const publications = useMemo(() => history.data ?? [], [history.data]);
  const latest = publications[0] ?? null;
  const composing = item !== null && dealDeliverableAction(item, 'creator') === 'publish';
  const ask = useMemo(() => (composing ? dealFixAsk(publications) : null), [composing, publications]);
  const fixes = useMemo(() => (item ? dealFixCount(item, publications) : null), [item, publications]);
  const platform = item?.platform ?? null;
  // Isolated: a Latin brand name opening an Arabic sentence would flip the whole line.
  const brand = isolateText(deal?.brand.name ?? '');

  // — Screenshots ————————————————————————————————————————————————————
  const [requestSlot] = useRequestProofUploadSlotMutation();
  const uploads = useFileUploads({
    policy: DEAL_UPLOAD_POLICY.proof,
    limit: DEAL_UPLOAD_LIMIT.proof,
    requestSlot: useCallback(
      request => requestSlot({ dealId: id, itemId, request }).unwrap(),
      [id, itemId, requestSlot],
    ),
  });
  const [proofsError, setProofsError] = useState<string | null>(null);
  const { add, remaining, entries } = uploads;
  const pick = useCallback(async () => {
    if (remaining <= 0) {
      toastService.info(t('marketplace.deals.publish.creator.proofs.limit', { max: DEAL_UPLOAD_LIMIT.proof }));
      return;
    }
    try {
      // Original quality: a screenshot is evidence and must stay readable (rule 07).
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        assetRepresentationMode: 'current',
        selectionLimit: remaining,
      });
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorCode);
      const sources = (response.assets ?? []).flatMap<UploadSource>(asset =>
        asset.uri
          ? [{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]
          : [],
      );
      if (sources.length === 0) return;
      setProofsError(null);
      if (add(sources) > 0) {
        toastService.info(t('marketplace.deals.publish.creator.proofs.limit', { max: DEAL_UPLOAD_LIMIT.proof }));
      }
    } catch {
      toastService.error(t('marketplace.deals.publish.creator.proofs.pickFailed'));
    }
  }, [add, remaining, t]);

  const submitState: PublishSubmitState = uploads.isUploading ? 'uploading' : uploads.hasFailed ? 'failed' : 'ready';
  const progress = entries.length
    ? entries.reduce((sum, entry) => sum + (entry.status === 'failed' ? 0 : entry.progress), 0) / entries.length
    : 0;
  const doneCount = entries.filter(entry => entry.status === 'done').length;

  // — Link ——————————————————————————————————————————————————————————
  const schema = useMemo(() => createDealPublishSchema(t, platform), [platform, t]);
  const { control, handleSubmit, setError, setValue, reset, formState } = useForm<DealPublishFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: { url: '' },
  });
  const url = useWatch({ control, name: 'url' });
  const linkReady = url.trim() ? checkLiveUrl(url, platform) === null : !platform;
  const lampOn = composing && linkReady && doneCount > 0 && submitState === 'ready';

  const onPaste = useCallback(async () => {
    const text = (await Clipboard.getString()).trim();
    if (!text) {
      toastService.info(t('marketplace.deals.publish.link.pasteEmpty'));
      return;
    }
    setValue('url', text, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }, [setValue, t]);

  // — Hand in ————————————————————————————————————————————————————————
  const platformLabel = isLivePlatform(platform) ? t(DEAL_LIVE_PLATFORM_LABEL[platform]) : '';
  const action = useDealAction(ref, {
    conflictCopy: { deal_live_url_taken: t(DEAL_LIVE_URL_REASON_COPY.taken.title) },
  });
  const runAction = action.run;
  const clearUploads = uploads.clear;
  const { fileIds } = uploads;
  const onSubmit = useCallback(() => {
    handleSubmit(
      async values => {
        if (entries.length === 0) {
          setProofsError(t('marketplace.deals.publish.creator.proofs.required'));
          return;
        }
        if (submitState === 'uploading') {
          toastService.info(t('marketplace.deals.publish.creator.dock.waitingToast'));
          return;
        }
        if (submitState === 'failed') {
          toastService.info(t('marketplace.deals.publish.creator.dock.fixToast'));
          return;
        }
        const outcome = await runAction(`items/${itemId}/publish`, { body: toPublishBody(values.url, fileIds) });
        if (outcome.ok) {
          toastService.success(t('marketplace.deals.publish.creator.toast', { brand }));
          clearUploads();
          reset({ url: '' });
          return;
        }
        const reason = readLiveUrlReason(outcome.error);
        if (reason) {
          setError(
            'url',
            { type: reason, message: t(DEAL_LIVE_URL_REASON_COPY[reason].title, { platform: platformLabel }) },
            { shouldFocus: true },
          );
          return;
        }
        // A conflict already toasted and refetched; 422 toasts in baseQuery, its fields land here.
        if (outcome.conflict || applyServerFieldErrors(outcome.error, URL_FIELDS, setError)) return;
        if (outcome.error.code === 'deal_upload_invalid') {
          setProofsError(outcome.error.message);
          return;
        }
        const { statusCode, message } = outcome.error;
        if (statusCode === 400 || statusCode === 404) toastService.error(message);
      },
      // Screenshots are checked with the link, so both problems show at once.
      () => {
        if (entries.length === 0) setProofsError(t('marketplace.deals.publish.creator.proofs.required'));
      },
    )();
  }, [brand, clearUploads, entries.length, fileIds, handleSubmit, itemId, platformLabel, reset, runAction, setError, submitState, t]);

  // — Clocks ————————————————————————————————————————————————————————
  const now = useClock(MINUTE_MS);
  const dueLeft = item?.dueAt && !item.timerPaused ? formatRemaining(t, timerSecondsLeft(item.dueAt, now)) : null;
  const due = composing
    ? item?.timerPaused
      ? t('marketplace.deals.publish.creator.dock.paused')
      : dueLeft
        ? t('marketplace.deals.publish.creator.dock.due', { time: dueLeft })
        : null
    : null;

  const hero = useMemo(() => {
    if (!ask) {
      return {
        title: t('marketplace.deals.publish.creator.hero.title'),
        body: t('marketplace.deals.publish.creator.hero.body', { brand }),
      };
    }
    return {
      title: t('marketplace.deals.publish.creator.hero.fixTitle'),
      body: dueLeft
        ? t('marketplace.deals.publish.creator.hero.fixBody', { brand, time: dueLeft })
        : t('marketplace.deals.publish.creator.hero.fixPaused', { brand }),
    };
  }, [ask, brand, dueLeft, t]);

  // A handed-in post: on air until the brand confirms, then verified.
  const onAir = useMemo(() => {
    if (!item || composing || dealItemStage(item) !== 'publish' || item.status.key === 'approved_to_publish') return null;
    const verified = item.status.key === 'verified';
    const parsed = latest?.url ? parseLiveUrl(latest.url) : null;
    const verifiedDate = item.verifiedAt ? formatDate(item.verifiedAt, VERIFIED_FORMAT, i18n.language) : null;
    return {
      verified,
      title: verified
        ? t('marketplace.deals.publish.creator.aired.verifiedTitle')
        : t('marketplace.deals.publish.creator.aired.title'),
      body: verified
        ? verifiedDate
          ? t('marketplace.deals.publish.creator.aired.verifiedBody', { brand, date: verifiedDate })
          : t('marketplace.deals.publish.creator.aired.verifiedNoDate', { brand })
        : t('marketplace.deals.publish.creator.aired.body', { brand }),
      link: parsed
        ? isolateLtr(`${parsed.host}${parsed.path}`)
        : latest?.url
          ? isolateLtr(latest.url)
          : t('marketplace.deals.publish.creator.aired.noLink'),
      canOpen: safeLiveUrl(latest?.url ?? null) !== null,
      proofs: latest?.proofs ?? [],
      autoIn: !verified && item.dueAt && !item.timerPaused ? dueLeft : null,
      autoNote: item.timerPaused ? t('marketplace.deals.publish.creator.aired.paused') : null,
      share: latest ? windowShare(latest.submittedAt, item.dueAt, now) : 0,
    };
  }, [brand, composing, dueLeft, i18n.language, item, latest, now, t]);

  const latestUrl = latest?.url ?? null;
  const onOpenLink = useCallback(async () => {
    // Rule 07: only an allow-listed platform host leaves the app.
    const target = safeLiveUrl(latestUrl);
    if (!target) {
      toastService.info(t('marketplace.deals.publish.creator.aired.openBlocked'));
      return;
    }
    try {
      await Linking.openURL(target);
    } catch {
      toastService.error(t('marketplace.deals.publish.creator.aired.openBlocked'));
    }
  }, [latestUrl, t]);

  const guard = useDiscardGuard(composing && (entries.length > 0 || formState.isDirty));
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const refetchDeal = detail.refetch;
  const refetchHistory = history.refetch;
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchHistory();
  }, [refetchDeal, refetchHistory]);

  return {
    deal,
    item,
    position: t('marketplace.deals.publish.creator.itemOf', {
      index: formatNumber(position),
      total: formatNumber(deal?.items.length ?? 0),
    }),
    composing,
    hero,
    lampOn,
    ask,
    fixes,
    platform,
    brand,
    onAir,
    onOpenLink,
    control,
    onPaste,
    uploads,
    proofsError,
    pick,
    submitState,
    progress,
    due,
    isSubmitting: action.isRunning,
    onSubmit,
    goBack,
    guard,
    isLoading: (!deal && detail.isFetching) || (history.isLoading && !history.data),
    error: (!deal && detail.isError ? detail.error : null) ?? (!history.data && history.isError ? history.error : null),
    onRetry,
  };
};

export type DealPublishModel = ReturnType<typeof useDealPublishScreen>;
