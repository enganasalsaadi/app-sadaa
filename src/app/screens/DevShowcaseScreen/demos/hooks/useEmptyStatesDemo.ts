import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

/** Fake request time so the retry button's loading state is visible. */
const DEMO_RETRY_MS = 1200;

export const useEmptyStatesDemo = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!retrying) return;
    const timer = setTimeout(() => setRetrying(false), DEMO_RETRY_MS);
    return () => clearTimeout(timer);
  }, [retrying]);

  const retry = useCallback(() => setRetrying(true), []);
  const create = useCallback(
    () => toast.info(t('devShowcase.emptyStates.createPressed')),
    [t, toast],
  );

  return { retrying, retry, create };
};
