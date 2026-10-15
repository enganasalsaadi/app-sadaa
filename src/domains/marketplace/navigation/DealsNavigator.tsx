import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DealsStackParamList } from '@/core/navigation';
import { BrandDealDetailScreen } from '../screens/BrandDealDetailScreen';
import { BrandDealsScreen } from '../screens/BrandDealsScreen';
import { CreatorDealDetailScreen } from '../screens/CreatorDealDetailScreen';
import { CreatorDealsScreen } from '../screens/CreatorDealsScreen';
import { DealContractScreen } from '../screens/DealContractScreen';
import { DealDraftReviewScreen } from '../screens/DealDraftReviewScreen';
import { DealDraftUploadScreen } from '../screens/DealDraftUploadScreen';
import { DealPublicationReviewScreen } from '../screens/DealPublicationReviewScreen';
import { DealUpsellBuilderScreen } from '../screens/DealUpsellBuilderScreen';
import { DealPublishScreen } from '../screens/DealPublishScreen';
import { StrikesScreen } from '../screens/StrikesScreen';

const Stack = createNativeStackNavigator<DealsStackParamList>();

const SCREEN_OPTIONS = { headerShown: false, freezeOnBlur: true } as const;

const BrandContract: React.FC = () => <DealContractScreen role="brand" />;
const CreatorContract: React.FC = () => <DealContractScreen role="creator" />;

/** Brand `DealsTab` (rule 01: MainTabs picks the role's navigator, screens never branch on it); reviews draft rounds (P6), verifies live posts (P7) and adds to a running deal (M8). */
export const BrandDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={BrandDealsScreen} />
    <Stack.Screen name="DealDetail" component={BrandDealDetailScreen} />
    <Stack.Screen name="DealContract" component={BrandContract} />
    <Stack.Screen name="DealDraftReview" component={DealDraftReviewScreen} />
    <Stack.Screen name="DealPublicationReview" component={DealPublicationReviewScreen} />
    <Stack.Screen name="DealUpsellBuilder" component={DealUpsellBuilderScreen} />
  </Stack.Navigator>
);

/** Creator `DealsTab`: the shared routes, handing in draft rounds (P6) and live posts (P7), and strikes (brands never see them, M8). */
export const CreatorDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={CreatorDealsScreen} />
    <Stack.Screen name="DealDetail" component={CreatorDealDetailScreen} />
    <Stack.Screen name="DealContract" component={CreatorContract} />
    <Stack.Screen name="DealDraftUpload" component={DealDraftUploadScreen} />
    <Stack.Screen name="DealPublish" component={DealPublishScreen} />
    <Stack.Screen name="Strikes" component={StrikesScreen} />
  </Stack.Navigator>
);
