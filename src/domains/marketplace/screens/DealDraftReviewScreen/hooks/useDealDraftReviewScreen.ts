import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { navigate, type DealsStackParamList, type DealsStackScreenProps } from '@/core/navigation';
import { getPersistentDeviceId } from '@/core/notification';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser } from '@/domains/auth';
import { useGetDealItemDraftsQuery, useQuoteExtraRevisionMutation } from '../../../api/dealDraftsApi';
import { useGetDealQuery } from '../../../api/dealsApi';
import { DEAL_DRAFT_LIMITS } from '../../../constants/dealDrafts';
import { useDealAction } from '../../../hooks/useDealAction';
import {
  createDealPinSchema,
  createDealRevisionSchema,
  type DealPinFormValues,
  type DealRevisionFormValues,
} from '../../../schemas/dealDraftSchema';
import type { DealDraftPin, DealUpsellQuote } from '../../../types';
import {
  dealDeliverableAction,
  dealRounds,
  readExtraRevisionAvailable,
  toRevisionBody,
} from '../../../utils/dealDrafts';

const NOTE_FIELDS = { note: 'note' } as const;

/** A note pinned on this review, before it is sent. */
export interface ReviewPin extends DealDraftPin {
  key: string;
}

export type ReviewSheet = 'revision' | 'extra' | 'pin';

/** Where the next pin goes: a video moment or the whole file. */
interface PinTarget {
  fileId: string;
  atSecond: number | null;
}

/** The extra-round quote while its sheet is open. */
export type ExtraQuote =
  | { state: 'loading' }
  | { state: 'ready'; quote: DealUpsellQuote }
  | { state: 'unavailable'; message: string | null };

/**
 * Brand reviews a deliverable's latest round (handoff M6): every file of the round, notes pinned
 * on a video second or on a whole file, then approve (press and hold; moves the item to
 * publishing) or ask for changes (a note + the pins; uses one revision round). With no rounds
 * left the brand can ask for one more at the creator's fixed price (an `extra_revision` upsell,
 * quoted first, signed with this device). After the creator ran past the revision window the
 * last round can be approved as it is. Earlier rounds stay readable below.
 */
export const useDealDraftReviewScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DealsStackScreenProps<'DealDraftReview'>['navigation']>();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDraftReview'>>();
  const { id, itemId } = params;
  const ref = useMemo(() => ({ role: 'brand' as const, id }), [id]);
  const user = useAppSelector(selectUser);
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;

  const detail = useGetDealQuery(ref);
  const drafts = useGetDealItemDraftsQuery({ ...ref, itemId }, { refetchOnMountOrArgChange: true });
  const deal = detail.data?.deal ?? null;
  const item = deal?.items.find(entry => entry.id === itemId) ?? null;
  const rounds = item ? dealRounds(item) : null;
  const latest = drafts.data?.[0] ?? null;
  const history = useMemo(() => drafts.data?.slice(1) ?? [], [drafts.data]);
  const mode = item ? dealDeliverableAction(item, 'brand') : null;

  const files = useMemo(() => latest?.files ?? [], [latest]);
  const [fileIndex, setFileIndex] = useState(0);
  const file = files[Math.min(fileIndex, Math.max(0, files.length - 1))] ?? null;
  const selectFile = useCallback((index: number) => setFileIndex(index), []);

  // — Pins ———————————————————————————————————————————————————————————
  const [pins, setPins] = useState<ReviewPin[]>([]);
  const pinSeq = useRef(0);
  const [pinTarget, setPinTarget] = useState<PinTarget | null>(null);
  const [sheet, setSheet] = useState<ReviewSheet | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);

  const pinSchema = useMemo(() => createDealPinSchema(t), [t]);
  const pinForm = useForm<DealPinFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(pinSchema),
    defaultValues: { note: '' },
  });
  const resetPin = pinForm.reset;

  const openPin = useCallback(
    (target: PinTarget) => {
      if (pins.length >= DEAL_DRAFT_LIMITS.pins) {
        toastService.info(t('marketplace.deals.drafts.review.pinSheet.limit', { max: DEAL_DRAFT_LIMITS.pins }));
        return;
      }
      resetPin({ note: '' });
      setPinTarget(target);
      setSheet('pin');
    },
    [pins.length, resetPin, t],
  );
  const fileId = file?.id ?? null;
  const pinAt = useCallback(
    (seconds: number) => {
      if (!fileId) return;
      openPin({ fileId, atSecond: Math.min(Math.max(0, Math.floor(seconds)), DEAL_DRAFT_LIMITS.pinSecond) });
    },
    [fileId, openPin],
  );
  const pinWhole = useCallback(() => {
    if (fileId) openPin({ fileId, atSecond: null });
  }, [fileId, openPin]);

  const pinSubmit = pinForm.handleSubmit;
  const addPin = useMemo(
    () =>
      pinSubmit(({ note }) => {
        if (!pinTarget) return;
        pinSeq.current += 1;
        const key = `pin-${pinSeq.current}`;
        setPins(prev =>
          [...prev, { key, ...pinTarget, note: note.trim() }].sort(
            (a, b) =>
              files.findIndex(f => f.id === a.fileId) - files.findIndex(f => f.id === b.fileId) ||
              (a.atSecond ?? -1) - (b.atSecond ?? -1),
          ),
        );
        setSheet(null);
      }),
    [files, pinSubmit, pinTarget],
  );
  const removePin = useCallback((key: string) => setPins(prev => prev.filter(pin => pin.key !== key)), []);

  // — Approve ————————————————————————————————————————————————————————
  const approve = useDealAction(ref);
  const runApprove = approve.run;
  const onApprove = useCallback(async (): Promise<boolean> => {
    const outcome = await runApprove(`items/${itemId}/approve`);
    if (outcome.ok) {
      toastService.success(t('marketplace.deals.drafts.review.toast.approved'));
      navigation.goBack();
      return true;
    }
    if (!outcome.conflict && [400, 404].includes(outcome.error.statusCode ?? 0)) {
      toastService.error(outcome.error.message);
    }
    return false;
  }, [itemId, navigation, runApprove, t]);

  // — Extra round (upsell) ——————————————————————————————————————————————
  const [quoteExtra] = useQuoteExtraRevisionMutation();
  const [extra, setExtra] = useState<ExtraQuote>({ state: 'loading' });
  const openExtra = useCallback(
    (available = true) => {
      setSheet('extra');
      if (!available) {
        setExtra({ state: 'unavailable', message: null });
        return;
      }
      setExtra({ state: 'loading' });
      quoteExtra({ dealId: id, itemId })
        .unwrap()
        .then(
          quote => setExtra({ state: 'ready', quote }),
          (err: unknown) => setExtra({ state: 'unavailable', message: normalizeApiError(err).message }),
        );
    },
    [id, itemId, quoteExtra],
  );
  const upsell = useDealAction(ref, { idempotent: true });
  const runUpsell = upsell.run;
  const creatorName = deal?.creator.name ?? '';
  const onRequestExtra = useCallback(async (): Promise<boolean> => {
    const deviceId = await getPersistentDeviceId();
    const outcome = await runUpsell('upsells', {
      body: { kind: 'extra_revision', item_id: itemId, device_id: deviceId },
    });
    if (outcome.ok) {
      toastService.success(t('marketplace.deals.drafts.review.toast.extra', { name: creatorName }));
      setSheet(null);
      return true;
    }
    if (!outcome.conflict && [400, 404].includes(outcome.error.statusCode ?? 0)) {
      toastService.error(outcome.error.message);
    }
    return false;
  }, [creatorName, itemId, runUpsell, t]);
  const shortfall = extra.state === 'ready' && !extra.quote.wallet.isSufficient ? extra.quote.wallet.shortfall : null;
  const onTopUp = useCallback(() => {
    if (!shortfall) return;
    setSheet(null);
    navigate('Main', {
      screen: 'WalletTab',
      params: { screen: 'TopUp', params: { amount: shortfall }, initial: false },
    });
  }, [shortfall]);

  // — Ask for changes ————————————————————————————————————————————————
  const revisionSchema = useMemo(() => createDealRevisionSchema(t), [t]);
  const revisionForm = useForm<DealRevisionFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(revisionSchema),
    defaultValues: { note: '' },
  });
  const revision = useDealAction(ref, {
    conflictCopy: { deal_revisions_exhausted: t('marketplace.deals.drafts.review.extra.title') },
  });
  const remaining = rounds?.remaining ?? 0;
  const openRevision = useCallback(() => {
    if (remaining <= 0) {
      openExtra();
      return;
    }
    setSheet('revision');
  }, [openExtra, remaining]);
  const runRevision = revision.run;
  const revisionSubmit = revisionForm.handleSubmit;
  const setRevisionError = revisionForm.setError;
  const resetRevision = revisionForm.reset;
  const onRevision = useMemo(
    () =>
      revisionSubmit(async ({ note }) => {
        const outcome = await runRevision(`items/${itemId}/revision`, { body: toRevisionBody(note, pins) });
        if (outcome.ok) {
          toastService.success(t('marketplace.deals.drafts.review.toast.revision'));
          setPins([]);
          resetRevision({ note: '' });
          setSheet(null);
          return;
        }
        if (outcome.error.code === 'deal_revisions_exhausted') {
          openExtra(readExtraRevisionAvailable(outcome.error.details));
          return;
        }
        if (outcome.conflict) {
          setSheet(null);
          return;
        }
        if (applyServerFieldErrors(outcome.error, NOTE_FIELDS, setRevisionError)) return;
        if ([400, 404].includes(outcome.error.statusCode ?? 0)) toastService.error(outcome.error.message);
      }),
    [itemId, openExtra, pins, resetRevision, revisionSubmit, runRevision, setRevisionError, t],
  );

  const refetchDeal = detail.refetch;
  const refetchDrafts = drafts.refetch;
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchDrafts();
  }, [refetchDeal, refetchDrafts]);

  return {
    deal,
    item,
    rounds,
    latest,
    history,
    mode,
    files,
    file,
    fileIndex: file ? files.indexOf(file) : 0,
    selectFile,
    pins,
    pinAt,
    pinWhole,
    pinTarget,
    pinControl: pinForm.control,
    addPin,
    removePin,
    sheet,
    closeSheet,
    revisionControl: revisionForm.control,
    openRevision,
    onRevision,
    isRevising: revision.isRunning,
    onApprove,
    isApproving: approve.isRunning,
    extra,
    onRequestExtra,
    isRequestingExtra: upsell.isRunning,
    canTopUp,
    onTopUp,
    isLoading: (!deal && detail.isFetching) || (drafts.isLoading && !drafts.data),
    error: (!deal && detail.isError ? detail.error : null) ?? (!drafts.data && drafts.isError ? drafts.error : null),
    onRetry,
  };
};

export type DealDraftReviewModel = ReturnType<typeof useDealDraftReviewScreen>;
