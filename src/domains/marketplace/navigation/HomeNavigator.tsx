import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/core/navigation';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);
