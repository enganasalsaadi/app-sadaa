import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors } from '@/core/api';
import type { Money } from '@/core/money';
import type { DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetDealStrikesQuery } from '../api/dealUpsellApi';
import { DEAL_CANCEL_REASON_DEF, DEAL_WITHDRAW_REASON_DEF } from '../constants/dealChanges';
import { createDealReasonNoteSchema, EMPTY_REASON, type DealReasonFormValues } from '../schemas/dealCancelSchema';
import { DEAL_BRAND_CANCEL_REASON, DEAL_WITHDRAW_REASON, type Deal, type DealRole } from '../types';
import { reportDealFailure } from '../utils/dealAction';
import { dealSettlement, toCancelBody, toReasonBody } from '../utils/dealCancel';
import { getDealActions } from '../utils/dealStatus';
import { useDealAction } from './useDealAction';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

const REASON_FIELDS = { reason: 'reason', note: 'note' } as const;

/**
 * Ending a running deal from the deal page (handoff M8). Brand: cancel on the server's current
 * terms (`cancellation.brand`: free, a kill fee, or dispute only), sending the outcome it saw;
 * moved terms come back as a conflict, the deal refetches and a banner shows the old and new
 * compensation before the brand confirms again. Creator: withdraw, which records a strike (the
 * sheet says so with the active count), unless the free shipping cancel is open — then the sheet
 * points there instead. Both are press-and-hold with one idempotency key per intent (rule 06).
 */
export const useDealCancel = (role: DealRole, id: string, deal: Deal | null, openFreeCancel: () => void) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const brand = role === 'brand';

  const actions = useMemo(() => (deal ? getDealActions(deal, role) : []), [deal, role]);
  // While the offer is still unanswered the brand pulls it back from the decision bar instead.
  const canCancel = actions.includes('cancel') && !actions.includes('withdrawOffer');
  const canWithdraw = actions.includes('withdraw');

  const [visible, setVisible] = useState(false);
  const [changedFrom, setChangedFrom] = useState<Money | null>(null);
  const [freeOffered, setFreeOffered] = useState(false);
  const afterClose = useRef<(() => void) | null>(null);

  const strikes = useGetDealStrikesQuery(!brand && visible ? undefined : skipToken);

  const reasons = brand ? DEAL_BRAND_CANCEL_REASON : DEAL_WITHDRAW_REASON;
  const schema = useMemo(() => createDealReasonNoteSchema(t, reasons), [reasons, t]);
  const form = useForm<DealReasonFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_REASON,
  });

  const action = useDealAction(ref, { idempotent: true });
  const resetIntent = action.resetIntent;
  const resetForm = form.reset;
  const open = useCallback(() => {
    resetForm(EMPTY_REASON);
    resetIntent();
    setChangedFrom(null);
    setFreeOffered(false);
    setVisible(true);
  }, [resetForm, resetIntent]);
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
  const goFreeCancel = useCallback(() => closeThen(openFreeCancel), [closeThen, openFreeCancel]);
  const openStrikes = useCallback(() => closeThen(() => navigation.navigate('Strikes')), [closeThen, navigation]);

  const terms = deal?.cancellation?.brand ?? null;
  const parts = useMemo(() => (terms && deal ? dealSettlement(terms, deal.total) : []), [deal, terms]);

  const run = action.run;
  const submit = form.handleSubmit;
  const setError = form.setError;
  const onConfirm = useCallback(async (): Promise<boolean> => {
    let done = false;
    await submit(async values => {
      const outcomeKey = terms?.outcome.key ?? null;
      if (brand && (outcomeKey === null || outcomeKey === 'dispute_only')) return;
      const outcome = brand
        ? await run('cancel', { body: toCancelBody(values, outcomeKey ?? 'free') })
        : await run('withdraw', { body: toReasonBody(values) });
      if (outcome.ok) {
        toastService.success(t(brand ? 'marketplace.deals.changes.toast.cancelled' : 'marketplace.deals.changes.toast.withdrew'));
        setVisible(false);
        done = true;
        return;
      }
      if (outcome.conflict) {
        // The deal refetches on every conflict; these three keep the sheet open on the new terms.
        switch (outcome.error.code) {
          case 'deal_cancel_terms_changed':
            setChangedFrom(terms?.killFee ?? { amount: 0, currency: deal?.total.currency ?? 'USD' });
            return;
          case 'deal_cancel_requires_dispute':
            return;
          case 'deal_free_cancel_available':
            setFreeOffered(true);
            return;
          default:
            setVisible(false);
            return;
        }
      }
      if (!applyServerFieldErrors(outcome.error, REASON_FIELDS, setError)) reportDealFailure(outcome.error);
    })();
    return done;
  }, [brand, deal?.total.currency, run, setError, submit, t, terms]);

  return {
    canCancel,
    canWithdraw,
    visible,
    open,
    close,
    onDismissed,
    control: form.control,
    reasons,
    reasonDefs: brand ? DEAL_CANCEL_REASON_DEF : DEAL_WITHDRAW_REASON_DEF,
    onConfirm,
    sending: action.isRunning,
    // Brand
    terms,
    parts,
    changedFrom,
    // Creator
    strike: deal?.cancellation?.creator.strike ?? false,
    strikes: strikes.data ?? null,
    freeCancel: freeOffered || actions.includes('freeCancel'),
    goFreeCancel,
    openStrikes,
  };
};

export type DealCancelModel = ReturnType<typeof useDealCancel>;
