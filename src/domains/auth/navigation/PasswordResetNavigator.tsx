import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { PasswordResetStackParamList } from '@/core/navigation';
import { motion, useTheme } from '@/core/theme';
import { WizardShell } from '@/shared/ui';
import { PASSWORD_RESET_TOTAL_STEPS } from '../constants/passwordReset';
import { ForgotPasswordScreen, ResetOtpScreen, ResetPasswordScreen } from '../screens';

const Stack = createNativeStackNavigator<PasswordResetStackParamList>();

/** Forgot password as a 3-step wizard; steps slide inside the WizardShell sheet. */
export const PasswordResetNavigator: React.FC = () => {
  const { colors, isRTL } = useTheme();

  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: { backgroundColor: colors.surface.main },
      // iOS' native push already follows RTL; Android needs the side picked.
      animation:
        Platform.OS === 'ios' ? 'default' : isRTL ? 'slide_from_left' : 'slide_from_right',
      animationDuration: motion.duration.slow,
    }),
    [colors.surface.main, isRTL],
  );

  return (
    <WizardShell total={PASSWORD_RESET_TOTAL_STEPS}>
      <Stack.Navigator screenOptions={screenOptions}>
        {/* Login's `{ screen: 'ResetPhone', params }` reaches this screen directly. */}
        <Stack.Screen name="ResetPhone" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetOtp" component={ResetOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </WizardShell>
  );
};
