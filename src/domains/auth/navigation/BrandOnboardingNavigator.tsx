import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {
  BrandOnboardingStackParamList,
  BrandWizardStackParamList,
} from '@/core/navigation';
import { WizardShell } from '@/shared/ui';
import { useGetOnboardingProgressQuery } from '../api';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import { OnboardingProgressGate } from '../components/OnboardingProgressGate';
import { useDeleteAccountEntry } from '../hooks/useDeleteAccountEntry';
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
  BrandProfileScreen,
  BrandVerifyPhoneScreen,
  BrandWelcomeScreen,
} from '../screens';

const Root = createNativeStackNavigator<BrandOnboardingStackParamList>();
const Wizard = createNativeStackNavigator<BrandWizardStackParamList>();

/** Step 4 routes: the verification picker and its methods. */
export type BrandKycStepRoute = Extract<
  keyof BrandWizardStackParamList,
  'BrandKyc' | 'BrandKycDocument' | 'BrandSocialProof' | 'BrandDomainEmail'
>;

/**
 * Verification lives in identity, which depends on auth: the app injects its screens here
 * instead of auth importing identity (rule 01).
 */
export type BrandKycStepScreens = Record<BrandKycStepRoute, React.ComponentType>;

interface BrandOnboardingNavigatorProps {
  kycScreens: BrandKycStepScreens;
}

// A method is a detour from the picker: swipe back to it like the KYC step to the profile.
const KYC_METHOD_OPTIONS = { gestureEnabled: true } as const;

/** Steps slide inside the WizardShell sheet; the navy header stays put. */
const BrandWizardNavigator: React.FC<BrandOnboardingNavigatorProps> = ({ kycScreens }) => {
  const screenOptions = useWizardScreenOptions();
  const deleteEntry = useDeleteAccountEntry();
  // Cache hit: BrandOnboardingNavigator only mounts this once progress loaded.
  const { data: progress } = useGetOnboardingProgressQuery();
  const step = progress ? resolveBrandOnboardingStep(progress) : 'phone';
  const initialRoute = step === 'complete' ? BRAND_STEP_ROUTE.kyc : BRAND_STEP_ROUTE[step];

  return (
    <>
      <WizardShell total={BRAND_WIZARD_TOTAL_STEPS} action={deleteEntry.action}>
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
            component={kycScreens.BrandKyc}
            options={{ gestureEnabled: true }}
          />
          <Wizard.Screen
            name="BrandKycDocument"
            component={kycScreens.BrandKycDocument}
            options={KYC_METHOD_OPTIONS}
          />
          <Wizard.Screen
            name="BrandSocialProof"
            component={kycScreens.BrandSocialProof}
            options={KYC_METHOD_OPTIONS}
          />
          <Wizard.Screen
            name="BrandDomainEmail"
            component={kycScreens.BrandDomainEmail}
            options={KYC_METHOD_OPTIONS}
          />
        </Wizard.Navigator>
      </WizardShell>
      <DeleteAccountSheet visible={deleteEntry.sheetVisible} onClose={deleteEntry.closeSheet} />
    </>
  );
};

/**
 * Brand registration after the account exists. The entry point (wizard step vs
 * welcome) is decided once from server progress; afterwards each step asks
 * the server where to go (useBrandOnboardingFlow).
 */
export const BrandOnboardingNavigator: React.FC<BrandOnboardingNavigatorProps> = ({
  kycScreens,
}) => {
  const { data: progress, isError, refetch } = useGetOnboardingProgressQuery();

  if (!progress) {
    return <OnboardingProgressGate failed={isError} onRetry={refetch} />;
  }

  const initialRoute =
    resolveBrandOnboardingStep(progress) === 'complete' ? 'BrandWelcome' : 'BrandWizard';

  return (
    <Root.Navigator initialRouteName={initialRoute} screenOptions={ONBOARDING_ROOT_OPTIONS}>
      <Root.Screen name="BrandWizard">
        {() => <BrandWizardNavigator kycScreens={kycScreens} />}
      </Root.Screen>
      <Root.Screen name="BrandWelcome" component={BrandWelcomeScreen} />
    </Root.Navigator>
  );
};
