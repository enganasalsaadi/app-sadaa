import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStatus } from '@/app/bootstrap';
import {
  ChooseLanguageScreen,
  OnboardingScreen,
  MaintenanceScreen,
  ForceUpdateScreen,
  DevShowcaseScreen,
  ShowcaseCategoryScreen,
  LayoutFixedHeaderScreen,
  LayoutNoHeaderScrollScreen,
  LayoutDarkForcedScreen,
  LayoutCtaButtonScreen,
  LayoutNoScrollWithHandlerScreen,
  LayoutGradientHeroScreen,
  LayoutHeroSheetScreen,
  LayoutWizardScreen,
  LayoutListStatesScreen,
  LayoutHideOnScrollScreen,
  LayoutCollapseHeaderScreen,
  LayoutHeroOverlayScreen,
  LayoutStickyScreen,
  LayoutFooterElevateScreen,
  LayoutFabScreen,
  LayoutBrandHeaderScreen,
  LayoutDashboardScreen,
} from '@/app/screens';
import type { DevShowcaseStackParamList, PublicStackParamList } from '@/core/navigation';
import {
  AuthNavigator,
  BrandOnboardingNavigator,
  InfluencerOnboardingNavigator,
  SuspendedScreen,
  selectUserType,
} from '@/domains/auth';
import { useAppSelector } from '@/core/store';
import { MediaKitPublicScreen } from '@/domains/identity';
import { MainTabs } from './MainTabs';

type RootStackParamList = {
  Maintenance: undefined;
  ForceUpdate: undefined;
  ChooseLanguage: undefined;
  Onboarding: undefined;
  Auth: undefined;
  OnboardingResume: undefined;
  Suspended: undefined;
  Main: undefined;
} & PublicStackParamList &
  DevShowcaseStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  appStatus: AppStatus;
  /** Server text for the maintenance branch (falls back to the i18n default). */
  maintenanceMessage?: string | null;
  /** Called when intro slides are finished or skipped. */
  onOnboardingFinish: () => void;
}

/** Role comes from the server session (step-1 / login response), never a local choice (rule 07). */
const OnboardingResume: React.FC = () => {
  const userType = useAppSelector(selectUserType);
  return userType === 'influencer' ? (
    <InfluencerOnboardingNavigator />
  ) : (
    <BrandOnboardingNavigator />
  );
};

export const RootNavigator: React.FC<Props> = ({
  appStatus,
  maintenanceMessage,
  onOnboardingFinish,
}) => {
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
      {appStatus === AppStatus.ONBOARDING && (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onFinish={onOnboardingFinish} />}
        </Stack.Screen>
      )}
      {appStatus === AppStatus.UNAUTHENTICATED && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {appStatus === AppStatus.REGISTRATION_INCOMPLETE && (
        <Stack.Screen name="OnboardingResume" component={OnboardingResume} />
      )}
      {appStatus === AppStatus.SUSPENDED && (
        <Stack.Screen name="Suspended" component={SuspendedScreen} />
      )}
      {appStatus === AppStatus.AUTHENTICATED && (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      {/*
        Public creator profile (opened links, contract §17.8) over the tabs or
        Login. `navigationKey` drops it when the session branch changes.
      */}
      {(appStatus === AppStatus.AUTHENTICATED || appStatus === AppStatus.UNAUTHENTICATED) && (
        <Stack.Screen
          name="MediaKitPublic"
          component={MediaKitPublicScreen}
          navigationKey={appStatus}
          options={{ animation: 'default' }}
        />
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
          <Stack.Screen name="DevShowcaseCategory" component={ShowcaseCategoryScreen} />
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
          <Stack.Screen name="LayoutHeroSheetScreen" component={LayoutHeroSheetScreen} />
          <Stack.Screen name="LayoutWizardScreen" component={LayoutWizardScreen} />
          <Stack.Screen name="LayoutListStatesScreen" component={LayoutListStatesScreen} />
          <Stack.Screen name="LayoutHideOnScrollScreen" component={LayoutHideOnScrollScreen} />
          <Stack.Screen name="LayoutCollapseHeaderScreen" component={LayoutCollapseHeaderScreen} />
          <Stack.Screen name="LayoutHeroOverlayScreen" component={LayoutHeroOverlayScreen} />
          <Stack.Screen name="LayoutStickyScreen" component={LayoutStickyScreen} />
          <Stack.Screen name="LayoutFooterElevateScreen" component={LayoutFooterElevateScreen} />
          <Stack.Screen name="LayoutFabScreen" component={LayoutFabScreen} />
          <Stack.Screen name="LayoutBrandHeaderScreen" component={LayoutBrandHeaderScreen} />
          <Stack.Screen name="LayoutDashboardScreen" component={LayoutDashboardScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
