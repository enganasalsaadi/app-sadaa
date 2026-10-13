import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DealsStackParamList } from '@/core/navigation';
import { DealsComingSoonScreen } from '../screens/DealsComingSoonScreen';

const Stack = createNativeStackNavigator<DealsStackParamList>();

const SCREEN_OPTIONS = { headerShown: false, freezeOnBlur: true } as const;

const BrandDealsRoot: React.FC = () => <DealsComingSoonScreen role="brand" isRoot />;
const BrandDealsPending: React.FC = () => <DealsComingSoonScreen role="brand" />;
const CreatorDealsRoot: React.FC = () => <DealsComingSoonScreen role="creator" isRoot />;
const CreatorDealsPending: React.FC = () => <DealsComingSoonScreen role="creator" />;

/** Brand `DealsTab` (rule 01: MainTabs picks the role's navigator, screens never branch on it). */
export const BrandDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={BrandDealsRoot} />
    <Stack.Screen name="DealDetail" component={BrandDealsPending} />
  </Stack.Navigator>
);

/** Creator `DealsTab`: the brand's routes plus strikes (brands never see them, M8). */
export const CreatorDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={CreatorDealsRoot} />
    <Stack.Screen name="DealDetail" component={CreatorDealsPending} />
    <Stack.Screen name="Strikes" component={CreatorDealsPending} />
  </Stack.Navigator>
);
