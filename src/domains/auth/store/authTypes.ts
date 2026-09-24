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
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

// POST /auth/register returns only the email — no token. Verify OTP to log in.
export interface RegisterResponse {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type?: string;
  abilities?: string[];
  refresh_token?: string;
}

// POST /auth/verify-otp — verifies the 5-digit email OTP and logs in
// immediately (grants free trial on first verify). Returns the same envelope
// as /auth/login.
export interface VerifyOtpRequest {
  email: string;
  otp: string;
  device_name?: string;
}

export type VerifyOtpResponse = AuthResponse;

// POST /auth/resend-otp — resends the email OTP (throttled server-side).
export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export type { RegisterFcmTokenPayload } from '@/core/notification/notificationTypes';

// Forgot Password (link-based): POST /auth/forgot-password emails a reset link.
// Always returns 200 with the same message regardless of whether the email
// exists (no account enumeration); the user completes the reset on the web.
export interface ForgotPasswordRequest {
  email: string;
}

export interface LogoutRequest {
  device_token?: string;
}

// Update profile: POST /account/profile — only name + phone (email read-only).
export interface UpdateProfileRequest {
  full_name: string;
  phone: string;
}
