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
    clearCredentials: () => initialState,
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
