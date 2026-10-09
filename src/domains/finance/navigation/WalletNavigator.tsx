import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/core/navigation';
import { PayoutMethodFormScreen } from '../screens/PayoutMethodFormScreen';
import { PayoutMethodsScreen } from '../screens/PayoutMethodsScreen';
import { StatementScreen } from '../screens/StatementScreen';
import { TopUpDetailScreen } from '../screens/TopUpDetailScreen';
import { TopUpsScreen } from '../screens/TopUpsScreen';
import { TransactionReceiptScreen } from '../screens/TransactionReceiptScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { WithdrawalDetailScreen } from '../screens/WithdrawalDetailScreen';
import { WithdrawalsScreen } from '../screens/WithdrawalsScreen';
import { TopUpNavigator } from './TopUpNavigator';
import { WithdrawNavigator } from './WithdrawNavigator';

const Stack = createNativeStackNavigator<WalletStackParamList>();

const SCREEN_OPTIONS = { headerShown: false, freezeOnBlur: true } as const;

const CreatorWalletScreen: React.FC = () => <WalletScreen role="creator" />;
const BrandWalletScreen: React.FC = () => <WalletScreen role="brand" />;
const CreatorStatementScreen: React.FC = () => <StatementScreen role="creator" />;
const BrandStatementScreen: React.FC = () => <StatementScreen role="brand" />;

/** Creator `WalletTab` (rule 01: MainTabs picks the role's navigator, screens never branch on it); creators withdraw (rule 06). */
export const CreatorWalletNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="WalletScreen" component={CreatorWalletScreen} />
    <Stack.Screen name="Statement" component={CreatorStatementScreen} />
    <Stack.Screen name="TransactionReceipt" component={TransactionReceiptScreen} />
    <Stack.Screen name="PayoutMethods" component={PayoutMethodsScreen} />
    <Stack.Screen name="PayoutMethodForm" component={PayoutMethodFormScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawNavigator} />
    <Stack.Screen name="Withdrawals" component={WithdrawalsScreen} />
    <Stack.Screen name="WithdrawalDetail" component={WithdrawalDetailScreen} />
  </Stack.Navigator>
);

/** Brand `WalletTab`: the shared screens plus top-ups (brands deposit, rule 06). */
export const BrandWalletNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name="WalletScreen" component={BrandWalletScreen} />
    <Stack.Screen name="Statement" component={BrandStatementScreen} />
    <Stack.Screen name="TransactionReceipt" component={TransactionReceiptScreen} />
    <Stack.Screen name="TopUp" component={TopUpNavigator} />
    <Stack.Screen name="TopUps" component={TopUpsScreen} />
    <Stack.Screen name="TopUpDetail" component={TopUpDetailScreen} />
  </Stack.Navigator>
);
