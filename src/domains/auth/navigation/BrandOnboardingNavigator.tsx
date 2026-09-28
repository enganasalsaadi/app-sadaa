import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {
  BrandOnboardingStackParamList,
  BrandWizardStackParamList,
} from '@/core/navigation';
import { WizardShell } from '@/shared/ui';
import { useGetOnboardingProgressQuery } from '../api';
import { OnboardingProgressGate } from '../components/OnboardingProgressGate';
import {
  BRAND_STEP_ROUTE,
  BRAND_WIZARD_TOTAL_STEPS,
} from '../constants/brandOnboarding';
import {
  ONBOARDING_ROOT_OPTIONS,
  useWizardScreenOptions,
} from '../hooks/useWizardScreenOptions';
import { resolveBrandOnboardingStep } from '../utils/resolveBrandOnboardingStep';
import {
  BrandKycScreen,
  BrandProfileScreen,
  BrandVerifyPhoneScreen,
  BrandWelcomeScreen,
} from '../screens';

const Root = createNativeStackNavigator<BrandOnboardingStackParamList>();
const Wizard = createNativeStackNavigator<BrandWizardStackParamList>();

/** Steps slide inside the WizardShell sheet; the navy header stays put. */
const BrandWizardNavigator: React.FC = () => {
  const screenOptions = useWizardScreenOptions();
  // Cache hit: BrandOnboardingNavigator only mounts this once progress loaded.
  const { data: progress } = useGetOnboardingProgressQuery();
  const step = progress ? resolveBrandOnboardingStep(progress) : 'phone';
  const initialRoute = step === 'complete' ? BRAND_STEP_ROUTE.kyc : BRAND_STEP_ROUTE[step];

  return (
    <WizardShell total={BRAND_WIZARD_TOTAL_STEPS}>
      <Wizard.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
        <Wizard.Screen name="BrandVerifyPhone" component={BrandVerifyPhoneScreen} />
        <Wizard.Screen
          name="BrandProfile"
          component={BrandProfileScreen}
          options={({ route }) => ({
            animationTypeForReplace: route.params?.fromBack ? 'pop' : 'push',
          })}
        />
        <Wizard.Screen
          name="BrandKyc"
          component={BrandKycScreen}
          options={{ gestureEnabled: true }}
        />
      </Wizard.Navigator>
    </WizardShell>
  );
};

/**
 * Brand registration after the account exists. The entry point (wizard step vs
 * welcome) is decided once from server progress; afterwards each step asks
 * the server where to go (useBrandOnboardingFlow).
 */
export const BrandOnboardingNavigator: React.FC = () => {
  const { data: progress, isError, refetch } = useGetOnboardingProgressQuery();

  if (!progress) {
    return <OnboardingProgressGate failed={isError} onRetry={refetch} />;
  }

  const initialRoute =
    resolveBrandOnboardingStep(progress) === 'complete' ? 'BrandWelcome' : 'BrandWizard';

  return (
    <Root.Navigator initialRouteName={initialRoute} screenOptions={ONBOARDING_ROOT_OPTIONS}>
      <Root.Screen name="BrandWizard" component={BrandWizardNavigator} />
      <Root.Screen name="BrandWelcome" component={BrandWelcomeScreen} />
    </Root.Navigator>
  );
};
