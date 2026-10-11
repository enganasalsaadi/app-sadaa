import { normalizeApiError } from '@/core/api';

/** Unhandled 4xx only: 403/5xx open the global modals, offline shows the snackbar. */
export const shouldToastFailure = (error: unknown): boolean => {
  const { statusCode, isForbidden, isServerError } = normalizeApiError(error);
  return statusCode !== null && !isForbidden && !isServerError;
};
