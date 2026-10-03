import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/api';
import { authStorage } from '@/core/storage';
import { authReducer, setToken } from '../../store';
import { socialsDraftStorage } from '../../utils/socialsDraft';
import { authApi } from '../authApi';

// authApi reads the FCM token for logout; the native push stack has no jest build.
jest.mock('@/core/notification', () => ({
  notificationManager: { getSavedToken: () => null },
}));

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const respond = (status: number, body: object) =>
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

const signIn = (store: ReturnType<typeof makeStore>) =>
  store.dispatch(
    setToken({
      token: 'token',
      userType: 'brand',
      currentStep: 2,
      isOnboardingComplete: false,
      phone: '+963944123456',
    }),
  );

describe('authApi.deleteAccount', () => {
  let clearSession: jest.SpyInstance;
  let clearDraft: jest.SpyInstance;

  beforeEach(() => {
    // Request timeouts and cache timers would outlive the test; promises stay real.
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
    clearSession = jest.spyOn(authStorage, 'clearSession').mockResolvedValue();
    clearDraft = jest.spyOn(socialsDraftStorage, 'clear').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sends the current password to DELETE /auth/account', async () => {
    const fetchSpy = respond(200, { success: true, message: 'ok', data: null });
    const store = makeStore();
    await store.dispatch(authApi.endpoints.deleteAccount.initiate({ current_password: 'secret' }));

    const request = fetchSpy.mock.calls[0]?.[0] as Request;
    expect(request.method).toBe('DELETE');
    expect(request.url).toMatch(/\/auth\/account$/);
    expect(await request.json()).toEqual({ current_password: 'secret' });
  });

  it('tears the local session down after a successful delete', async () => {
    respond(200, { success: true, message: 'ok', data: null });
    const store = makeStore();
    signIn(store);

    await store.dispatch(authApi.endpoints.deleteAccount.initiate({ current_password: 'secret' }));

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(store.getState().auth.token).toBeNull();
  });

  it('keeps the session when the password is wrong', async () => {
    respond(422, {
      success: false,
      message: 'The given data was invalid.',
      data: null,
      error_code: 'validation_failed',
      errors: { current_password: ['The password is incorrect.'] },
    });
    const store = makeStore();
    signIn(store);

    const result = await store.dispatch(
      authApi.endpoints.deleteAccount.initiate({ current_password: 'wrong' }),
    );

    expect('error' in result).toBe(true);
    expect(clearSession).not.toHaveBeenCalled();
    expect(clearDraft).not.toHaveBeenCalled();
    expect(store.getState().auth.token).toBe('token');
  });
});
