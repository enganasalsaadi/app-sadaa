import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenSupport } from '@/domains/auth';

/** Opens support on WhatsApp with a prefilled "change my phone number" request. */
export const useSupportContact = () => {
  const { t } = useTranslation();
  const openSupport = useOpenSupport();

  return useCallback(
    () => openSupport(t('account.phoneLocked.supportMessage')),
    [openSupport, t],
  );
};
