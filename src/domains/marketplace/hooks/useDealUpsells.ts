import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors } from '@/core/api';
import type { DealsStackScreenProps } from '@/core/navigation';
import { getPersistentDeviceId } from '@/core/notification';
import { toastService } from '@/core/toast';
import { DEAL_UPSELL_DECLINE_REASON_DEF } from '../constants/dealChanges';
import { createDealReasonNoteSchema, EMPTY_REASON, type DealReasonFormValues } from '../schemas/dealCancelSchema';
import { DEAL_UPSELL_DECLINE_REASON, type Deal, type DealRole } from '../types';
import { reportDealFailure, type DealActionOutcome } from '../utils/dealAction';
import { toReasonBody } from '../utils/dealCancel';
import { dealUpsellsView } from '../utils/dealUpsell';
import { useDealAction } from './useDealAction';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

const REASON_FIELDS = { reason: 'reason', note: 'note' } as const;

/** The upsell sheets on the deal page: the creator declining, the brand pulling its addendum back. */
type DealUpsellSheet = 'decline' | 'withdraw';

/**
 * Addenda on the deal page (handoff M8). The pending one sits near the top: the creator signs it
 * (press and hold, this device, idempotent) or declines with a reason; the brand sees it waiting
 * and can withdraw it. Answered ones list below. The brand adds a new one on the builder screen
 * while the server keeps the window open.
 */
export const useDealUpsells = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const view = useMemo(() => (deal ? dealUpsellsView(deal) : null), [deal]);
  const pending = view?.pending ?? null;
  const pendingId = pending?.id ?? null;

  const accept = useDealAction(ref, { idempotent: true });
  const decline = useDealAction(ref);
  const withdraw = useDealAction(ref);

  // A new proposal is a new intent: a key kept from a failed accept of the last one must not carry over.
  const resetAcceptIntent = accept.resetIntent;
  useEffect(() => {
    resetAcceptIntent();
  }, [pendingId, resetAcceptIntent]);

  const [sheet, setSheet] = useState<DealUpsellSheet | null>(null);
  const close = useCallback(() => setSheet(null), []);

  const schema = useMemo(() => createDealReasonNoteSchema(t, DEAL_UPSELL_DECLINE_REASON), [t]);
  const form = useForm<DealReasonFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_REASON,
  });
  const resetForm = form.reset;
  const openDecline = useCallback(() => {
    resetForm(EMPTY_REASON);
    setSheet('decline');
  }, [resetForm]);
  const openWithdraw = useCallback(() => setSheet('withdraw'), []);

  /** Success → toast; a conflict closes the sheet (toasted, refetched); else the sheet stays. */
  const settle = useCallback((outcome: DealActionOutcome, success: string) => {
    if (outcome.ok) {
      setSheet(null);
      toastService.success(success);
      return true;
    }
    if (outcome.conflict) setSheet(null);
    return false;
  }, []);

  const runAccept = accept.run;
  const onAccept = useCallback(async (): Promise<boolean> => {
    if (!pendingId) return false;
    const deviceId = await getPersistentDeviceId();
    const outcome = await runAccept(`upsells/${pendingId}/accept`, { body: { device_id: deviceId } });
    if (!outcome.ok && !outcome.conflict) reportDealFailure(outcome.error);
    return settle(outcome, t('marketplace.deals.changes.upsells.toast.accepted'));
  }, [pendingId, runAccept, settle, t]);

  const runDecline = decline.run;
  const declineSubmit = form.handleSubmit;
  const setError = form.setError;
  const onDecline = useCallback(() => {
    declineSubmit(async values => {
      if (!pendingId) return;
      const outcome = await runDecline(`upsells/${pendingId}/decline`, { body: toReasonBody(values) });
      if (outcome.ok || outcome.conflict) {
        settle(outcome, t('marketplace.deals.changes.upsells.toast.declined'));
        return;
      }
      if (!applyServerFieldErrors(outcome.error, REASON_FIELDS, setError)) reportDealFailure(outcome.error);
    })();
  }, [declineSubmit, pendingId, runDecline, setError, settle, t]);

  const runWithdraw = withdraw.run;
  const onWithdraw = useCallback(async () => {
    if (!pendingId) return;
    const outcome = await runWithdraw(`upsells/${pendingId}/withdraw`);
    if (!outcome.ok && !outcome.conflict) reportDealFailure(outcome.error);
    settle(outcome, t('marketplace.deals.changes.upsells.toast.withdrawn'));
  }, [pendingId, runWithdraw, settle, t]);

  const openBuilder = useCallback(() => navigation.navigate('DealUpsellBuilder', { id }), [id, navigation]);

  return {
    pending,
    history: view?.history ?? [],
    canPropose: role === 'brand' && deal?.upsellWindow.open === true && deal.onHold === null,
    openBuilder,
    sheet,
    close,
    onAccept,
    accepting: accept.isRunning,
    openDecline,
    declineControl: form.control,
    declineReasonDefs: DEAL_UPSELL_DECLINE_REASON_DEF,
    onDecline,
    declining: decline.isRunning,
    openWithdraw,
    onWithdraw,
    withdrawing: withdraw.isRunning,
  };
};

export type DealUpsellsModel = ReturnType<typeof useDealUpsells>;
