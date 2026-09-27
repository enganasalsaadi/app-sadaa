import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import type {
  PasswordResetStackParamList,
  PasswordResetStackScreenProps,
} from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import {
  useResendPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
} from '../../../api';
import {
  PASSWORD_RESET_STEPS,
  RESET_OTP_LENGTH,
  RESET_OTP_RESEND_SECONDS,
} from '../../../constants/passwordReset';
import { useOtpCodeForm } from '../../../hooks/useOtpCodeForm';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

type Navigation = PasswordResetStackScreenProps<'ResetOtp'>['navigation'];

export const useResetOtpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<PasswordResetStackParamList, 'ResetOtp'>>();
  const { phone } = params;
  const displayPhone = useMemo(() => formatPhoneForDisplay(phone), [phone]);

  const [sentAt, setSentAt] = useState(params.sentAt);
  const [error, setError] = useState<AppApiError | null>(null);
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyPasswordResetOtpMutation();
  const [resendOtp] = useResendPasswordResetOtpMutation();

  const step = PASSWORD_RESET_STEPS.code;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey, { phone: displayPhone }),
    onBack: () => navigation.goBack(),
  });

  const otp = useOtpCodeForm({
    length: RESET_OTP_LENGTH,
    verify: async code => {
      if (isVerifying) return true;
      setError(null);
      try {
        await verifyOtp({ phone, code, type: 'password_reset' }).unwrap();
        // The code is sent again with the new password, so it isn't consumed
        // here: coming back to this step and re-verifying is safe.
        navigation.navigate('ResetPassword', { phone, code });
        return true;
      } catch (err) {
        setError(normalizeApiError(err));
        return false;
      }
    },
    resend: async () => {
      await resendOtp({ phone, type: 'password_reset' }).unwrap();
      setSentAt(Date.now());
    },
    resendAvailableAt: sentAt + RESET_OTP_RESEND_SECONDS * 1000,
    onEdit: () => setError(null),
  });

  const onChangeNumber = useCallback(() => navigation.goBack(), [navigation]);

  return { otp, isVerifying, error, onChangeNumber };
};
