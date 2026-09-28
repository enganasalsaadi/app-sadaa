import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { useWizardHeader } from '@/shared/ui';
import { openWhatsApp } from '@/shared/utils';
import { useResendPhoneOtpMutation, useVerifyPhoneOtpMutation } from '../api';
import { PHONE_OTP_RESEND_SECONDS } from '../constants/brandOnboarding';
import type { WizardStepDef } from '../constants/wizard';
import { PHONE_OTP_LENGTH } from '../schemas';
import { selectPendingPhone, selectPhoneOtpSentAt } from '../store';
import { formatPhoneForDisplay } from '../utils/formatPhoneForDisplay';
import type { RunStepOptions } from './useOnboardingFlow';
import { useOtpCodeForm } from './useOtpCodeForm';

interface PhoneVerifyStepConfig {
  step: WizardStepDef;
  /** E.164 from server progress; falls back to the number typed at step 1. */
  serverPhone?: string;
  runStep: (write: () => Promise<unknown>, options?: RunStepOptions) => Promise<boolean>;
  clearError: () => void;
}

/** Phone OTP wizard step shared by every role: header, code form, resend, wrong-number support. */
export const usePhoneVerifyStep = ({
  step,
  serverPhone,
  runStep,
  clearError,
}: PhoneVerifyStepConfig) => {
  const { t } = useTranslation();
  const [supportVisible, setSupportVisible] = useState(false);

  const pendingPhone = useAppSelector(selectPendingPhone);
  const phone = serverPhone || pendingPhone;
  const displayPhone = useMemo(() => formatPhoneForDisplay(phone), [phone]);

  // Persisted timestamp: survives restarts. After a plain login nothing was
  // sent, so resend is available immediately.
  const otpSentAt = useAppSelector(selectPhoneOtpSentAt);

  const [verifyOtp] = useVerifyPhoneOtpMutation();
  const [resendOtp] = useResendPhoneOtpMutation();

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
      t('auth.phoneVerify.wrongNumber.message', { phone }),
    ).catch(() =>
      toastService.error(
        t('auth.phoneVerify.wrongNumber.openFailed', {
          number: formatPhoneForDisplay(SUPPORT_WHATSAPP_NUMBER),
        }),
      ),
    );
  }, [phone, t]);

  return {
    otp,
    supportVisible,
    openSupport,
    closeSupport,
    onContactSupport,
    supportNumber: formatPhoneForDisplay(SUPPORT_WHATSAPP_NUMBER),
  };
};

export type PhoneVerifyStep = ReturnType<typeof usePhoneVerifyStep>;
