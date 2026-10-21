import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupportWhatsApp } from '@/core/market';
import { toastService } from '@/core/toast';
import { openWhatsApp } from '@/shared/utils';
import { formatPhoneForDisplay } from '../utils/formatPhoneForDisplay';

/**
 * Opens support on WhatsApp with a prefilled message (number from the server config).
 * When WhatsApp can't open, the toast shows the number to message by hand.
 */
export const useOpenSupport = () => {
  const { t } = useTranslation();
  const supportNumber = useSupportWhatsApp();

  return useCallback(
    (message: string) => {
      if (!supportNumber) {
        toastService.error(t('common.support.unavailable'));
        return;
      }
      openWhatsApp(supportNumber, message).catch(() =>
        toastService.error(
          t('common.support.openFailed', { number: formatPhoneForDisplay(supportNumber) }),
        ),
      );
    },
    [supportNumber, t],
  );
};
