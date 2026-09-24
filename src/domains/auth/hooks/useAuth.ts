import { useEffect, useState, useCallback } from 'react';
import { authStorage } from '@/core/storage';
import { selectUser, selectToken, setCredentials } from '../store';
import { useAppDispatch, useAppSelector } from '@/core/store';
import {
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '../api';
import { useApi } from '@/core/hooks';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
} from '../store';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const [isInitializing, setIsInitializing] = useState(true);

  const [loginMut, loginState] = useLoginMutation();
  const [registerMut, registerState] = useRegisterMutation();
  const [verifyOtpMut, verifyOtpState] = useVerifyOtpMutation();
  const [resendOtpMut, resendOtpState] = useResendOtpMutation();
  const [logoutMut, { isLoading: isLoggingOut }] = useLogoutMutation();

  const loginApi = useApi(loginState);
  const registerApi = useApi(registerState);
  const verifyOtpApi = useApi(verifyOtpState);
  const resendOtpApi = useApi(resendOtpState);

  const { data: freshUser, refetch } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (freshUser && token) {
      dispatch(setCredentials({ user: freshUser, token }));
    }
  }, [freshUser, token, dispatch]);

  useEffect(() => {
    const init = async () => {
      const storedToken = authStorage.getToken();
      if (storedToken) {
        const result = await refetch();
        if (result.data) {
          dispatch(setCredentials({ user: result.data, token: storedToken }));
        }
      }
      setIsInitializing(false);
    };
    init();
  }, [refetch, dispatch]);

  const login = useCallback(
    (payload: LoginRequest) => loginMut(payload),
    [loginMut],
  );

  const register = useCallback(
    (payload: RegisterRequest) => registerMut(payload),
    [registerMut],
  );

  const verifyOtp = useCallback(
    (payload: VerifyOtpRequest) => verifyOtpMut(payload),
    [verifyOtpMut],
  );

  const resendOtp = useCallback(
    (payload: ResendOtpRequest) => resendOtpMut(payload),
    [resendOtpMut],
  );

  const logout = useCallback(() => logoutMut({}), [logoutMut]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isInitializing,
    isLoggingIn: loginApi.isLoading,
    isRegistering: registerApi.isLoading,
    isVerifyingOtp: verifyOtpApi.isLoading,
    isResendingOtp: resendOtpApi.isLoading,
    isLoggingOut,
    loginError: loginApi.error,
    registerError: registerApi.error,
    verifyOtpError: verifyOtpApi.error,
    resendOtpError: resendOtpApi.error,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
  };
};
