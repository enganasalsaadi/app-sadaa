import { normalizeApiError } from '@/core/api';

export type PublicMediaKitStatus = 'loading' | 'ready' | 'not_found' | 'error';

interface PublicMediaKitQueryState {
  hasData: boolean;
  error: unknown;
  isFetching: boolean;
}

/**
 * §17.4: 404 means unknown, private, suspended or deleted, and the screen never
 * tells them apart. A 404 wins over stale data (the kit was hidden since).
 */
export const resolvePublicMediaKitStatus = ({
  hasData,
  error,
  isFetching,
}: PublicMediaKitQueryState): PublicMediaKitStatus => {
  const settledError = error !== undefined && !isFetching;
  if (settledError && normalizeApiError(error).statusCode === 404) {
    return 'not_found';
  }
  if (hasData) {
    return 'ready';
  }
  return settledError ? 'error' : 'loading';
};
