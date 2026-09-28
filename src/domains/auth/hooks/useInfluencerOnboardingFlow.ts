import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '@/core/store';
import type {
  InfluencerOnboardingStackParamList,
  InfluencerWizardStackParamList,
} from '@/core/navigation';
import { influencerOnboardingApi } from '../api';
import { INFLUENCER_STEP_ROUTE } from '../constants/influencerOnboarding';
import { resolveInfluencerOnboardingStep } from '../utils/resolveInfluencerOnboardingStep';
import type { InfluencerOnboardingStep } from '../utils/resolveInfluencerOnboardingStep';
import { useOnboardingFlow } from './useOnboardingFlow';

/** Creator wizard wiring for `useOnboardingFlow`. */
export const useInfluencerOnboardingFlow = (
  current: Exclude<InfluencerOnboardingStep, 'complete'>,
) => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<InfluencerWizardStackParamList>>();

  const loadNextStep = useCallback(async () => {
    const progress = await dispatch(
      influencerOnboardingApi.endpoints.getInfluencerOnboardingProgress.initiate(undefined, {
        forceRefetch: true,
        subscribe: false,
      }),
    ).unwrap();
    return resolveInfluencerOnboardingStep(progress);
  }, [dispatch]);

  const goTo = useCallback(
    (next: InfluencerOnboardingStep) => {
      if (next === 'complete') {
        navigation
          .getParent<NativeStackNavigationProp<InfluencerOnboardingStackParamList>>()
          ?.replace('InfluencerWelcome');
        return;
      }
      const route = INFLUENCER_STEP_ROUTE[next];
      // Forward into rates keeps socials underneath for back-editing.
      if (next === 'rates') navigation.navigate(route);
      else navigation.replace(route);
    },
    [navigation],
  );

  return useOnboardingFlow<InfluencerOnboardingStep>({ current, loadNextStep, goTo });
};
