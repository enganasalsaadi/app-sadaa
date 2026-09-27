import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AuthState, User } from './authTypes';

const initialState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Phone login returns no `user` object — only the token + resume flags.
    // `user` is hydrated separately by GET /auth/me (see useAuth).
    setToken: (
      state,
      action: PayloadAction<{
        token: string;
        userType: string;
        currentStep: number;
        isOnboardingComplete: boolean;
      }>,
    ) => {
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      state.currentStep = action.payload.currentStep;
      state.isOnboardingComplete = action.payload.isOnboardingComplete;
    },
    clearCredentials: () => initialState,
  },
});

export const { setCredentials, setUser, setToken, clearCredentials } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
