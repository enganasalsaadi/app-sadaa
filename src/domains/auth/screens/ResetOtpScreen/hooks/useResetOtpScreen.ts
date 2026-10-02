import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type {
  PasswordResetStackParamList,
  PasswordResetStackScreenProps,
} from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import { useResendPasswordResetOtpMutation } from '../../../api';
import { OTP_RESEND_SECONDS } from '../../../constants/otp';
import { PASSWORD_RESET_STEPS } from '../../../constants/passwordReset';
import { useOtpCodeForm } from '../../../hooks/useOtpCodeForm';
import type { OtpRejection } from '../../../hooks/useOtpCodeForm';
import { PHONE_OTP_LENGTH } from '../../../schemas';
import { formatPhoneForDisplay } from '../../../utils/formatPhoneForDisplay';

type Navigation = PasswordResetStackScreenProps<'ResetOtp'>['navigation'];

const CODE_REFUSED: OtpRejection = {
  statusCode: 422,
  code: 'validation_failed',
  retryAfter: null,
};

export const useResetOtpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<PasswordResetStackParamList, 'ResetOtp'>>();
  const { phone, codeRejection } = params;
  const displayPhone = useMemo(() => formatPhoneForDisplay(phone), [phone]);

  const [resendAvailableAt, setResendAvailableAt] = useState(params.resendAvailableAt);
  const [error, setError] = useState<string | null>(null);
  const [resendOtp] = useResendPasswordResetOtpMutation();

  const step = PASSWORD_RESET_STEPS.code;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey, { phone: displayPhone }),
    onBack: () => navigation.goBack(),
  });

  const otp = useOtpCodeForm({
    length: PHONE_OTP_LENGTH,
    // Checked by reset-password together with the new password: verify-otp
    // would consume the code (contract §15.12). A refusal comes back here.
    verify: async code => {
      setError(null);
      navigation.navigate('ResetPassword', { phone, code, resendAvailableAt });
      return null;
    },
    resend: async () => {
      await resendOtp({ phone, type: 'password_reset' }).unwrap();
      setResendAvailableAt(Date.now() + OTP_RESEND_SECONDS * 1000);
    },
    resendAvailableAt,
    onEdit: () => setError(null),
  });

  const { reject } = otp;
  const rejectedAt = codeRejection?.at;
  const rejectionMessage = codeRejection?.message;
  useEffect(() => {
    if (rejectedAt === undefined || rejectionMessage === undefined) return;
    setError(rejectionMessage);
    reject(CODE_REFUSED);
  }, [rejectedAt, rejectionMessage, reject]);

  const onChangeNumber = useCallback(() => navigation.goBack(), [navigation]);

  return { otp, error, onChangeNumber };
};
