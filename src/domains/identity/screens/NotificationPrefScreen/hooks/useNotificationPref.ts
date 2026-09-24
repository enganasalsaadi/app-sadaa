import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} from '../../../api/accountApi';
import { toastService } from '@/core/toast';
import { goBack } from '@/core/navigation';

export type NotificationToggles = {
  booking_confirmations: boolean;
  booking_reminders: boolean;
  review_requests: boolean;
  promotions: boolean;
};

export const useNotificationPref = () => {
  const { t } = useTranslation();
  const { data: preferences, isLoading: isFetching } = useGetPreferencesQuery();
  const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation();

  const [toggles, setToggles] = useState<NotificationToggles>({
    booking_confirmations: true,
    booking_reminders: true,
    review_requests: true,
    promotions: false,
  });

  useEffect(() => {
    const source = preferences?.notifications;
    if (source) {
      setToggles({
        booking_confirmations: source.booking_confirmations,
        booking_reminders: source.booking_reminders,
        review_requests: source.review_requests,
        promotions: source.promotions,
      });
    }
  }, [preferences]);

  const setToggle = useCallback(
    (key: keyof NotificationToggles, value: boolean) => {
      setToggles(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    try {
      await updatePreferences({ notifications: toggles }).unwrap();
      toastService.success(t('account.notificationPref.saveSuccess'));
      goBack();
    } catch {
      toastService.error(t('errors.generic'));
    }
  }, [updatePreferences, toggles, t]);

  return { toggles, setToggle, handleSave, isFetching, isSaving };
};
