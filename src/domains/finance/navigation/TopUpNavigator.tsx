import React from 'react';
import { FormProvider } from 'react-hook-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TopUpStackParamList } from '@/core/navigation';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardSheet } from '../components/DiscardSheet';
import { TopUpFlowContext, useTopUpFlowState } from '../hooks/useTopUpFlow';
import { TopUpAmountScreen } from '../screens/TopUpAmountScreen';
import { TopUpChannelScreen } from '../screens/TopUpChannelScreen';
import { TopUpReviewScreen } from '../screens/TopUpReviewScreen';
import { TopUpTransferScreen } from '../screens/TopUpTransferScreen';

const Stack = createNativeStackNavigator<TopUpStackParamList>();

const SCREEN_OPTIONS = { headerShown: false } as const;

/**
 * Brand top-up wizard (`TopUp` in the brand wallet stack): one form and one flow state
 * for the four steps, so going back keeps what was entered and the review edits in place.
 */
export const TopUpNavigator: React.FC = () => {
  const { form, flow, guard } = useTopUpFlowState();
  useHideBottomBar();

  return (
    <FormProvider {...form}>
      <TopUpFlowContext.Provider value={flow}>
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="TopUpChannel" component={TopUpChannelScreen} />
          <Stack.Screen name="TopUpAmount" component={TopUpAmountScreen} />
          <Stack.Screen name="TopUpTransfer" component={TopUpTransferScreen} />
          <Stack.Screen name="TopUpReview" component={TopUpReviewScreen} />
        </Stack.Navigator>
        <DiscardSheet guard={guard} flow="topUp" />
      </TopUpFlowContext.Provider>
    </FormProvider>
  );
};
