import type { FollowerTierId } from '@/core/config';

export type { FollowerTierId };

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

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  roles: string[];
  is_verified: boolean;
  created_at?: string;

  // --- legacy fields (travel template) kept optional for back-compat ---
  user_id?: number;
  first_name?: string;
  last_name?: string;
  language?: string;
  avatar_url?: string;
  is_phone_verified?: boolean;
  country?: string;
  member_since?: string;
  total_bookings?: number;
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
}

export interface LoginRequest {
  phone: string;
  password: string;
}

// POST /auth/login — phone+password. No `user` object is returned; `user`
// is hydrated separately via GET /user/me. `status` is an
// opaque server-defined string (e.g. "pending_kyc"), not a client state
// machine we own.
export interface LoginResponse {
  token: string;
  token_type: string;
  user_id: string;
  user_type: string;
  status: string;
  current_step: number;
  is_onboarding_complete: boolean;
}

export type { RegisterFcmTokenPayload } from '@/core/notification/notificationTypes';

// Forgot Password (phone OTP wizard): POST /auth/forgot-password.
// Always returns 200 with the same message regardless of whether the phone
// exists (no account enumeration) — see useResetPhoneScreen.
export interface RequestPasswordResetRequest {
  phone: string;
}

// POST /auth/verify-otp (reset context) — 4-digit code.
export interface VerifyPasswordResetOtpRequest {
  phone: string;
  code: string;
  type: 'password_reset';
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

export interface LogoutRequest {
  device_token?: string;
}

// Update profile: POST /account/profile — only name + phone (email read-only).
export interface UpdateProfileRequest {
  full_name: string;
  phone: string;
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

export interface BrandStep1Response {
  token: string;
  token_type: string;
  user_id: string;
  user_type: 'brand';
  status: string;
  current_step: number;
  is_onboarding_complete: boolean;
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

// GET /onboarding/progress
export interface BrandOnboardingProgress {
  is_onboarding_complete: boolean;
  /** Opaque server account status ("active", "pending_kyc"). */
  status?: string;
  is_phone_verified: boolean;
  current_step: number;
  has_kyc_document: boolean;
  profile: {
    company_name?: string;
    phone?: string;
    email?: string;
    business_type?: string | null;
    governorate?: string | null;
    social_links?: BrandSocialLink[];
  };
}

// POST /onboarding/influencer/step-1 — email optional, no password confirmation.
export interface InfluencerStep1Request {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  governorate: string;
}

export interface InfluencerStep1Response {
  token: string;
  token_type: string;
  user_id: string;
  user_type: 'influencer';
  status: string;
  current_step: number;
  is_onboarding_complete: boolean;
}

export { FOLLOWER_TIERS } from '@/core/config';

/** Mirrors backend ServiceTypeEnum. */
export const SERVICE_TYPES = ['reels', 'story', 'post', 'visit'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface InfluencerPlatformEntry {
  platform: string;
  username: string;
  follower_tier: FollowerTierId;
}

// POST /onboarding/influencer/step-2 — replaces every platform on each call.
export interface InfluencerStep2Request {
  niches: string[];
  platforms: InfluencerPlatformEntry[];
}

export interface RateCardEntry {
  platform: string;
  service_type: ServiceType;
  /** Dollars as the API expects; built from minor units by `toPriceUsd`. */
  price_usd: number;
}

// POST /onboarding/influencer/step-3 — `is_skipped: true` completes onboarding without rates.
export type InfluencerStep3Request =
  | { is_skipped: true }
  | { is_skipped: false; rate_cards: RateCardEntry[] };

// GET /onboarding/progress for an influencer account.
export interface InfluencerOnboardingProgress {
  is_onboarding_complete: boolean;
  status?: string;
  phone?: string;
  is_phone_verified: boolean;
  current_step: number;
  has_rate_card: boolean;
  calculated_influencer_tier?: FollowerTierId | null;
  profile: {
    full_name?: string;
    governorate?: string | null;
    niches?: string[];
    platforms?: InfluencerPlatformEntry[];
    rate_cards?: RateCardEntry[];
  } | null;
}
