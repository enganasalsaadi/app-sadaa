import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import type { SettingsStackParamList } from '@/core/navigation';
import { NotificationsScreen } from '@/domains/notifications';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { CompanyInfoScreen } from '../screens/CompanyInfoScreen';
import { KycScreen } from '../screens/KycScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { WebViewScreen } from '../screens/WebViewScreen';
import { PlatformsScreen } from '../screens/PlatformsScreen';
import { PlatformDetailScreen } from '../screens/PlatformDetailScreen';
import { NichesScreen } from '../screens/NichesScreen';
import { MediaKitSettingsScreen } from '../screens/MediaKitSettingsScreen';
import { RateCardsScreen } from '../screens/RateCardsScreen';
import { RateCardEditorScreen } from '../screens/RateCardEditorScreen';

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
    <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
    <Stack.Screen name="CompanyInfoScreen" component={CompanyInfoScreen} />
    <Stack.Screen name="KycScreen" component={KycScreen} />
    <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
    <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
    <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    <Stack.Screen name="PlatformsScreen" component={PlatformsScreen} />
    <Stack.Screen name="PlatformDetailScreen" component={PlatformDetailScreen} />
    <Stack.Screen name="NichesScreen" component={NichesScreen} />
    <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
    <Stack.Screen name="MediaKitSettings" component={MediaKitSettingsScreen} />
    <Stack.Screen name="RateCards" component={RateCardsScreen} />
    <Stack.Screen name="RateCardEditor" component={RateCardEditorScreen} />
  </Stack.Navigator>
);
