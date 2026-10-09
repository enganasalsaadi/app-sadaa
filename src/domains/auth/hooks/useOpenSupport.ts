import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetConfigQuery } from '@/core/api';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { toastService } from '@/core/toast';
import { openWhatsApp } from '@/shared/utils';
import { formatPhoneForDisplay } from '../utils/formatPhoneForDisplay';

/**
 * Opens support on WhatsApp with a prefilled message (boot config number first).
 * When WhatsApp can't open, the toast shows the number to message by hand.
 */
export const useOpenSupport = () => {
  const { t } = useTranslation();
  const { data: config } = useGetConfigQuery();
  const supportNumber = config?.support.whatsapp || SUPPORT_WHATSAPP_NUMBER;

  return useCallback(
    (message: string) => {
      openWhatsApp(supportNumber, message).catch(() =>
        toastService.error(
          t('common.support.openFailed', { number: formatPhoneForDisplay(supportNumber) }),
        ),
      );
    },
    [supportNumber, t],
  );
};
