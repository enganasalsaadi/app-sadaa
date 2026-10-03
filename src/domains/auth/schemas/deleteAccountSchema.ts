import * as yup from 'yup';
import type { TFunction } from 'i18next';

export interface DeleteAccountFormValues {
  currentPassword: string;
}

// Presence only: the server decides whether it matches (422 `current_password`).
export const createDeleteAccountSchema = (
  t: TFunction,
): yup.ObjectSchema<DeleteAccountFormValues> =>
  yup.object({
    currentPassword: yup.string().required(t('validation.required')),
  });
