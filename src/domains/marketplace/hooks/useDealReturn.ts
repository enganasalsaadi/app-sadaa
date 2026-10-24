import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors } from '@/core/api';
import { HAPTIC_SUCCESS_MS } from '@/core/config';
import { toastService } from '@/core/toast';
import { createDealReturnSchema, type DealReturnFormValues } from '../schemas/dealReturnSchema';
import type { Deal, DealRole } from '../types';
import { reportDealFailure } from '../utils/dealAction';
import { dealReturnView, returnFormValues, toReturnBody, type DealReturnView } from '../utils/dealReturn';
import { formatRemaining, timerSecondsLeft } from '../utils/dealTimer';
import { useClock } from './useClock';
import { useCourierOptions } from './useCourierOptions';
import { useDealAction } from './useDealAction';

const MINUTE_MS = 60_000;
const FIELDS = {
  courier: 'courier',
  courier_name: 'courierName',
  tracking_no: 'trackingNo',
  tracking_url: 'trackingUrl',
  handed_at: 'handed',
} as const;

export interface DealReturnClock {
  /** «3 أيام» (or the hours, minutes) until the moment, or since it, when it has passed. */
  text: string;
  at: number;
  /** How much of the wait has gone, 0–1 (display only). */
  share: number;
}

/**
 * The return of a returnable sample (PC9.1, contract §5.5), creator side: the card's reading of
 * `return_shipment` and the waybill sheet. The waybill is a plain save (no hold): it can be entered
 * again until the brand answers. Saving lifts the account's lock, so the restrictions go stale with
 * the deal (`dealChangedTags`) and every banner folds away. A late tap gets `409
 * deal_return_unavailable`: the server's words, the deal refetches and the sheet closes.
 */
export const useDealReturn = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const now = useClock(MINUTE_MS);
  const ship = deal?.returnShipment ?? null;
  const view = useMemo<DealReturnView | null>(() => (deal ? dealReturnView(deal, now) : null), [deal, now]);
  const courierOptions = useCourierOptions();
  const { couriers } = courierOptions;

  const [visible, setVisible] = useState(false);
  const schema = useMemo(() => createDealReturnSchema(t), [t]);
  const form = useForm<DealReturnFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: returnFormValues(null, couriers, now),
  });
  const action = useDealAction(ref);

  const resetForm = form.reset;
  const open = useCallback(() => {
    resetForm(returnFormValues(ship, couriers, Date.now()));
    setVisible(true);
  }, [couriers, resetForm, ship]);
  const close = useCallback(() => setVisible(false), []);

  const run = action.run;
  const submit = form.handleSubmit;
  const setError = form.setError;
  const save = useMemo(
    () =>
      submit(async values => {
        const editing = ship?.status.key === 'shipped';
        const outcome = await run('return-shipment', { body: toReturnBody(values, Date.now()) });
        if (outcome.ok) {
          Vibration.vibrate(HAPTIC_SUCCESS_MS);
          toastService.success(
            t(editing ? 'marketplace.deals.return.toast.edited' : 'marketplace.deals.return.toast.saved'),
          );
          setVisible(false);
          return;
        }
        if (outcome.conflict) {
          setVisible(false);
          return;
        }
        if (!applyServerFieldErrors(outcome.error, FIELDS, setError)) reportDealFailure(outcome.error);
      }),
    [run, setError, ship?.status.key, submit, t],
  );
  const onSave = useCallback(() => {
    save();
  }, [save]);

  const dueAt = view?.dueAt ?? null;
  const late = view?.late ?? false;
  const dueShare = view?.dueShare ?? 0;
  // Account hold on the creator: no reminder or strike until it ends, so no countdown either.
  const onHold = ship?.onHold ?? false;
  const due = useMemo<DealReturnClock | null>(() => {
    if (dueAt === null || onHold) return null;
    const seconds = late ? Math.max(0, Math.floor((now - dueAt) / 1000)) : timerSecondsLeft(dueAt, now);
    return { text: formatRemaining(t, seconds), at: dueAt, share: dueShare };
  }, [dueAt, dueShare, late, now, onHold, t]);
  const shippedAt = ship?.shippedAt ?? null;
  const autoConfirm = useMemo<DealReturnClock | null>(() => {
    if (!view?.confirmBy) return null;
    const span = shippedAt === null ? 0 : view.confirmBy - shippedAt;
    return {
      text: formatRemaining(t, timerSecondsLeft(view.confirmBy, now)),
      at: view.confirmBy,
      share: span > 0 ? Math.min(1, Math.max(0, (now - (shippedAt ?? now)) / span)) : 0,
    };
  }, [now, shippedAt, t, view?.confirmBy]);

  const trackingNo = ship?.trackingNo ?? null;
  const copyTracking = useCallback(() => {
    if (!trackingNo) return;
    Clipboard.setString(trackingNo);
    toastService.success(t('marketplace.deals.return.copied'));
  }, [t, trackingNo]);
  const trackingUrl = ship?.trackingUrl ?? null;
  const copyLink = useCallback(() => {
    if (!trackingUrl) return;
    Clipboard.setString(trackingUrl);
    toastService.success(t('marketplace.deals.return.copied'));
  }, [t, trackingUrl]);

  return {
    ship,
    view,
    due,
    onHold,
    /** The deal is on account hold: the waybill can't be entered or edited until it resumes. */
    readOnly: deal?.onHold != null,
    autoConfirm,
    courierOptions,
    visible,
    open,
    close,
    control: form.control,
    setFocus: form.setFocus,
    onSave,
    saving: action.isRunning,
    copyTracking,
    copyLink,
  };
};

export type DealReturnModel = ReturnType<typeof useDealReturn>;
