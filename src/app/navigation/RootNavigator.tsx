import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { AppStatus } from '@/app/bootstrap';
import { ChooseLanguageScreen } from '@/app/screens';
import { HomeNavigator } from '@/domains/marketplace';
import type { RootTabParamList } from '@/core/navigation';
import { AuthNavigator } from '@/domains/auth';
import { SettingsNavigator } from '@/domains/identity';
import FloatingBottomBar from '@/shared/ui/FloatingBottomBar';
import { ScrollProvider } from '@/shared/context/ScrollContext';
import { BottomBarProvider } from '@/shared/context/BottomBarContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

type RootStackParamList = {
  ChooseLanguage: undefined;
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  appStatus: AppStatus;
}

const renderTabBar = (props: BottomTabBarProps) => (
  <FloatingBottomBar {...props} />
);

const MainTabs: React.FC = () => {
  return (
    <ScrollProvider>
      <BottomBarProvider>
        <Tab.Navigator
          initialRouteName="HomeTab"
          tabBar={renderTabBar}
          // `animation: 'fade'` here races freezeOnBlur (rn-screens 4.24 + React 19):
          // the cross-fade can finish before the thawed tab commits its first frame,
          // leaving an intermittent blank screen. Instant switch avoids the race.
          screenOptions={{ headerShown: false, animation: 'none' }}
        >
          <Tab.Screen name="HomeTab" component={HomeNavigator} />
          <Tab.Screen name="SettingsTab" component={SettingsNavigator} />
        </Tab.Navigator>
      </BottomBarProvider>
    </ScrollProvider>
  );
};

export const RootNavigator: React.FC<Props> = ({ appStatus }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        freezeOnBlur: true,
      }}
    >
      {appStatus === AppStatus.CHOOSE_LANGUAGE && (
        <Stack.Screen name="ChooseLanguage">
          {() => <ChooseLanguageScreen />}
        </Stack.Screen>
      )}
      {appStatus === AppStatus.UNAUTHENTICATED && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {appStatus === AppStatus.AUTHENTICATED && (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};
