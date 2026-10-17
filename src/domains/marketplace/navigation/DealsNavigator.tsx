import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DealsStackParamList } from '@/core/navigation';
import { BrandCampaignApplicantScreen } from '../screens/BrandCampaignApplicantScreen';
import { BrandCampaignApplicantsScreen } from '../screens/BrandCampaignApplicantsScreen';
import { BrandCampaignCompareScreen } from '../screens/BrandCampaignCompareScreen';
import { BrandCampaignSelectedScreen } from '../screens/BrandCampaignSelectedScreen';
import { BrandCampaignDetailScreen } from '../screens/BrandCampaignDetailScreen';
import { BrandDealDetailScreen } from '../screens/BrandDealDetailScreen';
import { BrandDealsScreen } from '../screens/BrandDealsScreen';
import { CreatorDealDetailScreen } from '../screens/CreatorDealDetailScreen';
import { CreatorDealsScreen } from '../screens/CreatorDealsScreen';
import { DealContractScreen } from '../screens/DealContractScreen';
import { DealDraftReviewScreen } from '../screens/DealDraftReviewScreen';
import { DealDisputeScreen } from '../screens/DealDisputeScreen';
import { DealDraftUploadScreen } from '../screens/DealDraftUploadScreen';
import { DealPublicationReviewScreen } from '../screens/DealPublicationReviewScreen';
import { DealUpsellBuilderScreen } from '../screens/DealUpsellBuilderScreen';
import { DealPublishScreen } from '../screens/DealPublishScreen';
import { StrikesScreen } from '../screens/StrikesScreen';

const Stack = createNativeStackNavigator<DealsStackParamList>();

const SCREEN_OPTIONS = { headerShown: false, freezeOnBlur: true } as const;

const BrandContract: React.FC = () => <DealContractScreen role="brand" />;
const CreatorContract: React.FC = () => <DealContractScreen role="creator" />;
const BrandDispute: React.FC = () => <DealDisputeScreen role="brand" />;
const CreatorDispute: React.FC = () => <DealDisputeScreen role="creator" />;

/** Brand `DealsTab` (rule 01: MainTabs picks the role's navigator, screens never branch on it); reviews draft rounds (P6), verifies live posts (P7), adds to a running deal (M8), follows its dispute (P9.1) and opens its campaigns (Public Campaigns). */
export const BrandDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={BrandDealsScreen} />
    <Stack.Screen name="DealDetail" component={BrandDealDetailScreen} />
    <Stack.Screen name="DealContract" component={BrandContract} />
    <Stack.Screen name="DealDraftReview" component={DealDraftReviewScreen} />
    <Stack.Screen name="DealPublicationReview" component={DealPublicationReviewScreen} />
    <Stack.Screen name="DealUpsellBuilder" component={DealUpsellBuilderScreen} />
    <Stack.Screen name="DealDispute" component={BrandDispute} />
    <Stack.Screen name="CampaignDetail" component={BrandCampaignDetailScreen} />
    <Stack.Screen name="CampaignApplicants" component={BrandCampaignApplicantsScreen} />
    <Stack.Screen name="CampaignApplicant" component={BrandCampaignApplicantScreen} />
    <Stack.Screen name="CampaignCompare" component={BrandCampaignCompareScreen} />
    <Stack.Screen name="CampaignSelected" component={BrandCampaignSelectedScreen} />
  </Stack.Navigator>
);

/** Creator `DealsTab`: the shared routes, handing in draft rounds (P6) and live posts (P7), the dispute file (P9.1) and strikes (brands never see them, M8). */
export const CreatorDealsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="Deals" component={CreatorDealsScreen} />
    <Stack.Screen name="DealDetail" component={CreatorDealDetailScreen} />
    <Stack.Screen name="DealContract" component={CreatorContract} />
    <Stack.Screen name="DealDraftUpload" component={DealDraftUploadScreen} />
    <Stack.Screen name="DealPublish" component={DealPublishScreen} />
    <Stack.Screen name="DealDispute" component={CreatorDispute} />
    <Stack.Screen name="Strikes" component={StrikesScreen} />
  </Stack.Navigator>
);
