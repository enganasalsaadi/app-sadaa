import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '@/core/store';
import type {
  BrandOnboardingStackParamList,
  BrandWizardStackParamList,
} from '@/core/navigation';
import { brandOnboardingApi } from '../api';
import { BRAND_STEP_ROUTE } from '../constants/brandOnboarding';
import { resolveBrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';
import type { BrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';
import { useOnboardingFlow } from './useOnboardingFlow';

/** Brand wizard wiring for `useOnboardingFlow`. */
export const useBrandOnboardingFlow = (current: Exclude<BrandOnboardingStep, 'complete'>) => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList>>();

  const loadNextStep = useCallback(async () => {
    const progress = await dispatch(
      brandOnboardingApi.endpoints.getOnboardingProgress.initiate(undefined, {
        forceRefetch: true,
        subscribe: false,
      }),
    ).unwrap();
    return resolveBrandOnboardingStep(progress);
  }, [dispatch]);

  const goTo = useCallback(
    (next: BrandOnboardingStep) => {
      if (next === 'complete') {
        navigation
          .getParent<NativeStackNavigationProp<BrandOnboardingStackParamList>>()
          ?.replace('BrandWelcome');
        return;
      }
      const route = BRAND_STEP_ROUTE[next];
      // Forward into KYC keeps the profile underneath for back-editing; the
      // phone step is never returned to.
      if (next === 'kyc') navigation.navigate(route);
      else navigation.replace(route);
    },
    [navigation],
  );

  return useOnboardingFlow<BrandOnboardingStep>({ current, loadNextStep, goTo });
};
