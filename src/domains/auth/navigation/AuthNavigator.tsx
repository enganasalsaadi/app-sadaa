import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/core/navigation';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  VerifyOtpScreen,
} from '../screens';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        animationDuration: 500,
        freezeOnBlur: true,
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verify" component={VerifyOtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
