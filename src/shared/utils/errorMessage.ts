/** Human message from anything thrown or returned as an error; `fallback` when there is none. */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
};
