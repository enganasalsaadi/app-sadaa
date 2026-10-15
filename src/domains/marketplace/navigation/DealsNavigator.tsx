import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DealsStackParamList } from '@/core/navigation';
import { BrandDealDetailScreen } from '../screens/BrandDealDetailScreen';
import { BrandDealsScreen } from '../screens/BrandDealsScreen';
import { CreatorDealDetailScreen } from '../screens/CreatorDealDetailScreen';
import { CreatorDealsScreen } from '../screens/CreatorDealsScreen';
import { DealContractScreen } from '../screens/DealContractScreen';
import { DealsComingSoonScreen } from '../screens/DealsComingSoonScreen';

const Stack = createNativeStackNavigator<DealsStackParamList>();

const SCREEN_OPTIONS = { headerShown: false, freezeOnBlur: true } as const;

const BrandContract: React.FC = () => <DealContractScreen role="brand" />;
const CreatorContract: React.FC = () => <DealContractScreen role="creator" />;
/** Strikes land with P8.1; until then the route keeps pushes and links working. */
const CreatorStrikesPending: React.FC = () => <DealsComingSoonScreen role="creator" />;

/** Brand `DealsTab` (rule 01: MainTabs picks the role's navigator, screens never branch on it). */
export const BrandDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={BrandDealsScreen} />
    <Stack.Screen name="DealDetail" component={BrandDealDetailScreen} />
    <Stack.Screen name="DealContract" component={BrandContract} />
  </Stack.Navigator>
);

/** Creator `DealsTab`: the brand's routes plus strikes (brands never see them, M8). */
export const CreatorDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={CreatorDealsScreen} />
    <Stack.Screen name="DealDetail" component={CreatorDealDetailScreen} />
    <Stack.Screen name="DealContract" component={CreatorContract} />
    <Stack.Screen name="Strikes" component={CreatorStrikesPending} />
  </Stack.Navigator>
);
