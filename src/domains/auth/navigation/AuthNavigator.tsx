import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/core/navigation';
import { motion } from '@/core/theme';
import { WizardShell } from '@/shared/ui';
import { BRAND_WIZARD_TOTAL_STEPS } from '../constants/brandOnboarding';
import { INFLUENCER_WIZARD_TOTAL_STEPS } from '../constants/influencerOnboarding';
import { BrandAccountScreen, InfluencerAccountScreen, LoginScreen } from '../screens';
import { PasswordResetNavigator } from './PasswordResetNavigator';

// Step 1 of each wizard runs before there's a token, so it lives here;
// same shell as steps 2–4 so the hand-over to the onboarding branch is seamless.
const BrandRegisterRoute: React.FC = () => (
  <WizardShell total={BRAND_WIZARD_TOTAL_STEPS}>
    <BrandAccountScreen />
  </WizardShell>
);

const InfluencerRegisterRoute: React.FC = () => (
  <WizardShell total={INFLUENCER_WIZARD_TOTAL_STEPS}>
    <InfluencerAccountScreen />
  </WizardShell>
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        animationDuration: motion.duration.slow,
        freezeOnBlur: true,
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={PasswordResetNavigator} />
      <Stack.Screen name="BrandRegister" component={BrandRegisterRoute} />
      <Stack.Screen name="InfluencerRegister" component={InfluencerRegisterRoute} />
    </Stack.Navigator>
  );
};
