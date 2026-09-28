import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {
  InfluencerOnboardingStackParamList,
  InfluencerWizardStackParamList,
} from '@/core/navigation';
import { WizardShell } from '@/shared/ui';
import { useGetInfluencerOnboardingProgressQuery } from '../api';
import { OnboardingProgressGate } from '../components/OnboardingProgressGate';
import {
  INFLUENCER_STEP_ROUTE,
  INFLUENCER_WIZARD_TOTAL_STEPS,
} from '../constants/influencerOnboarding';
import {
  ONBOARDING_ROOT_OPTIONS,
  useWizardScreenOptions,
} from '../hooks/useWizardScreenOptions';
import { resolveInfluencerOnboardingStep } from '../utils/resolveInfluencerOnboardingStep';
import {
  InfluencerRatesScreen,
  InfluencerSocialsScreen,
  InfluencerVerifyPhoneScreen,
  InfluencerWelcomeScreen,
} from '../screens';

const Root = createNativeStackNavigator<InfluencerOnboardingStackParamList>();
const Wizard = createNativeStackNavigator<InfluencerWizardStackParamList>();

/** Steps slide inside the WizardShell sheet; the navy header stays put. */
const InfluencerWizardNavigator: React.FC = () => {
  const screenOptions = useWizardScreenOptions();
  // Cache hit: InfluencerOnboardingNavigator only mounts this once progress loaded.
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const step = progress ? resolveInfluencerOnboardingStep(progress) : 'phone';
  const initialRoute = step === 'complete' ? INFLUENCER_STEP_ROUTE.rates : INFLUENCER_STEP_ROUTE[step];

  return (
    <WizardShell total={INFLUENCER_WIZARD_TOTAL_STEPS}>
      <Wizard.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
        <Wizard.Screen name="InfluencerVerifyPhone" component={InfluencerVerifyPhoneScreen} />
        <Wizard.Screen
          name="InfluencerSocials"
          component={InfluencerSocialsScreen}
          options={({ route }) => ({
            animationTypeForReplace: route.params?.fromBack ? 'pop' : 'push',
          })}
        />
        <Wizard.Screen
          name="InfluencerRates"
          component={InfluencerRatesScreen}
          options={{ gestureEnabled: true }}
        />
      </Wizard.Navigator>
    </WizardShell>
  );
};

/**
 * Creator registration after the account exists. The entry point (wizard step vs
 * welcome) is decided once from server progress; afterwards each step asks
 * the server where to go (useInfluencerOnboardingFlow).
 */
export const InfluencerOnboardingNavigator: React.FC = () => {
  const { data: progress, isError, refetch } = useGetInfluencerOnboardingProgressQuery();

  if (!progress) {
    return <OnboardingProgressGate failed={isError} onRetry={refetch} />;
  }

  const initialRoute =
    resolveInfluencerOnboardingStep(progress) === 'complete' ? 'InfluencerWelcome' : 'InfluencerWizard';

  return (
    <Root.Navigator initialRouteName={initialRoute} screenOptions={ONBOARDING_ROOT_OPTIONS}>
      <Root.Screen name="InfluencerWizard" component={InfluencerWizardNavigator} />
      <Root.Screen name="InfluencerWelcome" component={InfluencerWelcomeScreen} />
    </Root.Navigator>
  );
};
