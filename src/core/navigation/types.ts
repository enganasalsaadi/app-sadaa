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
  InfluencerRegister: undefined;
};

/** Forgot-password wizard (phone → code → new password), inside `ForgotPassword`. */
export type PasswordResetStackParamList = {
  /** Prefilled from whatever was typed on Login. */
  ResetPhone: { phone?: string; countryCode?: CountryCode } | undefined;
  ResetOtp: {
    phone: string;
    /** Epoch ms when resend unlocks (60s after a send, or the server's `retry_after`). */
    resendAvailableAt: number;
    /**
     * Set by ResetPassword when reset-password refused the code: the code is
     * only checked there, never by verify-otp (that consumes it).
     */
    codeRejection?: { message: string; at: number };
  };
  /** `resendAvailableAt` is carried back to the code step on a rejection. */
  ResetPassword: { phone: string; code: string; resendAvailableAt: number };
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

/** Creator registration after the account exists (AppStatus REGISTRATION_INCOMPLETE). */
export type InfluencerWizardStackParamList = {
  InfluencerVerifyPhone: undefined;
  /** `fromBack`: replaced in from rates on resume — animates as a pop. */
  InfluencerSocials: { fromBack?: boolean } | undefined;
  /** `fromBack`: replaced in from KYC on resume — animates as a pop. */
  InfluencerRates: { fromBack?: boolean } | undefined;
  InfluencerKyc: undefined;
};

export type InfluencerOnboardingStackParamList = {
  InfluencerWizard: NavigatorScreenParams<InfluencerWizardStackParamList>;
  InfluencerWelcome: undefined;
};

/** User-account screens hosted inside the Settings tab. */
type AccountScreens = {
  ProfileScreen: undefined;
  PersonalInfoScreen: undefined;
  CompanyInfoScreen: undefined;
  KycScreen: undefined;
  ChangePasswordScreen: undefined;
  LanguageScreen: undefined;
  WebViewScreen: { title: string; url: string };
  PlatformsScreen: undefined;
  PlatformDetailScreen: { platformId: string };
  NichesScreen: undefined;
  /** Inbox (notifications domain), opened from the Profile bell or a push. */
  NotificationsScreen: undefined;
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
  /** Brand: my campaigns · creator: my deals. Placeholder until marketplace ships it. */
  DealsTab: undefined;
  /** Placeholder until the messaging domain lands. */
  MessagesTab: undefined;
  /** Placeholder until finance ships the wallet screen. */
  WalletTab: undefined;
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
