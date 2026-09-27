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
    clearCredentials: () => initialState,
  },
});

export const {
  setUser,
  setToken,
  syncOnboardingStep,
  phoneOtpSent,
  completeOnboarding,
  clearCredentials,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
