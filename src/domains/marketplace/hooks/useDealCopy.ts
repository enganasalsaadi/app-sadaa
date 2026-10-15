import { useCallback } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

/** Copies a brief value (tag, code, link) and says so; the creator pastes them into the post. */
export const useDealCopy = () => {
  const { t } = useTranslation();
  const toast = useToast();
  return useCallback(
    (value: string) => {
      Clipboard.setString(value);
      toast.success(t('marketplace.deals.dossier.copied'));
    },
    [t, toast],
  );
};
