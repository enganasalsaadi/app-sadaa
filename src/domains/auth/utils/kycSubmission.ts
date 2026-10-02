import type { AppApiError } from '@/core/api';
import type { PickedFile } from '@/shared/ui';

/** Multipart file part for a picked document. */
export const toFormDataFile = (file: PickedFile): FormDataValue => ({
  uri: file.uri,
  name: file.name,
  type: file.type,
});

/** Skip body for the KYC steps: multipart booleans are "1"/"0" (contract §7). */
export const createKycSkipForm = (): FormData => {
  const form = new FormData();
  form.append('is_skipped', '1');
  return form;
};

/** A submission already exists, typically an earlier upload that timed out client-side. */
export const isKycAlreadySubmitted = (error: AppApiError): boolean =>
  error.code === 'kyc_already_pending' || error.code === 'kyc_already_verified';
