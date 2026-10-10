import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/core/navigation';
import {
  MediaKitInsightsScreen,
  MediaKitPreviewScreen,
  MediaKitSettingsScreen,
} from '@/domains/identity';
import { CreatorHomeScreen } from '../screens/CreatorHomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/** Creator `HomeTab`; the brand tab is `BrandHomeNavigator` (rule 01: role branches in MainTabs). */
export const CreatorHomeNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
    <Stack.Screen name="CreatorHomeScreen" component={CreatorHomeScreen} />
    <Stack.Screen name="MediaKitInsights" component={MediaKitInsightsScreen} />
    <Stack.Screen name="MediaKitPreview" component={MediaKitPreviewScreen} />
    <Stack.Screen name="MediaKitSettings" component={MediaKitSettingsScreen} />
  </Stack.Navigator>
);
