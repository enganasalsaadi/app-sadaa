import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { extractServerFieldErrors, normalizeApiError } from '@/core/api';
import { useCountdown, useDiscardGuard } from '@/core/hooks';
import { formatDate } from '@/core/i18n';
import type { KycDocumentGroupParam } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import {
  INFLUENCER_KYC_ALLOWED_MIME_TYPES,
  INFLUENCER_KYC_MAX_FILE_BYTES,
  KYC_ALLOWED_MIME_TYPES,
  KYC_MAX_FILE_BYTES,
  formatClock,
  isKycAlreadySubmitted,
  selectUser,
  selectUserType,
  toFormDataFile,
} from '@/domains/auth';
import { useFilePicker, type FilePickError } from '@/shared/ui';
import { useGetKycQuery, useSubmitKycMutation } from '../../../api/kycApi';
import {
  BRAND_KYC_DOCUMENT_GROUPS,
  BRAND_KYC_DOCUMENT_SLOTS,
  KYC_FILE_FIELDS,
  type BrandKycDocumentType,
  type KycSlot,
} from '../../../constants/kyc';
import type { VerificationFlow } from '../../../hooks/useVerificationFlow';

interface KycScreenOptions {
  /** Brands: picker option 1 (company paperwork) or 2 (owner ID / passport). */
  documentGroup: KycDocumentGroupParam;
  flow: VerificationFlow;
}

/** Used when a 429 carries no `retry_after` (the limit is 5 per hour). */
const RATE_LIMIT_FALLBACK_S = 60;

const PICK_ERROR_KEY = {
  size: 'account.kyc.errors.size',
  type: 'account.kyc.errors.type',
  failed: 'account.kyc.errors.failed',
} as const satisfies Record<FilePickError, string>;

const DOCUMENT_TYPE_FIELD = 'kyc_document_type';

const toDateLabel = (iso: string | null): string | null =>
  iso ? formatDate(new Date(iso), { dateStyle: 'medium' }) : null;

export const useKycScreen = ({ documentGroup, flow }: KycScreenOptions) => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  // During registration the session role is known before the full user object.
  const sessionUserType = useAppSelector(selectUserType);
  const userType =
    user?.user_type ?? (sessionUserType === 'brand' ? 'brand' : 'influencer');
  const isBrand = userType === 'brand';
  const { onStarted } = flow;
  const documentTypes = BRAND_KYC_DOCUMENT_GROUPS[documentGroup];

  const kyc = useGetKycQuery();
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation();

  const idFront = useFilePicker({
    allowedMimeTypes: INFLUENCER_KYC_ALLOWED_MIME_TYPES,
    maxBytes: INFLUENCER_KYC_MAX_FILE_BYTES,
    fallbackName: t('account.kyc.idFrontFallbackName'),
  });
  const idBack = useFilePicker({
    allowedMimeTypes: INFLUENCER_KYC_ALLOWED_MIME_TYPES,
    maxBytes: INFLUENCER_KYC_MAX_FILE_BYTES,
    fallbackName: t('account.kyc.idBackFallbackName'),
  });
  // Brands: no webp (contract §7.4).
  const document = useFilePicker({
    allowedMimeTypes: KYC_ALLOWED_MIME_TYPES,
    maxBytes: KYC_MAX_FILE_BYTES,
    fallbackName: t('account.kyc.documentFallbackName'),
  });
  const pickers = useMemo(
    () => ({ idFront, idBack, document }),
    [idFront, idBack, document],
  );

  const [documentType, setDocumentType] = useState<BrandKycDocumentType>(documentTypes[0]);
  const [showMissing, setShowMissing] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<KycSlot | 'documentType', string>>>(
    {},
  );
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  // Sent: the picked files are no longer unsaved (the wizard leaves right after).
  const [sent, setSent] = useState(false);
  const waitSeconds = useCountdown(retryUntil);

  const slots = useMemo<readonly KycSlot[]>(
    () => (isBrand ? BRAND_KYC_DOCUMENT_SLOTS[documentType] : ['idFront', 'idBack']),
    [isBrand, documentType],
  );
  const canSubmit = kyc.data?.can_submit ?? false;
  const hasFiles = slots.some(slot => pickers[slot].file);
  const guard = useDiscardGuard(canSubmit && hasFiles && !isSubmitting && !sent);

  const slotError = useCallback(
    (slot: KycSlot): string | null => {
      const picker = pickers[slot];
      if (picker.pickError) return t(PICK_ERROR_KEY[picker.pickError]);
      if (serverErrors[slot]) return serverErrors[slot] ?? null;
      if (showMissing && !picker.file) return t('account.kyc.errors.required');
      return null;
    },
    [pickers, serverErrors, showMissing, t],
  );

  // A new file replaces the server's verdict on the old one.
  const pickSlot = useCallback(
    (slot: KycSlot) => {
      setServerErrors(prev => ({ ...prev, [slot]: undefined }));
      pickers[slot].onPick();
    },
    [pickers],
  );

  const removeSlot = useCallback((slot: KycSlot) => pickers[slot].onRemove(), [pickers]);

  const onDocumentTypeChange = useCallback((next: BrandKycDocumentType) => {
    setDocumentType(next);
    setServerErrors(prev => ({ ...prev, documentType: undefined }));
  }, []);

  const onSubmit = useCallback(async () => {
    if (waitSeconds > 0 || isSubmitting) return;
    const form = new FormData();
    for (const slot of slots) {
      const file = pickers[slot].file;
      if (!file) {
        setShowMissing(true);
        return;
      }
      form.append(KYC_FILE_FIELDS[slot], toFormDataFile(file));
    }
    if (isBrand) form.append(DOCUMENT_TYPE_FIELD, documentType);

    try {
      await submitKyc(form).unwrap();
      setSent(true);
      toastService.success(t('account.kyc.submitted'));
      onStarted();
    } catch (err) {
      const apiError = normalizeApiError(err);
      if (isKycAlreadySubmitted(apiError)) {
        // Someone (or an earlier timed-out try) already sent it: show the real status.
        setSent(true);
        kyc.refetch();
        toastService.info(t('account.kyc.alreadySubmitted'));
        onStarted();
        return;
      }
      if (apiError.statusCode === 429) {
        setRetryUntil(Date.now() + (apiError.retryAfter ?? RATE_LIMIT_FALLBACK_S) * 1000);
        return;
      }
      if (apiError.statusCode === 422) {
        // baseQuery already toasted it; pin each message to its file.
        const fields = extractServerFieldErrors(err) ?? {};
        setServerErrors({
          idFront: fields[KYC_FILE_FIELDS.idFront],
          idBack: fields[KYC_FILE_FIELDS.idBack],
          document: fields[KYC_FILE_FIELDS.document],
          documentType: fields[DOCUMENT_TYPE_FIELD],
        });
        return;
      }
      // 403/5xx open the global modals.
      if (!apiError.isForbidden && !apiError.isServerError) toastService.error(t('errors.generic'));
    }
  }, [waitSeconds, isSubmitting, slots, pickers, isBrand, documentType, submitKyc, t, kyc, onStarted]);

  const status = kyc.data?.status ?? 'unverified';

  return {
    userType,
    isBrand,
    status,
    rejectionReason: kyc.data?.rejection_reason ?? null,
    submittedAt: toDateLabel(kyc.data?.submitted_at ?? null),
    reviewedAt: toDateLabel(kyc.data?.reviewed_at ?? null),
    canSubmit,
    isLoading: kyc.isLoading,
    isError: kyc.isError && !kyc.data,
    loadError: kyc.error,
    retry: kyc.refetch,
    files: { idFront: idFront.file, idBack: idBack.file, document: document.file },
    slotError,
    pickSlot,
    removeSlot,
    documentGroup,
    documentTypes,
    documentType,
    slots,
    documentTypeError: serverErrors.documentType ?? null,
    onDocumentTypeChange,
    onSubmit,
    isSubmitting,
    submitLabel:
      waitSeconds > 0
        ? t('account.kyc.retryIn', { time: formatClock(waitSeconds) })
        : t(status === 'rejected' ? 'account.kyc.resubmit' : 'account.kyc.submit'),
    isRateLimited: waitSeconds > 0,
    guard,
  };
};

export type KycScreenModel = ReturnType<typeof useKycScreen>;
