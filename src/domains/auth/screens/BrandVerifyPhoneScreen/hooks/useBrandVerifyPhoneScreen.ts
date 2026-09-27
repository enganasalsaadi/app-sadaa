import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { useWizardHeader } from '@/shared/ui';
import { openWhatsApp } from '@/shared/utils';
import {
  useGetOnboardingProgressQuery,
  useResendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
} from '../../../api';
import {
  BRAND_WIZARD_STEPS,
  PHONE_OTP_RESEND_SECONDS,
} from '../../../constants/brandOnboarding';
import { useBrandOnboardingFlow } from '../../../hooks/useBrandOnboardingFlow';
import { useOtpCodeForm } from '../../../hooks/useOtpCodeForm';
import { PHONE_OTP_LENGTH } from '../../../schemas';
import { selectPendingPhone, selectPhoneOtpSentAt } from '../../../store';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

export const useBrandVerifyPhoneScreen = () => {
  const { t } = useTranslation();
  const [supportVisible, setSupportVisible] = useState(false);

  const { data: progress } = useGetOnboardingProgressQuery();
  const pendingPhone = useAppSelector(selectPendingPhone);
  const phone = progress?.profile.phone || pendingPhone;
  const displayPhone = useMemo(() => formatPhoneForDisplay(phone), [phone]);

  // Persisted timestamp: survives restarts. After a plain login nothing was
  // sent, so resend is available immediately.
  const otpSentAt = useAppSelector(selectPhoneOtpSentAt);

  const [verifyOtp] = useVerifyPhoneOtpMutation();
  const [resendOtp] = useResendPhoneOtpMutation();
  const { runStep, isBusy, error, clearError } = useBrandOnboardingFlow('phone');

  const step = BRAND_WIZARD_STEPS.phone;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey, { phone: displayPhone }),
  });

  const otp = useOtpCodeForm({
    length: PHONE_OTP_LENGTH,
    verify: code =>
      runStep(() => verifyOtp({ phone, code, type: 'phone_verification' }).unwrap()),
    // Success dispatches `phoneOtpSent`, which restarts the cooldown.
    resend: () => resendOtp({ phone, type: 'phone_verification' }).unwrap(),
    resendAvailableAt:
      otpSentAt === null ? null : otpSentAt + PHONE_OTP_RESEND_SECONDS * 1000,
    onEdit: clearError,
  });

  const openSupport = useCallback(() => setSupportVisible(true), []);
  const closeSupport = useCallback(() => setSupportVisible(false), []);

  const onContactSupport = useCallback(() => {
    setSupportVisible(false);
    openWhatsApp(
      SUPPORT_WHATSAPP_NUMBER,
      t('auth.brandOnboarding.phone.wrongNumber.message', { phone }),
    ).catch(() =>
      toastService.error(
        t('auth.brandOnboarding.phone.wrongNumber.openFailed', {
          number: formatPhoneForDisplay(SUPPORT_WHATSAPP_NUMBER),
        }),
      ),
    );
  }, [phone, t]);

  return {
    otp,
    isVerifying: isBusy,
    error,
    supportVisible,
    openSupport,
    closeSupport,
    onContactSupport,
    supportNumber: formatPhoneForDisplay(SUPPORT_WHATSAPP_NUMBER),
  };
};
