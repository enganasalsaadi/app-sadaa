import type { FollowerTierId } from '@/core/config';
import type { QuickRateCardInput, RateCard } from './rateCardTypes';

export type { FollowerTierId };

/** Mirrors backend enums (contract §2). */
export type UserType = 'influencer' | 'brand';
export type UserStatus = 'draft' | 'active' | 'suspended';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}
export interface GuestProfile {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes: string;
}

/** `profile_completion.steps[].key` (contract §3.1); influencer + brand keys. */
export const PROFILE_STEP_KEYS = [
  'account_created',
  'basic_info',
  'avatar',
  'email',
  'platforms',
  'platforms_verified',
  'rate_cards',
  'kyc',
  'company_info',
  'social_links',
] as const;
export type ProfileStepKey = (typeof PROFILE_STEP_KEYS)[number];

export interface ProfileCompletionStep {
  /** Kept as `string`: an unknown key from a newer server must not break the screen. */
  key: string;
  points: number;
  completed: boolean;
  /** `platforms_verified` → review status, `kyc` → KYC status; else null. */
  status: string | null;
}

/** `capabilities` keys (contract §3.1, wallet handoff §4): influencer first, then brand. */
export type CapabilityKey =
  | 'apply_to_briefs'
  | 'receive_requests'
  | 'accept_offers'
  | 'withdraw_funds'
  | 'create_campaigns'
  | 'request_services'
  | 'fund_deals'
  | 'top_up_wallet';

/** Why an action is blocked; drives the blocker text / CTA. */
export type CapabilityReason =
  | 'account_suspended'
  | 'onboarding_incomplete'
  | 'kyc_required'
  | 'kyc_pending'
  | 'kyc_rejected'
  | 'no_available_platform'
  | 'rate_card_required'
  | 'wallet_frozen'
  /** `withdraw_funds` only: payouts paused platform-wide. */
  | 'withdrawals_paused';

export interface Capability {
  allowed: boolean;
  reason: CapabilityReason | null;
}

export interface ProfileCompletion {
  percentage: number;
  earned_points: number;
  total_points: number;
  steps: ProfileCompletionStep[];
}

export interface UserKyc {
  status: KycStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

/** `/me` `primary_platform` — the lean slice of a PlatformResource. */
export interface PrimaryPlatformSummary {
  id: string;
  platform: string;
  username: string;
  follower_count: number | null;
  follower_tier: FollowerTierId | null;
  is_available: boolean;
  verification_status: 'auto_verified' | 'pending_review' | 'approved' | 'rejected';
}

export type PlatformsReviewStatus = 'verified' | 'under_review' | 'action_required';

export interface User {
  /** ULID. */
  id: string;
  full_name: string;
  email: string;
  phone: string;
  roles: string[];
  is_verified: boolean;
  created_at?: string;

  // --- GET /user/me (contract §3.1) ---
  user_type?: UserType;
  status?: UserStatus;
  kyc_status?: KycStatus;
  /** Influencer full name or brand company name. */
  display_name?: string;
  influencer_tier?: FollowerTierId | null;
  primary_platform?: PrimaryPlatformSummary | null;
  platforms_review_status?: PlatformsReviewStatus | null;
  kyc?: UserKyc | null;
  profile_completion?: ProfileCompletion;
  /** UI gates only; the server enforces them too (contract §3.1). */
  capabilities?: Partial<Record<CapabilityKey, Capability>>;
  unread_notifications_count?: number;

  // --- legacy fields (travel template) kept optional for back-compat ---
  user_id?: number;
  first_name?: string;
  last_name?: string;
  language?: string;
  avatar_url?: string;
  is_phone_verified?: boolean;
  country?: string;
  member_since?: string;
  billing_address?: BillingAddress;
  guest_profile?: GuestProfile;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  // Cross-device resume flags from POST /auth/login — meaningful only until
  // the (future) registration-onboarding flow is completed server-side.
  userType?: string;
  currentStep?: number;
  isOnboardingComplete?: boolean;
  // E.164 phone captured at login/step-1 time — fallback for the brand OTP
  // screens when GET /onboarding/progress hasn't populated profile.phone yet
  // (e.g. immediately after step-1, before the server persists it).
  pendingPhone?: string;
  // When the last phone-verification OTP was sent (epoch ms) — drives the
  // resend countdown across restarts. Unset after login: nothing was sent.
  phoneOtpSentAt?: number;
  // Persisted so a relaunch lands on the Suspended gate, not a flash of Main.
  // Set by any `account_suspended` 403 or a `suspended` progress status.
  isSuspended?: boolean;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * `AuthResource` (contract §15.3): POST /auth/login and both step-1s. Same
 * routing fields as `/onboarding/progress`, so one resolver serves both.
 * No `user` object — hydrated via GET /user/me. KYC review state lives in
 * `kyc_status`, never in `status`.
 */
export interface AuthResult {
  token: string;
  token_type: string;
  user_id: string;
  user_type: UserType;
  status: UserStatus;
  current_step: number;
  is_phone_verified: boolean;
  /** Active, or suspended after reaching the final step. */
  is_onboarding_complete: boolean;
}

export type LoginResponse = AuthResult;

export type { RegisterDevicePayload } from '@/core/notification';

// Forgot Password (phone OTP wizard): POST /auth/forgot-password.
// Always returns 200 with the same message regardless of whether the phone
// exists (no account enumeration).
export interface RequestPasswordResetRequest {
  phone: string;
}

// POST /auth/resend-otp (reset context), throttled server-side (60s).
export interface ResendPasswordResetOtpRequest {
  phone: string;
  type: 'password_reset';
}

// POST /auth/reset-password
export interface ResetPasswordRequest {
  phone: string;
  code: string;
  password: string;
  password_confirmation: string;
}

// POST /auth/logout (contract §15.13): the FCM token this device stops receiving on.
export interface LogoutRequest {
  fcm_token?: string;
}

// DELETE /auth/account — works for draft, active and suspended accounts.
export interface DeleteAccountRequest {
  current_password: string;
}

// POST /auth/verify-otp (brand phone-verification context) — 4-digit code.
export interface VerifyPhoneOtpRequest {
  phone: string;
  code: string;
  type: 'phone_verification';
}

// POST /auth/resend-otp (brand phone-verification context), throttled server-side (60s).
export interface ResendPhoneOtpRequest {
  phone: string;
  type: 'phone_verification';
}

// POST /onboarding/brand/step-1
export interface BrandStep1Request {
  company_name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface BrandStep1Response extends AuthResult {
  user_type: 'brand';
}

export interface BrandSocialLink {
  platform: string;
  url: string;
}

// POST /onboarding/brand/step-2
export interface BrandStep2Request {
  governorate: string;
  business_type: string;
  social_links: BrandSocialLink[];
}

/** Contract §15.9 — brand step-2/3 response and `progress.profile`. */
export interface BrandProfileResource {
  company_name?: string;
  phone?: string;
  email?: string;
  governorate?: string | null;
  governorate_label?: string | null;
  business_type?: string | null;
  business_type_label?: string | null;
  social_links?: BrandSocialLink[];
  kyc_document_type?: string | null;
  has_kyc_document?: boolean;
}

/** GET /onboarding/progress (contract §15.10), fields shared by both roles. */
interface OnboardingProgressBase {
  user_id: string;
  phone: string;
  email: string | null;
  status: UserStatus;
  current_step: number;
  is_phone_verified: boolean;
  is_kyc_approved: boolean;
  has_kyc_submission: boolean;
  kyc_status: KycStatus;
  is_verified: boolean;
  has_pending_verification: boolean;
  has_rate_card: boolean;
  is_onboarding_complete: boolean;
}

export interface BrandOnboardingProgress extends OnboardingProgressBase {
  user_type: 'brand';
  calculated_influencer_tier: null;
  profile: BrandProfileResource;
}

// POST /onboarding/influencer/step-1 — email optional, no password confirmation.
export interface InfluencerStep1Request {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  governorate: string;
}

export interface InfluencerStep1Response extends AuthResult {
  user_type: 'influencer';
}

export { FOLLOWER_TIERS } from '@/core/config';

/** One row of POST /onboarding/influencer/step-2 (contract §5.2). */
export interface InfluencerStep2Platform {
  platform: string;
  /** Username, `@username` or profile URL; the server normalises it. */
  handle: string;
  /** Required without lookup data; ignored by the server when a `found` lookup exists. */
  follower_tier?: FollowerTierId;
  /** At most one `true`; none → the server picks the biggest account. */
  is_primary?: boolean;
  is_available?: boolean;
}

// POST /onboarding/influencer/step-2 — replaces every platform on each call.
export interface InfluencerStep2Request {
  niches: string[];
  platforms: InfluencerStep2Platform[];
}

/** PlatformResource (contract §5.1): a saved social account. */
export interface PlatformResource {
  id: string;
  platform: string;
  platform_label: string;
  username: string;
  profile_url: string | null;
  display_name: string | null;
  /** `null` for manual platforms. */
  follower_count: number | null;
  follower_tier: FollowerTierId | null;
  follower_tier_label: string | null;
  tier_source: 'auto' | 'manual';
  verification_status: 'auto_verified' | 'pending_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  is_primary: boolean;
  is_available: boolean;
  supports_lookup: boolean;
  last_synced_at: string | null;
}

// POST /social/lookup (contract §4) — `refresh: true` only from a Refresh button.
export interface SocialLookupRequest {
  platform: string;
  handle: string;
  refresh?: boolean;
}

export interface SocialLookupProfile {
  platform: string;
  username: string;
  display_name: string | null;
  follower_count: number | null;
  follower_tier: FollowerTierId | null;
  is_verified_account: boolean;
  profile_url: string | null;
  avatar_url: string | null;
  fetched_at: string;
}

/** Always 200 for lookup outcomes — branch on `status`. `profile` only when `found`. */
export interface SocialLookupResult {
  status: 'found' | 'not_found' | 'unavailable' | 'manual_required';
  source: 'cache' | 'live' | null;
  manual_entry_allowed: boolean;
  /** Handle linked to another influencer: block adding it. */
  already_claimed: boolean;
  profile: SocialLookupProfile | null;
}

// POST /onboarding/influencer/step-3 — `is_skipped: true` skips rates; KYC (step-4) still follows.
export type InfluencerStep3Request =
  | { is_skipped: true }
  | { is_skipped: false; rate_cards: QuickRateCardInput[] };

/**
 * Influencer step-2/3/4 response and `progress.profile` (contract §15.6).
 * Step-3 omits `platforms`; step-4 sends both lists.
 */
export interface InfluencerProfileResource {
  full_name?: string;
  governorate?: string | null;
  governorate_label?: string | null;
  area?: string | null;
  niches?: string[];
  has_kyc_id?: boolean;
  platforms?: PlatformResource[];
  rate_cards?: RateCard[];
}

export interface InfluencerOnboardingProgress extends OnboardingProgressBase {
  user_type: 'influencer';
  calculated_influencer_tier: FollowerTierId | null;
  profile: InfluencerProfileResource | null;
}
