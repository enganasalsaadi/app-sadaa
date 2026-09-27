import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

type ConfirmKind = 'neutral' | 'danger';

export const useConfirmSheetDemo = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [kind, setKind] = useState<ConfirmKind | null>(null);

  const openNeutral = useCallback(() => setKind('neutral'), []);
  const openDanger = useCallback(() => setKind('danger'), []);
  const close = useCallback(() => setKind(null), []);
  const confirm = useCallback(() => {
    setKind(null);
    toast.info(t('devShowcase.confirmSheet.confirmed'));
  }, [t, toast]);

  return { kind, openNeutral, openDanger, close, confirm };
};
