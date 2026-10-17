import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors } from '@/core/api';
import { toastService } from '@/core/toast';
import {
  createDealBriefExitSchema,
  EMPTY_BRIEF_EXIT,
  type DealBriefExitFormValues,
} from '../schemas/dealBriefExitSchema';
import type { Deal, DealRole } from '../types';
import { reportDealFailure } from '../utils/dealAction';
import { briefExitWindow, toBriefExitBody } from '../utils/dealBriefExit';
import { useClock } from './useClock';
import { useDealAction } from './useDealAction';

const MINUTE_MS = 60_000;
const NOTE_FIELD = { note: 'note' } as const;

/**
 * The creator's clean exit from a linked deal (PC6.2, contract §5.2): for 24 hours after the
 * brand funds it, the creator can read the brief and leave with no strike, the brand refunded in full. The
 * window comes from the server (`briefExitAvailable` / `briefExitUntil`); the clock only closes
 * it a tick early. Press-and-hold with one idempotency key per intent (rule 06). A late tap gets
 * `409 deal_brief_exit_closed`: the server's words, the deal refetches and the card goes away.
 */
export const useDealBriefExit = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const now = useClock(MINUTE_MS);
  const exitWindow = useMemo(
    () => (role === 'creator' && deal ? briefExitWindow(deal, now) : null),
    [deal, now, role],
  );

  const [visible, setVisible] = useState(false);
  const schema = useMemo(() => createDealBriefExitSchema(t), [t]);
  const form = useForm<DealBriefExitFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_BRIEF_EXIT,
  });
  const action = useDealAction(ref, { idempotent: true });

  const resetForm = form.reset;
  const resetIntent = action.resetIntent;
  const open = useCallback(() => {
    resetForm(EMPTY_BRIEF_EXIT);
    resetIntent();
    setVisible(true);
  }, [resetForm, resetIntent]);
  const close = useCallback(() => setVisible(false), []);

  const run = action.run;
  const submit = form.handleSubmit;
  const setError = form.setError;
  const onConfirm = useCallback(async (): Promise<boolean> => {
    let done = false;
    await submit(async ({ note }) => {
      const outcome = await run('brief-exit', { body: toBriefExitBody(note) });
      if (outcome.ok) {
        toastService.success(t('marketplace.deals.briefExit.toast.left'));
        setVisible(false);
        done = true;
        return;
      }
      if (outcome.conflict) {
        setVisible(false);
        return;
      }
      if (!applyServerFieldErrors(outcome.error, NOTE_FIELD, setError)) reportDealFailure(outcome.error);
    })();
    return done;
  }, [run, setError, submit, t]);

  return {
    available: exitWindow !== null,
    until: exitWindow?.until ?? null,
    visible,
    open,
    close,
    control: form.control,
    onConfirm,
    sending: action.isRunning,
  };
};

export type DealBriefExitModel = ReturnType<typeof useDealBriefExit>;
