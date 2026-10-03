import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AuthState, User } from './authTypes';

const initialState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Phone login returns no `user` object — only the token + resume flags.
    // `user` is hydrated separately by GET /user/me (App.tsx).
    setToken: (
      state,
      action: PayloadAction<{
        token: string;
        userType: string;
        currentStep: number;
        isOnboardingComplete: boolean;
        phone?: string;
        /** Epoch ms of an OTP the server sent as part of this response (step-1). */
        otpSentAt?: number;
      }>,
    ) => {
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      state.currentStep = action.payload.currentStep;
      state.isOnboardingComplete = action.payload.isOnboardingComplete;
      if (action.payload.phone) state.pendingPhone = action.payload.phone;
      state.phoneOtpSentAt = action.payload.otpSentAt;
      // A suspended account can't log in (422), so a new session is active.
      state.isSuspended = false;
    },
    // Boot: the token is persisted only in the encrypted `authStorage`.
    restoreToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    // Mirrors GET /onboarding/progress; the server owns the step.
    syncOnboardingStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    phoneOtpSent: (state, action: PayloadAction<number>) => {
      state.phoneOtpSentAt = action.payload;
    },
    // Dispatched from the welcome screen, only after GET /onboarding/progress
    // confirmed `is_onboarding_complete` — flips AppStatus to AUTHENTICATED.
    completeOnboarding: state => {
      state.isOnboardingComplete = true;
      state.pendingPhone = undefined;
      state.phoneOtpSentAt = undefined;
    },
    // From any `account_suspended` 403 (baseApi), `/onboarding/progress`
    // (readable while suspended) and `/me` (403s while suspended).
    setAccountSuspended: (state, action: PayloadAction<boolean>) => {
      state.isSuspended = action.payload;
    },
    clearCredentials: () => initialState,
  },
});

export const {
  setUser,
  setToken,
  restoreToken,
  syncOnboardingStep,
  phoneOtpSent,
  completeOnboarding,
  setAccountSuspended,
  clearCredentials,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
