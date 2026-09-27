import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

export const useNoticeDemo = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => setDismissed(true), []);
  const restore = useCallback(() => setDismissed(false), []);
  const act = useCallback(() => toast.info(t('devShowcase.notice.actionPressed')), [t, toast]);

  return { dismissed, dismiss, restore, act };
};
