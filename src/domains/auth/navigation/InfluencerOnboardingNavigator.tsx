import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {
  InfluencerOnboardingStackParamList,
  InfluencerWizardStackParamList,
} from '@/core/navigation';
import { WizardShell } from '@/shared/ui';
import { useGetInfluencerOnboardingProgressQuery } from '../api';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import { OnboardingProgressGate } from '../components/OnboardingProgressGate';
import { useDeleteAccountEntry } from '../hooks/useDeleteAccountEntry';
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
  InfluencerKycScreen,
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
  const deleteEntry = useDeleteAccountEntry();
  // Cache hit: InfluencerOnboardingNavigator only mounts this once progress loaded.
  const { data: progress } = useGetInfluencerOnboardingProgressQuery();
  const step = progress ? resolveInfluencerOnboardingStep(progress) : 'phone';
  const initialRoute = step === 'complete' ? INFLUENCER_STEP_ROUTE.rates : INFLUENCER_STEP_ROUTE[step];

  return (
    <>
      <WizardShell total={INFLUENCER_WIZARD_TOTAL_STEPS} action={deleteEntry.action}>
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
            options={({ route }) => ({
              gestureEnabled: true,
              animationTypeForReplace: route.params?.fromBack ? 'pop' : 'push',
            })}
          />
          <Wizard.Screen
            name="InfluencerKyc"
            component={InfluencerKycScreen}
            options={{ gestureEnabled: true }}
          />
        </Wizard.Navigator>
      </WizardShell>
      <DeleteAccountSheet visible={deleteEntry.sheetVisible} onClose={deleteEntry.closeSheet} />
    </>
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
