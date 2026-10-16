import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { baseApi } from '@/core/api/baseApi';
import { authPersistConfig } from './persistConfig';
import { authReducer } from '@/domains/auth';
import { globalErrorReducer } from '@/core/store';
import { campaignFlagReducer } from '@/domains/marketplace';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  globalError: globalErrorReducer,
  campaignFlag: campaignFlagReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
