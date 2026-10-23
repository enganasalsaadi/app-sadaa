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
  /** Step 4: the verification picker; each method below opens from it. */
  BrandKyc: undefined;
  BrandKycDocument: { documentGroup: KycDocumentGroupParam };
  BrandSocialProof: undefined;
  BrandDomainEmail: undefined;
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

/** Brand KYC upload from the verification picker: option 1 (company paperwork) or 2 (owner ID / passport). */
export type KycDocumentGroupParam = 'company' | 'owner';

/** User-account screens hosted inside the Settings tab. */
type AccountScreens = {
  ProfileScreen: undefined;
  PersonalInfoScreen: undefined;
  CompanyInfoScreen: undefined;
  /** Brands: `documentGroup` picks the document types offered (default `company`). */
  KycScreen: { documentGroup?: KycDocumentGroupParam } | undefined;
  /** Brand verification picker: the four methods, the active attempt, or the verified state. */
  CompanyVerification: undefined;
  /** Brand verification by a code DM'd from the store's Instagram / Facebook page. */
  SocialProof: undefined;
  /** Brand verification by a link emailed to an address on the company's domain. */
  DomainEmail: undefined;
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

/** `HomeTab` stack. Brand registers `BrandHomeScreen` + `Explore`; creator registers the rest. */
export type HomeStackParamList = {
  BrandHomeScreen: undefined;
  /** Creator search; `filters` prefill (a category, a rail's "See all"), `focusSearch` opens the keyboard. */
  Explore: ExploreParams | undefined;
  /** Saved creators, from the ❤️ in the brand Home header. */
  Shortlist: undefined;
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
  /** Creator withdraw wizard (nested stack: amount → review). */
  Withdraw: undefined;
  /** Withdrawal history; `status` opens it filtered. */
  Withdrawals: { status?: WithdrawalStatusParam } | undefined;
  /** One withdrawal; `submitted` = just sent from the wizard (close goes back to the wallet). */
  WithdrawalDetail: { id: string; submitted?: boolean };
};

/**
 * `DealsTab` stack (marketplace), same route names for both roles; each role's navigator
 * registers its own screens (rule 01). Ids only, so a push or link can open them too.
 */
export type DealsStackParamList = {
  /**
   * Brand: needs action / active / drafts / closed · creator: new offers / active / closed.
   * Creator only: `tab` opens that tab (Home's map tiles); none keeps the one open.
   */
  Deals: { tab?: 'new' | 'active' } | undefined;
  DealDetail: { id: string };
  /** The deal's signed contract and its addenda. */
  DealContract: { id: string };
  /** Both: every file on the deal (brief, rounds, proofs, evidence, courier photos) to view and save. */
  DealFiles: { id: string };
  /** Creator only: hand in a deliverable's draft round, or look at the one waiting for review. */
  DealDraftUpload: { id: string; itemId: string };
  /** Brand only: review a deliverable's latest round (pins, approve, ask for changes). */
  DealDraftReview: { id: string; itemId: string };
  /** Creator only: hand in a deliverable's live link + proof screenshots, or watch it on air. */
  DealPublish: { id: string; itemId: string };
  /** Brand only: verify a deliverable's live post or ask for a fix. */
  DealPublicationReview: { id: string; itemId: string };
  /** Brand only: add a service or an add-on to a running deal (an addendum the creator signs). */
  DealUpsellBuilder: { id: string };
  /** Both: the deal's dispute file (evidence from both sides, the ruling). */
  DealDispute: { id: string };
  /** Creator only: withdrawal strikes (`sada://strikes`). */
  Strikes: undefined;
  /** Brand only: one of their campaigns (`sada://campaigns/{id}`). Creators open it in `OpportunitiesTab`. */
  CampaignDetail: { id: string };
  /** Brand only: a campaign's attachments (cover + brief files) to view and save. */
  CampaignFiles: { id: string };
  /** Brand only: the applicants table of one of their campaigns (Public Campaigns PC3). */
  CampaignApplicants: { id: string; closePrompt?: boolean };
  /** Brand only: one applicant of that campaign (`applicationId`), with the shortlist / reject decisions. */
  CampaignApplicant: { id: string; applicationId: string };
  /** Brand only: 2–3 pending applicants of that campaign side by side, in the order picked. */
  CampaignCompare: { id: string; ids: string[] };
  /**
   * Brand only: what selecting an applicant led to. `funded` and the seat count are the select
   * answer's; the card and (unfunded) the deal are read again from the server. «Keep going» returns to
   * the applicants table, asking «keep recruiting or close» when the answer said `promptClose`.
   */
  CampaignSelected: {
    id: string;
    applicationId: string;
    dealId: string;
    funded: boolean;
    seatsOccupied: number;
    seatsTotal: number;
    promptClose: boolean;
  };
  /** Brand only: the launch room of a campaign with a drop (Public Campaigns PC8). */
  CampaignDrop: { id: string };
  CampaignShipping: { id: string };
  /** Brand only: broadcast to every creator on a funded deal, three a day (Public Campaigns PC8). */
  CampaignAnnouncements: { id: string };
};

/** `OpportunitiesTab` stack (marketplace, creator only): the public-campaign feed and a campaign's page. */
export type OpportunitiesStackParamList = {
  /** `segment` opens that destination (Home's «under review» chip → `applications`); none keeps the one open. */
  Opportunities: { segment?: 'feed' | 'saved' | 'applications' } | undefined;
  /** Id only, so a push or link can open it (`sada://campaigns/{id}`). */
  CampaignDetail: { id: string };
};

/** `channel` = add a method of that channel (validated by finance); `id` = edit a saved one. */
export type PayoutMethodFormParams = { channel: string } | { id: string };

/** Top-up statuses the history filters by (finance's `TOP_UP_STATUS` mirrors them). */
export type TopUpStatusParam = 'pending_review' | 'completed' | 'rejected' | 'reversed';

/** Withdrawal statuses the history filters by (finance's `WITHDRAWAL_STATUS` mirrors them). */
export type WithdrawalStatusParam = 'pending' | 'completed' | 'rejected' | 'cancelled' | 'returned';

/** Explore sorts (marketplace's `EXPLORE_SORTS` mirrors them); `price_*` are 🔒 for unverified brands. */
export type ExploreSortParam =
  | 'recommended'
  | 'followers_desc'
  | 'newest'
  | 'delivery_asc'
  | 'price_asc'
  | 'price_desc';

/** Explore query in app terms; also the cache key, so each filter set keeps its own pages. */
export interface ExploreFilters {
  q?: string;
  governorate?: string[];
  platform?: string[];
  niche?: string[];
  tier?: string[];
  /** Home category chip; the server expands it to niches. */
  category?: string;
  minFollowers?: number;
  maxFollowers?: number;
  kycVerified?: boolean;
  followersVerified?: boolean;
  rush?: boolean;
  onSite?: boolean;
  maxDeliveryDays?: number;
  /** 🔒 verified brands only (whole dollars). */
  priceMin?: number;
  /** 🔒 */
  priceMax?: number;
  /** 🔒 */
  withinBudget?: boolean;
  sort?: ExploreSortParam;
}

export interface ExploreParams {
  filters?: ExploreFilters;
  focusSearch?: boolean;
}

/**
 * Amount (and channel, validated by finance) the top-up starts with: a repeated top-up
 * carries both, a deal's shortfall only the amount.
 */
export interface TopUpPrefill {
  channel?: string;
  amount: Money;
}

/** Brand top-up wizard (channel → amount → proof → review), inside `TopUp`. */
export type TopUpStackParamList = {
  TopUpChannel: undefined;
  TopUpAmount: undefined;
  TopUpTransfer: undefined;
  TopUpReview: undefined;
};

/** Creator withdraw wizard (amount + live quote → review), inside `Withdraw`. */
export type WithdrawStackParamList = {
  WithdrawAmount: undefined;
  WithdrawReview: undefined;
};

/** How a public creator profile was opened; sent as the views beacon `src` (contract §17.5). */
export type CreatorProfileSource = 'link' | 'app' | 'search';

/** Root-stack screens shared by the signed-in and signed-out branches, above the tabs / Login. */
export type PublicStackParamList = {
  /** Public media kit (contract §17.4), from a `/c/{slug}` link or in-app. */
  MediaKitPublic: { slug: string; source: CreatorProfileSource };
};

/** Which side reads the deal guide (marketplace `DealRole`). */
export type DealGuideRole = 'brand' | 'creator';

/**
 * `general`: from a profile or the FAQ, every chapter (shipping tagged «with a product»).
 * `deal`: from inside a deal, shipping only when it has a product.
 */
export type DealGuideParams = {
  role: DealGuideRole;
  context: 'general' | 'deal';
  hasProduct?: boolean;
};

/** Signed-in root screens of Direct Deals that sit above the tabs (marketplace). */
export type DealFlowStackParamList = {
  /**
   * Brand offer builder for one creator; `draftId` reopens a saved draft, `rateCardIds`
   * carries the services already picked on the media kit.
   */
  OfferBuilder: { slug: string; draftId?: string; rateCardIds?: string[] };
  /**
   * Brand campaign wizard. No params = a new campaign; `campaignId` opens a draft: `resume` jumps
   * to the first step that still needs something, `duplicate` starts at the first step, `edit`
   * changes a published campaign (saved on «save», not as the brand types).
   */
  CampaignWizard: { campaignId?: string; source?: 'resume' | 'duplicate' | 'edit' } | undefined;
  /** «How a deal completes», one page per role. */
  DealGuide: DealGuideParams;
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
  /** Direct deals, both roles (marketplace). */
  DealsTab: NavigatorScreenParams<DealsStackParamList> | undefined;
  /** Public campaigns feed: replaces `MessagesTab` for creators while campaigns are enabled. */
  OpportunitiesTab: NavigatorScreenParams<OpportunitiesStackParamList> | undefined;
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

export type DealsStackScreenProps<T extends keyof DealsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DealsStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type OpportunitiesStackScreenProps<T extends keyof OpportunitiesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OpportunitiesStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type TopUpStackScreenProps<T extends keyof TopUpStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<TopUpStackParamList, T>,
  WalletStackScreenProps<'TopUp'>
>;

export type WithdrawStackScreenProps<T extends keyof WithdrawStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<WithdrawStackParamList, T>,
  WalletStackScreenProps<'Withdraw'>
>;

export type PublicStackScreenProps<T extends keyof PublicStackParamList> =
  NativeStackScreenProps<PublicStackParamList, T>;

export type DealFlowStackScreenProps<T extends keyof DealFlowStackParamList> =
  NativeStackScreenProps<DealFlowStackParamList, T>;

export type DevShowcaseStackScreenProps<T extends keyof DevShowcaseStackParamList> =
  NativeStackScreenProps<DevShowcaseStackParamList, T>;
