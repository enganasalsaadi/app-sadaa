import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppApiError } from '@/core/api/errorHandler';
import type { RootState } from '@/app/store/rootReducer';

export interface GlobalErrorState {
  serverError: {
    error: AppApiError | null;
    show: boolean;
    retryKey: string | null;
  };
  networkError: {
    show: boolean;
    retryKey: string | null;
  };
  forbiddenError: {
    error: AppApiError | null;
    show: boolean;
  };
}

const initialState: GlobalErrorState = {
  serverError: {
    error: null,
    show: false,
    retryKey: null,
  },
  networkError: {
    show: false,
    retryKey: null,
  },
  forbiddenError: {
    error: null,
    show: false,
  },
};

const globalErrorSlice = createSlice({
  name: 'globalError',
  initialState,
  reducers: {
    showServerError: (
      state,
      action: PayloadAction<{
        error: AppApiError;
        retryKey?: string;
      }>
    ) => {
      state.serverError.error = action.payload.error;
      state.serverError.show = true;
      state.serverError.retryKey = action.payload.retryKey ?? null;
    },
    hideServerError: state => {
      state.serverError.show = false;
      state.serverError.error = null;
      state.serverError.retryKey = null;
    },
    showNetworkError: (
      state,
      action: PayloadAction<{ retryKey?: string }>
    ) => {
      state.networkError.show = true;
      state.networkError.retryKey = action.payload.retryKey ?? null;
    },
    hideNetworkError: state => {
      state.networkError.show = false;
      state.networkError.retryKey = null;
    },
    showForbiddenError: (
      state,
      action: PayloadAction<AppApiError>
    ) => {
      state.forbiddenError.error = action.payload;
      state.forbiddenError.show = true;
    },
    hideForbiddenError: state => {
      state.forbiddenError.show = false;
      state.forbiddenError.error = null;
    },
  },
});

export const {
  showServerError,
  hideServerError,
  showNetworkError,
  hideNetworkError,
  showForbiddenError,
  hideForbiddenError,
} = globalErrorSlice.actions;

export const globalErrorReducer = globalErrorSlice.reducer;

export const selectServerError = (state: RootState) =>
  state.globalError.serverError;

export const selectNetworkError = (state: RootState) =>
  state.globalError.networkError;

export const selectForbiddenError = (state: RootState) =>
  state.globalError.forbiddenError;
