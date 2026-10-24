import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { HAPTIC_SUCCESS_MS } from '@/core/config';
import { toastService } from '@/core/toast';
import { useReportReturnIssueMutation } from '../api/dealReturnApi';
import { DEAL_RETURN_LIMITS } from '../constants/dealReturn';
import {
  createDealReturnIssueSchema,
  createDealReturnWaiveSchema,
  EMPTY_RETURN_ANSWER,
  type DealReturnIssueFormValues,
  type DealReturnWaiveFormValues,
} from '../schemas/dealReturnAnswerSchema';
import type { Deal, DealRole } from '../types';
import { isDealConflictError, reportDealFailure } from '../utils/dealAction';
import { dealReturnAnswers } from '../utils/dealReturn';
import { useDealAction } from './useDealAction';
import { useIssuePhotos } from './useIssuePhotos';

const NOTE_FIELD = { note: 'note' } as const;

/** The brand's three answers to a returned sample. */
export type DealReturnAnswerSheet = 'receive' | 'issue' | 'waive';

/**
 * The brand's side of a returned sample (PC9.2, contract §5.5). Three final answers, each a
 * press-and-hold: confirm receipt, report a problem (note 5–1000 + up to five photos, multipart —
 * Sada's team takes the case, nothing is sent to the creator's record), or waive the sample (an
 * optional reason; the creator keeps it and is unlocked). Receipt and the report need the waybill
 * on file; waiving also works while it is still owed. A hold with an invalid form frees itself and
 * shows what is missing. A `409 deal_return_unavailable` (the return moved, e.g. the 14 days ran
 * out) toasts the server's words, refetches the deal and closes the sheet; a `429` keeps the text.
 */
export const useDealReturnAnswer = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  // Nothing to answer on a deal under account hold.
  const held = deal?.onHold != null;
  const allowed = useMemo(
    () => dealReturnAnswers(role === 'brand' && !held ? (deal?.returnShipment?.status.key ?? null) : null),
    [deal?.returnShipment?.status.key, held, role],
  );

  const [sheet, setSheet] = useState<DealReturnAnswerSheet | null>(null);
  const close = useCallback(() => setSheet(null), []);

  const receive = useDealAction(ref);
  const waive = useDealAction(ref);
  const [sendIssue, issueState] = useReportReturnIssueMutation();
  const photos = useIssuePhotos(DEAL_RETURN_LIMITS.issuePhotos);

  const issueSchema = useMemo(() => createDealReturnIssueSchema(t), [t]);
  const issueForm = useForm<DealReturnIssueFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(issueSchema),
    defaultValues: EMPTY_RETURN_ANSWER,
  });
  const waiveSchema = useMemo(() => createDealReturnWaiveSchema(t), [t]);
  const waiveForm = useForm<DealReturnWaiveFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(waiveSchema),
    defaultValues: EMPTY_RETURN_ANSWER,
  });

  const resetIssue = issueForm.reset;
  const resetWaive = waiveForm.reset;
  const resetPhotos = photos.reset;
  const open = useCallback(
    (next: DealReturnAnswerSheet) => {
      if (next === 'issue') {
        resetIssue(EMPTY_RETURN_ANSWER);
        resetPhotos();
      } else if (next === 'waive') {
        resetWaive(EMPTY_RETURN_ANSWER);
      }
      setSheet(next);
    },
    [resetIssue, resetPhotos, resetWaive],
  );
  const opens = useMemo(
    () =>
      ({
        receive: () => open('receive'),
        issue: () => open('issue'),
        waive: () => open('waive'),
      }) satisfies Record<DealReturnAnswerSheet, () => void>,
    [open],
  );

  /** The hold's own tap haptic played at the ring's end; success adds its own, then toast + close. */
  const done = useCallback((message: string) => {
    Vibration.vibrate(HAPTIC_SUCCESS_MS);
    toastService.success(message);
    setSheet(null);
    return true;
  }, []);

  const runReceive = receive.run;
  const onReceive = useCallback(async (): Promise<boolean> => {
    const outcome = await runReceive('return-shipment/receive');
    if (outcome.ok) return done(t('marketplace.deals.return.answer.toast.received'));
    if (outcome.conflict) setSheet(null);
    else reportDealFailure(outcome.error);
    return false;
  }, [done, runReceive, t]);

  const runWaive = waive.run;
  const triggerWaive = waiveForm.trigger;
  const getWaive = waiveForm.getValues;
  const setWaiveError = waiveForm.setError;
  const onWaive = useCallback(async (): Promise<boolean> => {
    if (!(await triggerWaive())) return false;
    const note = getWaive('note').trim();
    const outcome = await runWaive('return-shipment/waive', note ? { body: { note } } : {});
    if (outcome.ok) return done(t('marketplace.deals.return.answer.toast.waived'));
    if (outcome.conflict) setSheet(null);
    else if (!applyServerFieldErrors(outcome.error, NOTE_FIELD, setWaiveError)) reportDealFailure(outcome.error);
    return false;
  }, [done, getWaive, runWaive, setWaiveError, t, triggerWaive]);

  const triggerIssue = issueForm.trigger;
  const getIssue = issueForm.getValues;
  const setIssueError = issueForm.setError;
  const appendPhotos = photos.appendTo;
  const setPhotosError = photos.setError;
  const issuing = issueState.isLoading;
  const onIssue = useCallback(async (): Promise<boolean> => {
    if (issuing) return false;
    if (!(await triggerIssue())) return false;
    const form = new FormData();
    form.append('note', getIssue('note').trim());
    appendPhotos(form);
    try {
      await sendIssue({ id, form }).unwrap();
      return done(t('marketplace.deals.return.answer.toast.reported'));
    } catch (err) {
      const error = normalizeApiError(err);
      if (isDealConflictError(error)) {
        setSheet(null);
        toastService.error(error.message);
      } else if (applyServerFieldErrors(error, NOTE_FIELD, setIssueError)) {
        // The note's own message is under the field.
      } else if (error.statusCode === 422) {
        // `photos` / `photos.N`: baseQuery already toasted why; mark the slots.
        setPhotosError(error.message);
      } else if (error.statusCode === 429) {
        // Throttled: the text and photos stay, the server says when to try again.
        toastService.error(error.message);
      } else {
        reportDealFailure(error);
      }
      return false;
    }
  }, [appendPhotos, done, getIssue, id, issuing, sendIssue, setIssueError, setPhotosError, t, triggerIssue]);

  return {
    sheet,
    opens,
    close,
    allowed,
    onReceive,
    onWaive,
    onIssue,
    issueControl: issueForm.control,
    waiveControl: waiveForm.control,
    photos: photos.photos,
    photosError: photos.error,
    pickPhotos: photos.pick,
    removePhoto: photos.remove,
    sending: receive.isRunning || waive.isRunning || issuing,
  };
};

export type DealReturnAnswerModel = ReturnType<typeof useDealReturnAnswer>;
