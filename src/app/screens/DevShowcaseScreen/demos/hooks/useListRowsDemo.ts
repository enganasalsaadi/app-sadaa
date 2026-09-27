import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

const DEMO_LOADING_MS = 1200;

export const useListRowsDemo = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [vacationMode, setVacationMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), DEMO_LOADING_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  const press = useCallback(() => toast.info(t('devShowcase.listRows.pressed')), [t, toast]);
  const startLoading = useCallback(() => setLoading(true), []);

  return { vacationMode, setVacationMode, loading, startLoading, press };
};
