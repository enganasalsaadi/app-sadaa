import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OtpInputHandle, OtpInputStatus } from '@/shared/ui';

export const OTP_DEMO_LENGTH = 6;
/** Any other code is "rejected" so the error + shake path can be tried. */
const ACCEPTED_CODE = '123456';

export const useOtpDemo = () => {
  const { t } = useTranslation();
  const ref = useRef<OtpInputHandle>(null);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<OtpInputStatus>('idle');
  const [error, setError] = useState<string | undefined>();

  const onChangeText = useCallback((next: string) => {
    setValue(next);
    setStatus('idle');
    setError(undefined);
  }, []);

  const onComplete = useCallback(
    (code: string) => {
      if (code === ACCEPTED_CODE) {
        setStatus('success');
        return;
      }
      setError(t('devShowcase.otp.rejected'));
      ref.current?.shake();
    },
    [t],
  );

  const reset = useCallback(() => onChangeText(''), [onChangeText]);

  return { ref, value, status, error, onChangeText, onComplete, reset };
};
