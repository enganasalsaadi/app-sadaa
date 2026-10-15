import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { applyServerFieldErrors } from '@/core/api';
import { useDiscardGuard } from '@/core/hooks';
import type { DealsStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useFileUploads, type UploadSource } from '@/core/upload';
import { useGetDealItemDraftsQuery, useRequestDraftUploadSlotMutation } from '../../../api/dealDraftsApi';
import { useGetDealQuery } from '../../../api/dealsApi';
import { DEAL_DRAFT_LIMITS } from '../../../constants/dealDrafts';
import { DEAL_UPLOAD_POLICY } from '../../../constants/dealUploads';
import { useClock } from '../../../hooks/useClock';
import { useDealAction } from '../../../hooks/useDealAction';
import { createDealDraftSchema, type DealDraftFormValues } from '../../../schemas/dealDraftSchema';
import {
  captionTokens,
  dealDeliverableAction,
  dealRevisionAsk,
  dealRounds,
  insertCaptionToken,
} from '../../../utils/dealDrafts';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';

const MINUTE_MS = 60_000;

const CAPTION_FIELDS = { caption: 'caption' } as const;

/** The hand-in button: ready, waiting on uploads, or blocked by a failed file. */
export type DraftSubmitState = 'ready' | 'uploading' | 'failed';

/**
 * Creator hands in one deliverable's round (handoff M6): files (1–10, video or photo, uploaded
 * the moment they are picked, in the order they'll be posted) + the caption as it will be
 * posted. A revision round shows what the brand asked and starts from the last caption. Once
 * handed in the screen shows that round until the brand answers. Leaving with picked files or an
 * edited caption asks first.
 */
export const useDealDraftUploadScreen = () => {
  const { t } = useTranslation();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDraftUpload'>>();
  const { id, itemId } = params;
  const ref = useMemo(() => ({ role: 'creator' as const, id }), [id]);

  const detail = useGetDealQuery(ref);
  const drafts = useGetDealItemDraftsQuery({ ...ref, itemId }, { refetchOnMountOrArgChange: true });
  const deal = detail.data?.deal ?? null;
  const item = deal?.items.find(entry => entry.id === itemId) ?? null;
  const rounds = item ? dealRounds(item) : null;
  const ask = useMemo(() => dealRevisionAsk(drafts.data ?? []), [drafts.data]);
  const latest = drafts.data?.[0] ?? null;
  const composing = item !== null && dealDeliverableAction(item, 'creator') === 'submit';

  const [requestSlot] = useRequestDraftUploadSlotMutation();
  const uploads = useFileUploads({
    policy: DEAL_UPLOAD_POLICY.draft,
    limit: DEAL_DRAFT_LIMITS.files,
    requestSlot: useCallback(
      request => requestSlot({ dealId: id, itemId, request }).unwrap(),
      [id, itemId, requestSlot],
    ),
  });
  // Picker durations (seconds) by file uri, for the length badge on video frames.
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [filesError, setFilesError] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const schema = useMemo(() => createDealDraftSchema(t), [t]);
  const { control, handleSubmit, setError, setValue, getValues, reset, formState } =
    useForm<DealDraftFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: { caption: '' },
    });

  // A revision round starts from the caption the brand already saw.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !ask?.caption || formState.isDirty) return;
    prefilled.current = true;
    reset({ caption: ask.caption });
  }, [ask, formState.isDirty, reset]);

  const tokens = useMemo(() => captionTokens(deal?.brief ?? null), [deal?.brief]);
  const insertToken = useCallback(
    (token: string) => {
      const next = insertCaptionToken(getValues('caption'), token);
      if (next === null) {
        toastService.info(t('marketplace.deals.drafts.upload.caption.full'));
        return;
      }
      setValue('caption', next, { shouldDirty: true });
    },
    [getValues, setValue, t],
  );

  const { add, remaining, entries, move } = uploads;
  const pick = useCallback(async () => {
    if (remaining <= 0) {
      toastService.info(t('marketplace.deals.drafts.upload.sheet.limit', { max: DEAL_DRAFT_LIMITS.files }));
      return;
    }
    try {
      // Original quality, current representation: drafts are never recompressed (rule 07).
      const response = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 1,
        videoQuality: 'high',
        assetRepresentationMode: 'current',
        selectionLimit: remaining,
      });
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorCode);
      const assets = response.assets ?? [];
      const sources = assets.flatMap<UploadSource>(asset =>
        asset.uri
          ? [{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]
          : [],
      );
      const timed = assets.filter(asset => asset.uri && asset.duration);
      if (timed.length > 0) {
        setDurations(prev => ({
          ...prev,
          ...Object.fromEntries(timed.map(asset => [asset.uri ?? '', asset.duration ?? 0])),
        }));
      }
      if (sources.length === 0) return;
      setFilesError(null);
      if (add(sources) > 0) {
        toastService.info(t('marketplace.deals.drafts.upload.sheet.limit', { max: DEAL_DRAFT_LIMITS.files }));
      }
    } catch {
      toastService.error(t('marketplace.deals.drafts.upload.sheet.pickFailed'));
    }
  }, [add, remaining, t]);

  // Long-press lifts a frame; tapping another puts it there.
  const lift = useCallback((key: string) => setMoving(key), []);
  const dropAt = useCallback(
    (key: string) => {
      if (moving === null) return;
      if (moving !== key) move(moving, entries.findIndex(entry => entry.key === key));
      setMoving(null);
    },
    [entries, move, moving],
  );

  const submitState: DraftSubmitState = uploads.isUploading
    ? 'uploading'
    : uploads.hasFailed
      ? 'failed'
      : 'ready';
  const progress = entries.length
    ? entries.reduce((sum, entry) => sum + (entry.status === 'failed' ? 0 : entry.progress), 0) / entries.length
    : 0;
  const doneCount = entries.filter(entry => entry.status === 'done').length;

  const action = useDealAction(ref);
  const runAction = action.run;
  const clearUploads = uploads.clear;
  const { fileIds } = uploads;
  const onSubmit = useCallback(() => {
    handleSubmit(async ({ caption }) => {
      if (entries.length === 0) {
        setFilesError(t('marketplace.deals.drafts.upload.sheet.filesError'));
        return;
      }
      if (submitState === 'uploading') {
        toastService.info(t('marketplace.deals.drafts.upload.dock.waitingToast'));
        return;
      }
      if (submitState === 'failed') {
        toastService.info(t('marketplace.deals.drafts.upload.dock.fixToast'));
        return;
      }
      const outcome = await runAction(`items/${itemId}/drafts`, {
        body: { file_ids: fileIds, caption },
      });
      if (outcome.ok) {
        toastService.success(
          t('marketplace.deals.drafts.upload.toast', { round: outcome.result.draft?.round ?? rounds?.current ?? 1 }),
        );
        clearUploads();
        reset({ caption: '' });
        return;
      }
      // A conflict already toasted and refetched; 422 toasts in baseQuery, its fields land here.
      if (outcome.conflict || applyServerFieldErrors(outcome.error, CAPTION_FIELDS, setError)) return;
      const { statusCode, message } = outcome.error;
      if (statusCode === 400 || statusCode === 404 || statusCode === 409) toastService.error(message);
    })();
  }, [clearUploads, entries.length, fileIds, handleSubmit, itemId, reset, rounds, runAction, setError, submitState, t]);

  // A handed-in round: what happens now, from the item's server status and review clock.
  const now = useClock(MINUTE_MS);
  const handedIn = useMemo(() => {
    if (!item || !rounds || composing) return null;
    const brand = deal?.brand.name ?? '';
    if (item.status.key !== 'draft_submitted') return { title: item.status.label, body: null };
    const title = t('marketplace.deals.drafts.upload.sent.title', { round: latest?.round ?? rounds.current });
    if (item.timerPaused || item.dueAt === null) {
      return { title, body: t('marketplace.deals.drafts.upload.sent.paused') };
    }
    const time = formatRemaining(t, timerSecondsLeft(item.dueAt, now));
    return { title, body: t('marketplace.deals.drafts.upload.sent.review', { brand, time }) };
  }, [composing, deal?.brand.name, item, latest?.round, now, rounds, t]);

  const guard = useDiscardGuard(composing && (entries.length > 0 || formState.isDirty));

  const refetchDraftsQuery = drafts.refetch;
  const refetchDeal = detail.refetch;
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchDraftsQuery();
  }, [refetchDeal, refetchDraftsQuery]);

  return {
    deal,
    item,
    rounds,
    composing,
    handedIn,
    ask,
    latest,
    isLoading: (!deal && detail.isFetching) || (drafts.isLoading && !drafts.data),
    error: (!deal && detail.isError ? detail.error : null) ?? (!drafts.data && drafts.isError ? drafts.error : null),
    onRetry,
    control,
    tokens,
    insertToken,
    uploads,
    durations,
    filesError,
    pick,
    moving,
    lift,
    dropAt,
    submitState,
    progress,
    doneCount,
    isSubmitting: action.isRunning,
    onSubmit,
    guard,
  };
};

export type DealDraftUploadModel = ReturnType<typeof useDealDraftUploadScreen>;
