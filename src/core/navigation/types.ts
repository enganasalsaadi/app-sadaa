import type { CountryCode } from 'libphonenumber-js';
import type { Money } from '@/core/money';
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
  /** Creator media kit link + visibility; also registered in the creator Home stack. */
  MediaKitSettings: undefined;
  /** Creator prices (Rate Cards v2), grouped by platform. */
  RateCards: undefined;
  /** `cardId` edits a saved card; otherwise a new one, `group` preset from a group's "Add". */
  RateCardEditor: { cardId?: string; group?: string } | undefined;
};

/** `HomeTab` stack. Brand registers `HomeScreen` (Explore); creator registers the rest. */
export type HomeStackParamList = {
  HomeScreen: undefined;
  CreatorHomeScreen: undefined;
  MediaKitInsights: undefined;
  MediaKitPreview: undefined;
  MediaKitSettings: undefined;
};

export type SettingsStackParamList = AccountScreens;

/** `WalletTab` stack (finance), same screens for both roles; money flows join it step by step. */
export type WalletStackParamList = {
  WalletScreen: undefined;
  /** Full statement: every line, filtered by type and period. */
  Statement: undefined;
  /** One line's receipt; `reference` only, so a push or link can open it too. */
  TransactionReceipt: { reference: string };
  /** Brand top-up wizard (nested stack); a "new top-up" from a rejected one carries it over. */
  TopUp: TopUpPrefill | undefined;
  /** Top-up history; `status` opens it filtered (the hero's "in review" tile). */
  TopUps: { status?: TopUpStatusParam } | undefined;
  /**
   * One top-up; `submitted` = just sent from the wizard (close goes back to the wallet),
   * with the channel's localized review time when the server set one.
   */
  TopUpDetail: { id: string; submitted?: boolean; processingTime?: string };
  /** Creator payout methods: where withdrawals go. */
  PayoutMethods: undefined;
  PayoutMethodForm: PayoutMethodFormParams;
};

/** `channel` = add a method of that channel (validated by finance); `id` = edit a saved one. */
export type PayoutMethodFormParams = { channel: string } | { id: string };

/** Top-up statuses the history filters by (finance's `TOP_UP_STATUS` mirrors them). */
export type TopUpStatusParam = 'pending_review' | 'completed' | 'rejected' | 'reversed';

/** Channel (validated by finance) and amount of the top-up being repeated. */
export interface TopUpPrefill {
  channel: string;
  amount: Money;
}

/** Brand top-up wizard (channel → amount → proof → review), inside `TopUp`. */
export type TopUpStackParamList = {
  TopUpChannel: undefined;
  TopUpAmount: undefined;
  TopUpTransfer: undefined;
  TopUpReview: undefined;
};

/** How a public creator profile was opened; sent as the views beacon `src` (contract §17.5). */
export type CreatorProfileSource = 'link' | 'app' | 'search';

/** Root-stack screens shared by the signed-in and signed-out branches, above the tabs / Login. */
export type PublicStackParamList = {
  /** Public media kit (contract §17.4), from a `/c/{slug}` link or in-app. */
  MediaKitPublic: { slug: string; source: CreatorProfileSource };
};

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
  LayoutDashboardScreen: undefined;
  LayoutBrandHeaderScreen: undefined;
  LayoutMoneyWizardScreen: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  /** Brand: my campaigns · creator: my deals. Placeholder until marketplace ships it. */
  DealsTab: undefined;
  /** Placeholder until the messaging domain lands. */
  MessagesTab: undefined;
  WalletTab: NavigatorScreenParams<WalletStackParamList> | undefined;
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

export type WalletStackScreenProps<T extends keyof WalletStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WalletStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type TopUpStackScreenProps<T extends keyof TopUpStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<TopUpStackParamList, T>,
  WalletStackScreenProps<'TopUp'>
>;

export type PublicStackScreenProps<T extends keyof PublicStackParamList> =
  NativeStackScreenProps<PublicStackParamList, T>;

export type DevShowcaseStackScreenProps<T extends keyof DevShowcaseStackParamList> =
  NativeStackScreenProps<DevShowcaseStackParamList, T>;
