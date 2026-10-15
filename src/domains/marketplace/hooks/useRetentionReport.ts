import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { formatNumber } from '@/core/i18n';
import { toastService } from '@/core/toast';
import type { RequestUploadSlot } from '@/core/upload';
import {
  useReportDealRetentionMutation,
  useRequestRetentionReportSlotMutation,
} from '../api/dealRetentionApi';
import { DEAL_RETENTION_LIMITS } from '../constants/dealRetention';
import {
  createDealRetentionReportSchema,
  EMPTY_RETENTION_REPORT,
  type DealRetentionReportValues,
} from '../schemas/dealRetentionSchema';
import { reportDealFailure, toastDealConflict } from '../utils/dealAction';
import { toRetentionReportBody } from '../utils/dealRetention';
import { useRetentionShots } from './useRetentionShots';

const REPORT_FIELDS = { reason: 'reason', note: 'note' } as const;

/**
 * The brand reporting a post that went down inside its period (B10): what happened, a note (needed
 * for «other»), 1–3 screenshots. A plain button, not a hold: nothing binding moves yet, the creator
 * gets a day to answer. A closed window or an open case (409) says so and closes.
 */
export const useRetentionReport = (dealId: string, creatorName: string) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  const [requestSlot] = useRequestRetentionReportSlotMutation();
  const slot = useCallback<RequestUploadSlot>(
    request =>
      itemId
        ? requestSlot({ dealId, itemId, request }).unwrap()
        : Promise.reject(new Error('retention report: no post picked')),
    [dealId, itemId, requestSlot],
  );
  const shots = useRetentionShots('retention_report', slot);

  const schema = useMemo(() => createDealRetentionReportSchema(t), [t]);
  const { control, handleSubmit, setError, reset } =
    useForm<DealRetentionReportValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY_RETENTION_REPORT,
    });

  const resetShots = shots.reset;
  const open = useCallback(
    (target: string) => {
      reset(EMPTY_RETENTION_REPORT);
      resetShots();
      setItemId(target);
      setVisible(true);
    },
    [reset, resetShots],
  );
  const close = useCallback(() => setVisible(false), []);

  const [report, { isLoading }] = useReportDealRetentionMutation();
  const { ready, flagMissing, fileIds, setError: setShotsError } = shots;
  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading || !itemId || !ready()) return;
      try {
        await report({
          dealId,
          itemId,
          body: toRetentionReportBody(values, fileIds),
        }).unwrap();
        toastService.success(
          t('marketplace.deals.retention.report.toast', {
            name: creatorName,
            hours: formatNumber(DEAL_RETENTION_LIMITS.answerHours),
          }),
        );
        resetShots();
        setVisible(false);
      } catch (err) {
        const error = normalizeApiError(err);
        if (toastDealConflict(error)) {
          setVisible(false);
          return;
        }
        if (error.code === 'deal_upload_invalid') {
          setShotsError(error.message);
          return;
        }
        if (!applyServerFieldErrors(err, REPORT_FIELDS, setError))
          reportDealFailure(error);
      }
    }, flagMissing)();
  }, [
    creatorName,
    dealId,
    fileIds,
    flagMissing,
    handleSubmit,
    isLoading,
    itemId,
    ready,
    report,
    resetShots,
    setError,
    setShotsError,
    t,
  ]);

  return {
    visible,
    itemId,
    open,
    close,
    control,
    shots,
    onSubmit,
    sending: isLoading,
  };
};

export type RetentionReportModel = ReturnType<typeof useRetentionReport>;
