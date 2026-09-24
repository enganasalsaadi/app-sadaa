import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Verify: { email: string };
  ForgotPassword: undefined;
};

/** User-account screens hosted inside the Settings tab. */
type AccountScreens = {
  ProfileScreen: undefined;
  EditAccountScreen: undefined;
  ChangePasswordScreen: undefined;
  NotificationPrefScreen: undefined;
  LanguageScreen: undefined;
  WebViewScreen: { title: string; url: string };
};

export type HomeStackParamList = {
  HomeScreen: undefined;
};

export type SettingsStackParamList = AccountScreens;

/**
 * Dev-only screens layered on top of the root stack (see RootNavigator,
 * gated behind `if (__DEV__)`). Not part of any domain's public navigation.
 */
export type DevShowcaseStackParamList = {
  DevShowcase: undefined;
  LayoutFixedHeaderScreen: undefined;
  LayoutNoHeaderScrollScreen: undefined;
  LayoutDarkForcedScreen: undefined;
  LayoutCtaButtonScreen: undefined;
  LayoutNoScrollWithHandlerScreen: undefined;
  LayoutGradientHeroScreen: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SettingsStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;
