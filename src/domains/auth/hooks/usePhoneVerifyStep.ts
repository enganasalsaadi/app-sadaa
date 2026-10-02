import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppApiError } from '@/core/api';
import { SUPPORT_WHATSAPP_NUMBER } from '@/core/config';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { useWizardHeader } from '@/shared/ui';
import { openWhatsApp } from '@/shared/utils';
import { useResendPhoneOtpMutation, useVerifyPhoneOtpMutation } from '../api';
import { OTP_RESEND_SECONDS, OTP_TTL_MS } from '../constants/otp';
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

  // Persisted timestamp: survives restarts. Unset after a plain login.
  const otpSentAt = useAppSelector(selectPhoneOtpSentAt);
  // Decided once: entering from login/launch, no live code is out, so send one
  // (contract §15.11). Right after step-1 the server already sent it.
  const [needsCodeOnEntry] = useState(
    () => otpSentAt === null || Date.now() - otpSentAt > OTP_TTL_MS,
  );

  const [verifyOtp] = useVerifyPhoneOtpMutation();
  const [resendOtp] = useResendPhoneOtpMutation();

  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey, { phone: displayPhone }),
  });

  const otp = useOtpCodeForm({
    length: PHONE_OTP_LENGTH,
    verify: async code => {
      const outcome: { rejection: AppApiError | null } = { rejection: null };
      await runStep(() => verifyOtp({ phone, code, type: 'phone_verification' }).unwrap(), {
        onFailure: error => {
          outcome.rejection = error;
        },
      });
      return outcome.rejection;
    },
    // Success dispatches `phoneOtpSent`, which restarts the cooldown.
    resend: () => resendOtp({ phone, type: 'phone_verification' }).unwrap(),
    resendAvailableAt:
      otpSentAt === null ? null : otpSentAt + OTP_RESEND_SECONDS * 1000,
    onEdit: clearError,
  });

  const { requestCode } = otp;
  const entrySentRef = useRef(false);
  useEffect(() => {
    if (!needsCodeOnEntry || !phone || entrySentRef.current) return;
    entrySentRef.current = true;
    requestCode('entry');
  }, [needsCodeOnEntry, phone, requestCode]);

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
