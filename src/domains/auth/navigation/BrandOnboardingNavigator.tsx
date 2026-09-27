import React, { useMemo } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type {
  BrandOnboardingStackParamList,
  BrandWizardStackParamList,
} from '@/core/navigation';
import { motion, useTheme } from '@/core/theme';
import { Box, CustomButton, HeroBackdrop, Text, WizardShell } from '@/shared/ui';
import { useGetOnboardingProgressQuery } from '../api';
import {
  BRAND_STEP_ROUTE,
  BRAND_WIZARD_TOTAL_STEPS,
} from '../constants/brandOnboarding';
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
  const { colors, isRTL } = useTheme();
  // Cache hit: BrandOnboardingNavigator only mounts this once progress loaded.
  const { data: progress } = useGetOnboardingProgressQuery();
  const step = progress ? resolveBrandOnboardingStep(progress) : 'phone';
  const initialRoute = step === 'complete' ? BRAND_STEP_ROUTE.kyc : BRAND_STEP_ROUTE[step];

  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: { backgroundColor: colors.surface.main },
      // iOS' native push already follows RTL; Android needs the side picked.
      animation:
        Platform.OS === 'ios' ? 'default' : isRTL ? 'slide_from_left' : 'slide_from_right',
      animationDuration: motion.duration.slow,
      // Steps are one-way except KYC → profile (enabled on BrandKyc).
      gestureEnabled: false,
    }),
    [colors.surface.main, isRTL],
  );

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

/** Loading / failure while the first GET /onboarding/progress is in flight. */
const ProgressGate: React.FC<{ failed: boolean; onRetry: () => void }> = ({
  failed,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box flex={1} bg={colors.brand.main} align="center" justify="center" px="3xl" gap="xl">
      <HeroBackdrop />
      {failed ? (
        <>
          <Text variant="body" align="center" color={colors.text.onBrand}>
            {t('auth.brandOnboarding.progressError')}
          </Text>
          <CustomButton
            title={t('common.retry')}
            onPress={onRetry}
            variant="onBrand"
            fullWidth
          />
        </>
      ) : (
        <ActivityIndicator color={colors.text.onBrand} />
      )}
    </Box>
  );
};

/**
 * Registration after the account exists. The entry point (wizard step vs
 * welcome) is decided once from server progress; afterwards each step asks
 * the server where to go (useBrandOnboardingFlow).
 */
export const BrandOnboardingNavigator: React.FC = () => {
  const { data: progress, isError, refetch } = useGetOnboardingProgressQuery();

  if (!progress) {
    return <ProgressGate failed={isError} onRetry={refetch} />;
  }

  const initialRoute =
    resolveBrandOnboardingStep(progress) === 'complete' ? 'BrandWelcome' : 'BrandWizard';

  return (
    <Root.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: motion.duration.slow,
        gestureEnabled: false,
      }}
    >
      <Root.Screen name="BrandWizard" component={BrandWizardNavigator} />
      <Root.Screen name="BrandWelcome" component={BrandWelcomeScreen} />
    </Root.Navigator>
  );
};
