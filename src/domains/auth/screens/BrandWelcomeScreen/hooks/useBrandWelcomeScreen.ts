import { useCallback, useEffect } from 'react';
import { BackHandler, Vibration } from 'react-native';
import { useAppDispatch } from '@/core/store';
import { useGetOnboardingProgressQuery } from '../../../api';
import { completeOnboarding } from '../../../store';
import { usePushPrompt } from '../../../hooks/usePushPrompt';

export const useBrandWelcomeScreen = () => {
  const dispatch = useAppDispatch();
  const { data: progress } = useGetOnboardingProgressQuery();

  useEffect(() => {
    Vibration.vibrate(15);
    // Nothing to go back to: the wizard is finished server-side.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const { promptThen, sheet: pushPrompt } = usePushPrompt();

  // Server already confirmed completion; this only releases the session into
  // the main app (AppStatus → AUTHENTICATED), after the push prompt if due.
  const onStart = useCallback(() => {
    promptThen(() => dispatch(completeOnboarding()));
  }, [dispatch, promptThen]);

  return {
    companyName: progress?.profile.company_name?.trim() || null,
    isUnderReview: progress?.kyc_status === 'pending',
    onStart,
    pushPrompt,
  };
};
