import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { formatNumber } from '@/core/i18n';
import { toastService } from '@/core/toast';
import type { RequestUploadSlot } from '@/core/upload';
import {
  useRequestRetentionRestoreSlotMutation,
  useRestoreDealRetentionMutation,
} from '../api/dealRetentionApi';
import {
  DEAL_LIVE_PLATFORM_LABEL,
  DEAL_LIVE_URL_REASON_COPY,
} from '../constants/dealPublish';
import { DEAL_RETENTION_LIMITS } from '../constants/dealRetention';
import {
  createDealRetentionRestoreSchema,
  EMPTY_RETENTION_RESTORE,
  type DealRetentionRestoreValues,
} from '../schemas/dealRetentionSchema';
import { reportDealFailure, toastDealConflict } from '../utils/dealAction';
import { isLivePlatform, readLiveUrlReason } from '../utils/dealPublish';
import { toRetentionRestoreBody } from '../utils/dealRetention';
import { useRetentionShots } from './useRetentionShots';

const RESTORE_FIELDS = { url: 'url' } as const;

/** The case being answered and its post's platform (for the link's diagnosis). */
interface RestoreTarget {
  caseId: string;
  platform: string | null;
}

/**
 * The creator putting a reported post back (B10): 1–3 screenshots showing it live (required by
 * the server) and, optionally, the new link, which the server reads like a publish link (account
 * check, not a link already used). The brand then has a day to confirm.
 */
export const useRetentionRestore = (dealId: string, brandName: string) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [target, setTarget] = useState<RestoreTarget | null>(null);
  const caseId = target?.caseId ?? null;

  const [requestSlot] = useRequestRetentionRestoreSlotMutation();
  const slot = useCallback<RequestUploadSlot>(
    request =>
      caseId
        ? requestSlot({ dealId, caseId, request }).unwrap()
        : Promise.reject(new Error('retention restore: no case picked')),
    [caseId, dealId, requestSlot],
  );
  const shots = useRetentionShots('retention_restore', slot);

  const schema = useMemo(() => createDealRetentionRestoreSchema(t), [t]);
  const { control, handleSubmit, setError, reset } =
    useForm<DealRetentionRestoreValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: EMPTY_RETENTION_RESTORE,
    });

  const resetShots = shots.reset;
  const open = useCallback(
    (next: RestoreTarget) => {
      reset(EMPTY_RETENTION_RESTORE);
      resetShots();
      setTarget(next);
      setVisible(true);
    },
    [reset, resetShots],
  );
  const close = useCallback(() => setVisible(false), []);

  const platform = target?.platform ?? null;
  const [restore, { isLoading }] = useRestoreDealRetentionMutation();
  const { ready, flagMissing, fileIds, setError: setShotsError } = shots;
  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading || !caseId || !ready()) return;
      try {
        await restore({
          dealId,
          caseId,
          body: toRetentionRestoreBody(values.url, fileIds),
        }).unwrap();
        toastService.success(
          t('marketplace.deals.retention.restore.toast', {
            name: brandName,
            hours: formatNumber(DEAL_RETENTION_LIMITS.confirmHours),
          }),
        );
        resetShots();
        setVisible(false);
      } catch (err) {
        const error = normalizeApiError(err);
        // The link was refused (wrong account, platform, already used): say why on the field.
        const reason = readLiveUrlReason(error);
        if (reason) {
          const label = isLivePlatform(platform)
            ? t(DEAL_LIVE_PLATFORM_LABEL[platform])
            : '';
          setError(
            'url',
            {
              type: reason,
              message: t(DEAL_LIVE_URL_REASON_COPY[reason].title, {
                platform: label,
              }),
            },
            { shouldFocus: true },
          );
          return;
        }
        if (toastDealConflict(error)) {
          setVisible(false);
          return;
        }
        if (error.code === 'deal_upload_invalid') {
          setShotsError(error.message);
          return;
        }
        if (!applyServerFieldErrors(err, RESTORE_FIELDS, setError))
          reportDealFailure(error);
      }
    }, flagMissing)();
  }, [
    brandName,
    caseId,
    dealId,
    fileIds,
    flagMissing,
    handleSubmit,
    isLoading,
    platform,
    ready,
    restore,
    resetShots,
    setError,
    setShotsError,
    t,
  ]);

  return {
    visible,
    caseId,
    open,
    close,
    control,
    shots,
    onSubmit,
    sending: isLoading,
  };
};

export type RetentionRestoreModel = ReturnType<typeof useRetentionRestore>;
