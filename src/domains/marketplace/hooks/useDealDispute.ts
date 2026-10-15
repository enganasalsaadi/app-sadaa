import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useOpenSupport } from '@/domains/auth';
import { useOpenDealDisputeMutation } from '../api/dealDisputeApi';
import { useGetDealStrikesQuery } from '../api/dealUpsellApi';
import { DEAL_DISPUTE_REASON_DEF, DEAL_DISPUTE_REASONS } from '../constants/dealDispute';
import {
  createDealDisputeOpenSchema,
  EMPTY_DISPUTE_OPEN,
  type DealDisputeOpenValues,
} from '../schemas/dealDisputeSchema';
import type { Deal, DealRole } from '../types';
import { isDealConflictError, reportDealFailure } from '../utils/dealAction';
import { disputePhase, toDisputeOpenBody } from '../utils/dealDispute';
import { getDealActions } from '../utils/dealStatus';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

const OPEN_FIELDS = { reason: 'reason', statement: 'statement' } as const;

/**
 * Disputes from the deal page (handoff M9). Either side opens one while the server's window allows
 * it: the side's own reasons and a statement, then press-and-hold (binding: timers and money freeze).
 * When the window is shut the same sheet says why and points to support. Once open, the deal page
 * shows a summary card and the file screen holds the evidence and the ruling.
 */
export const useDealDispute = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const brand = role === 'brand';

  const actions = useMemo(() => (deal ? getDealActions(deal, role) : []), [deal, role]);
  const canOpen = actions.includes('openDispute');
  const dispute = deal?.dispute ?? null;
  const phase = dispute ? disputePhase(dispute) : null;

  const [visible, setVisible] = useState(false);
  const afterClose = useRef<(() => void) | null>(null);
  const strikes = useGetDealStrikesQuery(!brand && visible ? undefined : skipToken);

  const reasons = DEAL_DISPUTE_REASONS[role];
  const schema = useMemo(() => createDealDisputeOpenSchema(t, reasons), [reasons, t]);
  const form = useForm<DealDisputeOpenValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_DISPUTE_OPEN,
  });

  const resetForm = form.reset;
  const open = useCallback(() => {
    resetForm(EMPTY_DISPUTE_OPEN);
    setVisible(true);
  }, [resetForm]);
  const close = useCallback(() => setVisible(false), []);
  /** Another sheet or screen opens only once this one is gone (iOS can't stack modals). */
  const onDismissed = useCallback(() => {
    const next = afterClose.current;
    afterClose.current = null;
    next?.();
  }, []);
  const closeThen = useCallback((next: () => void) => {
    afterClose.current = next;
    setVisible(false);
  }, []);

  const openFile = useCallback(() => navigation.navigate('DealDispute', { id }), [id, navigation]);
  const openSupport = useOpenSupport();
  const goSupport = useCallback(
    () => closeThen(() => openSupport(t('marketplace.deals.dispute.open.supportMessage', { id }))),
    [closeThen, id, openSupport, t],
  );

  const [openDispute, { isLoading }] = useOpenDealDisputeMutation();
  const submit = form.handleSubmit;
  const setError = form.setError;
  const onConfirm = useCallback(async (): Promise<boolean> => {
    let done = false;
    await submit(async values => {
      if (isLoading) return;
      try {
        await openDispute({ ref, body: toDisputeOpenBody(values) }).unwrap();
        toastService.success(t('marketplace.deals.dispute.open.toast'));
        done = true;
        closeThen(openFile);
      } catch (err) {
        const error = normalizeApiError(err);
        // The deal moved (limit reached, status changed): the server says why, the deal refetches.
        if (isDealConflictError(error)) {
          toastService.error(error.message);
          setVisible(false);
          return;
        }
        if (!applyServerFieldErrors(err, OPEN_FIELDS, setError)) reportDealFailure(error);
      }
    })();
    return done;
  }, [closeThen, isLoading, openDispute, openFile, ref, setError, submit, t]);

  return {
    canOpen,
    disputesLeft: deal?.disputeWindow.disputesLeft ?? 0,
    closedReason: deal?.disputeWindow.closedReason ?? null,
    dispute,
    phase,
    /** The summary card on the deal page: while a dispute is open or after its ruling. */
    showCard: phase !== null && phase !== 'withdrawn',
    visible,
    open,
    close,
    onDismissed,
    control: form.control,
    reasons,
    reasonDefs: DEAL_DISPUTE_REASON_DEF,
    onConfirm,
    sending: isLoading,
    strikes: strikes.data ?? null,
    openFile,
    goSupport,
  };
};

export type DealDisputeModel = ReturnType<typeof useDealDispute>;
