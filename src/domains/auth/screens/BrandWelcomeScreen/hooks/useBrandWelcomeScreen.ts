import { useCallback, useEffect } from 'react';
import { BackHandler, Vibration } from 'react-native';
import { useAppDispatch } from '@/core/store';
import { useGetOnboardingProgressQuery } from '../../../api';
import { completeOnboarding } from '../../../store';

const PENDING_REVIEW_STATUS = 'pending_kyc';

export const useBrandWelcomeScreen = () => {
  const dispatch = useAppDispatch();
  const { data: progress } = useGetOnboardingProgressQuery();

  useEffect(() => {
    Vibration.vibrate(15);
    // Nothing to go back to: the wizard is finished server-side.
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Server already confirmed completion; this only releases the session into
  // the main app (AppStatus → AUTHENTICATED).
  const onStart = useCallback(() => {
    dispatch(completeOnboarding());
  }, [dispatch]);

  return {
    companyName: progress?.profile.company_name?.trim() || null,
    isUnderReview:
      progress?.status === PENDING_REVIEW_STATUS || progress?.has_kyc_document === true,
    onStart,
  };
};
