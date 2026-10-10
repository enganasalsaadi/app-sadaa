import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/core/navigation';
import { BrandHomeScreen } from '../screens/BrandHomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ShortlistScreen } from '../screens/ShortlistScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/** Brand `HomeTab`; the creator tab is `CreatorHomeNavigator` (rule 01: role branches in MainTabs). */
export const BrandHomeNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
    <Stack.Screen name="BrandHomeScreen" component={BrandHomeScreen} />
    <Stack.Screen name="Explore" component={ExploreScreen} />
    <Stack.Screen name="Shortlist" component={ShortlistScreen} />
  </Stack.Navigator>
);
