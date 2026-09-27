import type { CountryCode } from 'libphonenumber-js';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

export type AuthStackParamList = {
  /** `phone` (E.164) prefills the form, e.g. after a password reset. */
  Login: { phone?: string } | undefined;
  ForgotPassword: NavigatorScreenParams<PasswordResetStackParamList> | undefined;
  BrandRegister: undefined;
};

/** Forgot-password wizard (phone → code → new password), inside `ForgotPassword`. */
export type PasswordResetStackParamList = {
  /** Prefilled from whatever was typed on Login. */
  ResetPhone: { phone?: string; countryCode?: CountryCode } | undefined;
  /** `sentAt`: epoch ms of the last send, drives the resend cooldown. */
  ResetOtp: { phone: string; sentAt: number };
  ResetPassword: { phone: string; code: string };
};

/** Brand registration after the account exists (AppStatus REGISTRATION_INCOMPLETE). */
export type BrandWizardStackParamList = {
  BrandVerifyPhone: undefined;
  /** `fromBack`: replaced in from KYC on resume — animates as a pop. */
  BrandProfile: { fromBack?: boolean } | undefined;
  BrandKyc: undefined;
};

export type BrandOnboardingStackParamList = {
  BrandWizard: NavigatorScreenParams<BrandWizardStackParamList>;
  BrandWelcome: undefined;
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
export type DevShowcaseCategoryId =
  | 'foundations'
  | 'actions'
  | 'inputs'
  | 'display'
  | 'feedback'
  | 'overlays'
  | 'lists'
  | 'layouts'
  | 'sada';

export type DevShowcaseStackParamList = {
  DevShowcase: undefined;
  DevShowcaseCategory: { category: DevShowcaseCategoryId };
  LayoutFixedHeaderScreen: undefined;
  LayoutNoHeaderScrollScreen: undefined;
  LayoutDarkForcedScreen: undefined;
  LayoutCtaButtonScreen: undefined;
  LayoutNoScrollWithHandlerScreen: undefined;
  LayoutGradientHeroScreen: undefined;
  LayoutHeroSheetScreen: undefined;
  LayoutWizardScreen: undefined;
  LayoutListStatesScreen: undefined;
  LayoutHideOnScrollScreen: undefined;
  LayoutCollapseHeaderScreen: undefined;
  LayoutHeroOverlayScreen: undefined;
  LayoutStickyScreen: undefined;
  LayoutFooterElevateScreen: undefined;
  LayoutFabScreen: undefined;
  LayoutBrandHeaderScreen: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type PasswordResetStackScreenProps<T extends keyof PasswordResetStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<PasswordResetStackParamList, T>,
    NativeStackScreenProps<AuthStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type DevShowcaseStackScreenProps<T extends keyof DevShowcaseStackParamList> =
  NativeStackScreenProps<DevShowcaseStackParamList, T>;
