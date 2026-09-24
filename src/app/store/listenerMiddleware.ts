import { createListenerMiddleware, type UnknownAction } from '@reduxjs/toolkit';
import { env } from '@/core/config';
import { baseApi } from '@/core/api/baseApi';
import { normalizeApiError } from '@/core/api/errorHandler';
import { clearCredentials } from '@/domains/auth';

const hasApiLifecycle = (
  action: UnknownAction,
  lifecycle: 'fulfilled' | 'rejected',
): boolean => {
  return (
    typeof action.type === 'string' &&
    action.type.startsWith(`${baseApi.reducerPath}/`) &&
    action.type.endsWith(`/${lifecycle}`)
  );
};

export const apiListenerMiddleware = createListenerMiddleware();

apiListenerMiddleware.startListening({
  predicate: action => hasApiLifecycle(action, 'rejected'),
  effect: async (action, listenerApi) => {
    const payload = action as UnknownAction & {
      payload?: unknown;
      error?: unknown;
    };
    const apiError = normalizeApiError(payload.payload ?? payload.error);

    if (env.ENABLE_LOGS) {
      console.warn(
        `[API:${apiError.statusCode ?? 'unknown'}] ${apiError.message}`,
      );
    }

    if (apiError.isUnauthorized) {
      listenerApi.dispatch(clearCredentials());
    }
  },
});
