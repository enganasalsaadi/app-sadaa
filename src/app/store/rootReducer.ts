import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { baseApi } from '@/core/api/baseApi';
import { authPersistConfig } from './persistConfig';
import { authReducer } from '@/domains/auth';
import { globalErrorReducer } from '@/core/store';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  globalError: globalErrorReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
