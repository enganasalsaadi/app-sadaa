import { authStorage } from '@/core/storage';
import type { Dispatch } from '@reduxjs/toolkit';
import { setToken } from '../store';

interface Step1Session {
  token: string;
  user_type: string;
  current_step: number;
  is_onboarding_complete: boolean;
}

/**
 * Step-1 of every role creates the draft account, logs it in and sends the
 * phone OTP. AppStatus then flips to REGISTRATION_INCOMPLETE on its own.
 */
export const startOnboardingSession = (
  dispatch: Dispatch,
  data: Step1Session,
  phone: string,
): void => {
  authStorage.saveToken(data.token);
  dispatch(
    setToken({
      token: data.token,
      userType: data.user_type,
      currentStep: data.current_step,
      isOnboardingComplete: data.is_onboarding_complete,
      phone,
      otpSentAt: Date.now(),
    }),
  );
};
