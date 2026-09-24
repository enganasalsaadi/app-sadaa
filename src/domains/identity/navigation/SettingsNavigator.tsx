import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import type { SettingsStackParamList } from '@/core/navigation';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditAccountScreen } from '../screens/EditAccountScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { NotificationPrefScreen } from '../screens/NotificationPrefScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { WebViewScreen } from '../screens/WebViewScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="ProfileScreen"
    screenOptions={{
      headerShown: false,
      freezeOnBlur: true,
      animation: Platform.OS === 'ios' ? 'default' : 'fade',
    }}
  >
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditAccountScreen" component={EditAccountScreen} />
    <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
    <Stack.Screen
      name="NotificationPrefScreen"
      component={NotificationPrefScreen}
    />
    <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
    <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
  </Stack.Navigator>
);
