import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, type AppApiError } from '@/core/api';
import { navigate } from '@/core/navigation';
import { getPersistentDeviceId } from '@/core/notification';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser, useOpenSupport } from '@/domains/auth';
import {
  createDealDeclineSchema,
  createDealExtensionSchema,
  createDealReasonSchema,
  type DealDeclineFormValues,
  type DealExtensionFormValues,
  type DealReasonFormValues,
} from '../schemas/dealRespondSchema';
import type { Deal, DealFunding, DealRole } from '../types';
import type { DealActionOutcome } from '../utils/dealAction';
import {
  dealDockKind,
  dealExtensionAsk,
  dealExtensionRange,
  dealFundingState,
  type DealExtensionRange,
} from '../utils/dealRespond';
import { useDealAction } from './useDealAction';

/** The sheets of P4: the creator's answer, the brand's answer to an extension, pulling an offer back. */
export type DealRespondSheet =
  | 'accept'
  | 'decline'
  | 'extension'
  | 'approveExtension'
  | 'rejectExtension'
  | 'withdraw';

const DECLINE_FIELDS = { reason: 'reason', note: 'note' } as const;
const EXTENSION_FIELDS = { delivery_days: 'days', reason: 'reason' } as const;
const REASON_FIELDS = { reason: 'reason' } as const;

/** Before any extension is possible the form still needs a shape; the sheet never opens on it. */
const NO_RANGE: DealExtensionRange = { current: 0, min: 1, max: 1 };

/** Failures nobody else reports: 422 toasts in baseQuery, 403/5xx/offline have global UI. */
const reportFailure = (error: AppApiError) => {
  if (
    error.statusCode === 400 ||
    error.statusCode === 404 ||
    error.statusCode === 409
  ) {
    toastService.error(error.message);
  }
};

/**
 * Responding to and paying for an offer (handoff M4): which decision bar the deal shows, its
 * sheets and every action behind them. Signing sends this device's id; accept, extension,
 * extension approve, fund and withdraw carry an idempotency key per intent (rule 06). A closed
 * offer (`deal_deadline_passed`) gets the app's own words; any conflict closes the sheet on the
 * refetched deal. Totals and the missing amount are always the server's.
 */
export const useDealRespond = (
  role: DealRole,
  id: string,
  deal: Deal | null,
  funding: DealFunding | null,
  refetch: () => void,
  openContract: () => void,
) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const conflictCopy = useMemo(
    () => ({ deal_deadline_passed: t('marketplace.deals.respond.closed') }),
    [t],
  );
  const accept = useDealAction(ref, { idempotent: true, conflictCopy });
  const decline = useDealAction(ref, { conflictCopy });
  const extend = useDealAction(ref, { idempotent: true, conflictCopy });
  const approve = useDealAction(ref, { idempotent: true, conflictCopy });
  const reject = useDealAction(ref, { conflictCopy });
  const withdraw = useDealAction(ref, { idempotent: true, conflictCopy });
  const fund = useDealAction(ref, { idempotent: true, conflictCopy });

  const user = useAppSelector(selectUser);
  const openSupport = useOpenSupport();

  const dock = deal ? dealDockKind(deal, role) : null;
  const range = useMemo(() => (deal ? dealExtensionRange(deal) : null), [deal]);
  const ask = useMemo(() => (deal ? dealExtensionAsk(deal) : null), [deal]);
  const fundingState = dealFundingState(funding);
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;

  const [sheet, setSheet] = useState<DealRespondSheet | null>(null);
  const close = useCallback(() => setSheet(null), []);

  // The contract opens once the sheet has left the screen (iOS can't push under a dismissing modal).
  const contractNext = useRef(false);
  const onContract = useCallback(() => {
    contractNext.current = true;
    setSheet(null);
  }, []);
  const onSheetDismissed = useCallback(() => {
    if (!contractNext.current) return;
    contractNext.current = false;
    openContract();
  }, [openContract]);

  const declineSchema = useMemo(() => createDealDeclineSchema(t), [t]);
  const declineForm = useForm<DealDeclineFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(declineSchema),
    defaultValues: { reason: null, note: '' },
  });
  const extensionSchema = useMemo(
    () => createDealExtensionSchema(t, range ?? NO_RANGE),
    [range, t],
  );
  const extensionForm = useForm<DealExtensionFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(extensionSchema),
    defaultValues: { days: range?.min ?? NO_RANGE.min, reason: '' },
  });
  const reasonSchema = useMemo(() => createDealReasonSchema(t), [t]);
  const reasonForm = useForm<DealReasonFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(reasonSchema),
    defaultValues: { reason: '' },
  });

  const resetDeclineForm = declineForm.reset;
  const resetExtensionForm = extensionForm.reset;
  const resetReasonForm = reasonForm.reset;
  const resetExtendIntent = extend.resetIntent;
  const resetWithdrawIntent = withdraw.resetIntent;
  const open = useCallback(
    (next: DealRespondSheet) => {
      switch (next) {
        case 'decline':
          resetDeclineForm({ reason: null, note: '' });
          break;
        case 'extension':
          resetExtendIntent();
          resetExtensionForm({ days: range?.min ?? NO_RANGE.min, reason: '' });
          break;
        case 'withdraw':
          resetWithdrawIntent();
          resetReasonForm({ reason: '' });
          break;
        case 'rejectExtension':
          resetReasonForm({ reason: '' });
          break;
        case 'accept':
        case 'approveExtension':
          break;
        default: {
          const _exhaustive: never = next;
          return _exhaustive;
        }
      }
      setSheet(next);
    },
    [
      range,
      resetDeclineForm,
      resetExtendIntent,
      resetExtensionForm,
      resetReasonForm,
      resetWithdrawIntent,
    ],
  );

  const opens = useMemo(
    () =>
      ({
        accept: () => open('accept'),
        decline: () => open('decline'),
        extension: () => open('extension'),
        approveExtension: () => open('approveExtension'),
        rejectExtension: () => open('rejectExtension'),
        withdraw: () => open('withdraw'),
      } satisfies Record<DealRespondSheet, () => void>),
    [open],
  );

  /** Success → close + toast; conflict → close (already toasted, deal refetched); else the sheet stays. */
  const settle = useCallback(
    (
      outcome: DealActionOutcome,
      success: string,
      onFields?: (error: AppApiError) => boolean,
    ): boolean => {
      if (outcome.ok) {
        setSheet(null);
        toastService.success(success);
        return true;
      }
      if (outcome.conflict) {
        setSheet(null);
        return false;
      }
      if (!onFields?.(outcome.error)) reportFailure(outcome.error);
      return false;
    },
    [],
  );

  // — Creator ————————————————————————————————————————————————————————
  const runAccept = accept.run;
  const onAccept = useCallback(async (): Promise<boolean> => {
    const deviceId = await getPersistentDeviceId();
    const outcome = await runAccept('accept', {
      body: { device_id: deviceId },
    });
    const funded = outcome.ok ? outcome.result.funding?.funded ?? true : true;
    return settle(
      outcome,
      funded
        ? t('marketplace.deals.respond.toast.accepted')
        : t('marketplace.deals.respond.toast.acceptedUnfunded'),
    );
  }, [runAccept, settle, t]);

  const runDecline = decline.run;
  const setDeclineError = declineForm.setError;
  const declineSubmit = declineForm.handleSubmit;
  const onDecline = useMemo(
    () =>
      declineSubmit(async ({ reason, note }) => {
        const outcome = await runDecline('decline', {
          body: { reason, ...(note ? { note } : {}) },
        });
        settle(outcome, t('marketplace.deals.respond.toast.declined'), error =>
          applyServerFieldErrors(error, DECLINE_FIELDS, setDeclineError),
        );
      }),
    [declineSubmit, runDecline, setDeclineError, settle, t],
  );

  const runExtend = extend.run;
  const setExtensionError = extensionForm.setError;
  const extensionSubmit = extensionForm.handleSubmit;
  const onExtension = useCallback(
    () =>
      new Promise<boolean>(resolve => {
        extensionSubmit(
          async ({ days, reason }) => {
            const deviceId = await getPersistentDeviceId();
            const outcome = await runExtend('extension', {
              body: { delivery_days: days, reason, device_id: deviceId },
            });
            resolve(
              settle(
                outcome,
                t('marketplace.deals.respond.toast.extensionSent'),
                error =>
                  applyServerFieldErrors(
                    error,
                    EXTENSION_FIELDS,
                    setExtensionError,
                  ),
              ),
            );
          },
          () => resolve(false),
        )();
      }),
    [extensionSubmit, runExtend, setExtensionError, settle, t],
  );

  // — Brand ——————————————————————————————————————————————————————————
  const runApprove = approve.run;
  const onApproveExtension = useCallback(async (): Promise<boolean> => {
    const deviceId = await getPersistentDeviceId();
    const outcome = await runApprove('extension/approve', {
      body: { device_id: deviceId },
    });
    const funded = outcome.ok ? outcome.result.funding?.funded ?? true : true;
    return settle(
      outcome,
      funded
        ? t('marketplace.deals.respond.toast.extensionApproved')
        : t('marketplace.deals.respond.toast.extensionApprovedUnfunded'),
    );
  }, [runApprove, settle, t]);

  const runReject = reject.run;
  const runWithdraw = withdraw.run;
  const setReasonError = reasonForm.setError;
  const reasonSubmit = reasonForm.handleSubmit;
  const onReason = useMemo(
    () =>
      reasonSubmit(async ({ reason }) => {
        const body = reason ? { reason } : {};
        const fields = (error: AppApiError) =>
          applyServerFieldErrors(error, REASON_FIELDS, setReasonError);
        if (sheet === 'rejectExtension') {
          settle(
            await runReject('extension/decline', { body }),
            t('marketplace.deals.respond.toast.extensionRejected'),
            fields,
          );
        } else {
          settle(
            await runWithdraw('withdraw', { body }),
            t('marketplace.deals.respond.toast.withdrawn'),
            fields,
          );
        }
      }),
    [reasonSubmit, runReject, runWithdraw, setReasonError, settle, sheet, t],
  );

  const runFund = fund.run;
  const onFund = useCallback(async () => {
    const outcome = await runFund('fund');
    if (outcome.ok) {
      toastService.success(t('marketplace.deals.respond.toast.funded'));
      return;
    }
    if (outcome.conflict) return;
    reportFailure(outcome.error);
    // Still short or frozen: the detail's `funding` says by how much now.
    refetch();
  }, [refetch, runFund, t]);

  const missing = funding?.missing ?? null;
  const onTopUp = useCallback(() => {
    if (!missing || missing.amount <= 0) return;
    navigate('Main', {
      screen: 'WalletTab',
      params: { screen: 'TopUp', params: { amount: missing }, initial: false },
    });
  }, [missing]);

  const onSupport = useCallback(
    () =>
      openSupport(
        t('marketplace.deals.respond.funding.supportMessage', { id }),
      ),
    [id, openSupport, t],
  );

  return {
    dock,
    sheet,
    opens,
    close,
    onContract,
    onSheetDismissed,
    range,
    ask,
    funding,
    fundingState,
    canTopUp,
    declineControl: declineForm.control,
    extensionControl: extensionForm.control,
    reasonControl: reasonForm.control,
    onAccept,
    onDecline,
    declining: decline.isRunning,
    onExtension,
    onApproveExtension,
    onReason,
    reasonSending: reject.isRunning || withdraw.isRunning,
    onFund,
    isFunding: fund.isRunning,
    onTopUp,
    onSupport,
  };
};

export type DealRespondModel = ReturnType<typeof useDealRespond>;
