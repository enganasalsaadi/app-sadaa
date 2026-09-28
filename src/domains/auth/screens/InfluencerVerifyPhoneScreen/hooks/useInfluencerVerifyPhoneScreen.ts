import { useGetInfluencerOnboardingProgressQuery } from '../../../api';
import { INFLUENCER_WIZARD_STEPS } from '../../../constants/influencerOnboarding';
import { useInfluencerOnboardingFlow } from '../../../hooks/useInfluencerOnboardingFlow';
import { usePhoneVerifyStep } from '../../../hooks/usePhoneVerifyStep';

export const useInfluencerVerifyPhoneScreen = () => {
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const { runStep, isBusy, error, clearError } = useInfluencerOnboardingFlow('phone');
  const verify = usePhoneVerifyStep({
    step: INFLUENCER_WIZARD_STEPS.phone,
    serverPhone: progress?.phone,
    runStep,
    clearError,
  });

  return { ...verify, isVerifying: isBusy, error };
};
