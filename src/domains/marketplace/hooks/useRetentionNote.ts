import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import {
  useContestDealRetentionMutation,
  useRejectDealRetentionMutation,
} from '../api/dealRetentionApi';
import {
  createDealRetentionNoteSchema,
  EMPTY_RETENTION_NOTE,
  type DealRetentionNoteValues,
} from '../schemas/dealRetentionSchema';
import type { DealRole } from '../types';
import { reportDealFailure, toastDealConflict } from '../utils/dealAction';
import { toRetentionNoteBody } from '../utils/dealRetention';

const NOTE_FIELDS = { note: 'note' } as const;

/**
 * The note that sends a case to the team (B10): the creator contesting the report, or the brand
 * rejecting the restore. Required, read by the admin who decides.
 */
export const useRetentionNote = (role: DealRole, dealId: string) => {
  const { t } = useTranslation();
  const brand = role === 'brand';
  const [visible, setVisible] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createDealRetentionNoteSchema(
        t,
        brand
          ? 'marketplace.deals.retention.reject.required'
          : 'marketplace.deals.retention.contest.required',
      ),
    [brand, t],
  );
  const { control, handleSubmit, setError, reset } =
    useForm<DealRetentionNoteValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY_RETENTION_NOTE,
    });

  const open = useCallback(
    (target: string) => {
      reset(EMPTY_RETENTION_NOTE);
      setCaseId(target);
      setVisible(true);
    },
    [reset],
  );
  const close = useCallback(() => setVisible(false), []);

  const [contest, contestState] = useContestDealRetentionMutation();
  const [reject, rejectState] = useRejectDealRetentionMutation();
  const sending = brand ? rejectState.isLoading : contestState.isLoading;
  const onSubmit = useCallback(() => {
    handleSubmit(async ({ note }) => {
      if (sending || !caseId) return;
      const args = { dealId, caseId, body: toRetentionNoteBody(note) };
      try {
        await (brand ? reject(args) : contest(args)).unwrap();
        toastService.success(
          t(
            brand
              ? 'marketplace.deals.retention.reject.toast'
              : 'marketplace.deals.retention.contest.toast',
          ),
        );
        setVisible(false);
      } catch (err) {
        const error = normalizeApiError(err);
        if (toastDealConflict(error)) {
          setVisible(false);
          return;
        }
        if (!applyServerFieldErrors(err, NOTE_FIELDS, setError))
          reportDealFailure(error);
      }
    })();
  }, [
    brand,
    caseId,
    contest,
    dealId,
    handleSubmit,
    reject,
    sending,
    setError,
    t,
  ]);

  return { visible, caseId, open, close, control, onSubmit, sending };
};

export type RetentionNoteModel = ReturnType<typeof useRetentionNote>;
