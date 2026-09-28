import { useMemo } from 'react';
import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { motion, useTheme } from '@/core/theme';

/** Stack options for steps sliding inside the WizardShell sheet. */
export const useWizardScreenOptions = (): NativeStackNavigationOptions => {
  const { colors, isRTL } = useTheme();
  return useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: { backgroundColor: colors.surface.main },
      // iOS' native push already follows RTL; Android needs the side picked.
      animation:
        Platform.OS === 'ios' ? 'default' : isRTL ? 'slide_from_left' : 'slide_from_right',
      animationDuration: motion.duration.slow,
      // Steps are one-way except the last one back to the one before it.
      gestureEnabled: false,
    }),
    [colors.surface.main, isRTL],
  );
};

/** Root options: the wizard ↔ welcome swap cross-fades. */
export const ONBOARDING_ROOT_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: motion.duration.slow,
  gestureEnabled: false,
};
