import { useGetOnboardingProgressQuery } from '../../../api';
import { BRAND_WIZARD_STEPS } from '../../../constants/brandOnboarding';
import { useBrandOnboardingFlow } from '../../../hooks/useBrandOnboardingFlow';
import { usePhoneVerifyStep } from '../../../hooks/usePhoneVerifyStep';

export const useBrandVerifyPhoneScreen = () => {
  const { data: progress } = useGetOnboardingProgressQuery();
  const { runStep, isBusy, error, clearError } = useBrandOnboardingFlow('phone');
  const verify = usePhoneVerifyStep({
    step: BRAND_WIZARD_STEPS.phone,
    serverPhone: progress?.profile.phone,
    runStep,
    clearError,
  });

  return { ...verify, isVerifying: isBusy, error };
};
