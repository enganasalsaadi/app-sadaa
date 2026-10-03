import type { AuthState } from '../authTypes';
import {
  authReducer,
  clearCredentials,
  restoreToken,
  setAccountSuspended,
  setToken,
} from '../authSlice';

const SESSION: AuthState = { user: null, token: 'token' };

describe('authSlice suspension', () => {
  it('handles the action baseApi dispatches on account_suspended', () => {
    const action = { type: 'auth/setAccountSuspended', payload: true };
    expect(action.type).toBe(setAccountSuspended.type);
    expect(authReducer(SESSION, action).isSuspended).toBe(true);
  });

  it('follows the server status and resets on a new session or logout', () => {
    const suspended = authReducer(SESSION, setAccountSuspended(true));
    expect(authReducer(suspended, setAccountSuspended(false)).isSuspended).toBe(false);
    expect(
      authReducer(
        suspended,
        setToken({ token: 't2', userType: 'brand', currentStep: 2, isOnboardingComplete: false }),
      ).isSuspended,
    ).toBe(false);
    expect(authReducer(suspended, clearCredentials()).isSuspended).toBeUndefined();
  });
});

describe('authSlice restoreToken', () => {
  it('restores the session token read from secure storage at boot', () => {
    const empty: AuthState = { user: null, token: null };
    expect(authReducer(empty, restoreToken('token')).token).toBe('token');
    expect(authReducer(SESSION, restoreToken(null)).token).toBeNull();
  });
});
