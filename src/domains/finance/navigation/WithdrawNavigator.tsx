import React from 'react';
import { FormProvider } from 'react-hook-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WithdrawStackParamList } from '@/core/navigation';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardSheet } from '../components/DiscardSheet';
import { useWithdrawFlowState, WithdrawFlowContext } from '../hooks/useWithdrawFlow';
import { WithdrawAmountScreen } from '../screens/WithdrawAmountScreen';
import { WithdrawReviewScreen } from '../screens/WithdrawReviewScreen';

const Stack = createNativeStackNavigator<WithdrawStackParamList>();

const SCREEN_OPTIONS = { headerShown: false } as const;

/**
 * Creator withdraw wizard (`Withdraw` in the creator wallet stack): one form and one flow
 * state for both steps, so the review edits in place and the quote survives going back.
 */
export const WithdrawNavigator: React.FC = () => {
  const { form, flow, guard } = useWithdrawFlowState();
  useHideBottomBar();

  return (
    <FormProvider {...form}>
      <WithdrawFlowContext.Provider value={flow}>
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="WithdrawAmount" component={WithdrawAmountScreen} />
          <Stack.Screen name="WithdrawReview" component={WithdrawReviewScreen} />
        </Stack.Navigator>
        <DiscardSheet guard={guard} flow="withdraw" />
      </WithdrawFlowContext.Provider>
    </FormProvider>
  );
};
