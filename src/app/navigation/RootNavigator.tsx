import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { AppStatus } from '@/app/bootstrap';
import {
  ChooseLanguageScreen,
  MaintenanceScreen,
  ForceUpdateScreen,
  DevShowcaseScreen,
  LayoutFixedHeaderScreen,
  LayoutNoHeaderScrollScreen,
  LayoutDarkForcedScreen,
  LayoutCtaButtonScreen,
  LayoutNoScrollWithHandlerScreen,
  LayoutGradientHeroScreen,
} from '@/app/screens';
import { HomeNavigator } from '@/domains/marketplace';
import type { RootTabParamList, DevShowcaseStackParamList } from '@/core/navigation';
import { AuthNavigator } from '@/domains/auth';
import { SettingsNavigator } from '@/domains/identity';
import FloatingBottomBar from '@/shared/ui/FloatingBottomBar';
import { ScrollProvider } from '@/shared/context/ScrollContext';
import { BottomBarProvider } from '@/shared/context/BottomBarContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

type RootStackParamList = {
  Maintenance: undefined;
  ForceUpdate: undefined;
  ChooseLanguage: undefined;
  Auth: undefined;
  Main: undefined;
} & DevShowcaseStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  appStatus: AppStatus;
  /** Server text for the maintenance branch (falls back to the i18n default). */
  maintenanceMessage?: string | null;
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

export const RootNavigator: React.FC<Props> = ({ appStatus, maintenanceMessage }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        freezeOnBlur: true,
      }}
    >
      {appStatus === AppStatus.MAINTENANCE && (
        <Stack.Screen name="Maintenance">
          {() => <MaintenanceScreen message={maintenanceMessage} />}
        </Stack.Screen>
      )}
      {appStatus === AppStatus.UPDATE_REQUIRED && (
        <Stack.Screen name="ForceUpdate" component={ForceUpdateScreen} />
      )}
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

      {/*
        Dev-only screens layered on top of the Main branch, not an alternate
        AppStatus branch — reachable only via imperative `navigate()` from the
        Profile screen's `__DEV__`-gated row. Stripped from production builds
        by dead-code elimination on the `__DEV__` constant.
      */}
      {__DEV__ && (
        <Stack.Group>
          <Stack.Screen name="DevShowcase" component={DevShowcaseScreen} />
          <Stack.Screen
            name="LayoutFixedHeaderScreen"
            component={LayoutFixedHeaderScreen}
          />
          <Stack.Screen
            name="LayoutNoHeaderScrollScreen"
            component={LayoutNoHeaderScrollScreen}
          />
          <Stack.Screen
            name="LayoutDarkForcedScreen"
            component={LayoutDarkForcedScreen}
          />
          <Stack.Screen
            name="LayoutCtaButtonScreen"
            component={LayoutCtaButtonScreen}
          />
          <Stack.Screen
            name="LayoutNoScrollWithHandlerScreen"
            component={LayoutNoScrollWithHandlerScreen}
          />
          <Stack.Screen
            name="LayoutGradientHeroScreen"
            component={LayoutGradientHeroScreen}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
