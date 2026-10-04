import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetConfigQuery } from '@/core/api';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { toastService } from '@/core/toast';
import { openWhatsApp } from '@/shared/utils';
import { formatPhoneForDisplay } from '@/domains/auth';

/** Opens support on WhatsApp with a prefilled "change my phone number" request. */
export const useSupportContact = () => {
  const { t } = useTranslation();
  const { data: config } = useGetConfigQuery();
  const supportNumber = config?.support.whatsapp || SUPPORT_WHATSAPP_NUMBER;

  return useCallback(() => {
    openWhatsApp(supportNumber, t('account.phoneLocked.supportMessage')).catch(() =>
      toastService.error(
        t('account.phoneLocked.openFailed', { number: formatPhoneForDisplay(supportNumber) }),
      ),
    );
  }, [supportNumber, t]);
};
