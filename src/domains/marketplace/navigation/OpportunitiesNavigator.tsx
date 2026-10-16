import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OpportunitiesStackParamList } from '@/core/navigation';
import { CreatorCampaignDetailScreen } from '../screens/CreatorCampaignDetailScreen';
import { CreatorOpportunitiesScreen } from '../screens/CreatorOpportunitiesScreen';

const Stack = createNativeStackNavigator<OpportunitiesStackParamList>();

/** Creator `OpportunitiesTab`: the public-campaign feed and a campaign's page (brands manage theirs in `DealsTab`). */
export const CreatorOpportunitiesNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
    <Stack.Screen name="Opportunities" component={CreatorOpportunitiesScreen} />
    <Stack.Screen name="CampaignDetail" component={CreatorCampaignDetailScreen} />
  </Stack.Navigator>
);
