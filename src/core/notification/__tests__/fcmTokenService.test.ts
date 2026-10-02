import { appStorage, authStorage, StorageKeys } from '@/core/storage';
import { syncDeviceRegistration } from '../fcmTokenService';

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getUniqueId: () => Promise.resolve('device-1'),
}));

describe('syncDeviceRegistration', () => {
  beforeEach(async () => {
    await authStorage.clearSession();
    appStorage.set(StorageKeys.LANGUAGE, 'ar');
    authStorage.saveToken('session-1');
  });

  it('registers once per token, language and app version', async () => {
    const register = jest.fn(() => Promise.resolve());
    await syncDeviceRegistration('tok-1', register);
    await syncDeviceRegistration('tok-1', register);

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({
      token: 'tok-1',
      platform: expect.stringMatching(/^(ios|android)$/),
      device_id: 'device-1',
      app_version: '1.0.0',
    });
  });

  it('registers again after a language change', async () => {
    const register = jest.fn(() => Promise.resolve());
    await syncDeviceRegistration('tok-1', register);
    appStorage.set(StorageKeys.LANGUAGE, 'en');
    await syncDeviceRegistration('tok-1', register);

    expect(register).toHaveBeenCalledTimes(2);
  });

  it('sends one request when two triggers race', async () => {
    const register = jest.fn(() => Promise.resolve());
    await Promise.all([
      syncDeviceRegistration('tok-1', register),
      syncDeviceRegistration('tok-1', register),
    ]);

    expect(register).toHaveBeenCalledTimes(1);
  });

  it('retries after a failure', async () => {
    const register = jest
      .fn<Promise<void>, []>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    await syncDeviceRegistration('tok-1', register);
    await syncDeviceRegistration('tok-1', register);

    expect(register).toHaveBeenCalledTimes(2);
  });

  it('does nothing while signed out', async () => {
    await authStorage.clearSession();
    const register = jest.fn(() => Promise.resolve());
    await syncDeviceRegistration('tok-1', register);

    expect(register).not.toHaveBeenCalled();
  });

  it('re-registers in the next session after a logout', async () => {
    const register = jest.fn(() => Promise.resolve());
    await syncDeviceRegistration('tok-1', register);
    await authStorage.clearSession();
    authStorage.saveToken('session-2');
    await syncDeviceRegistration('tok-1', register);

    expect(register).toHaveBeenCalledTimes(2);
  });

  it('keeps no marker when the session ended mid-request', async () => {
    const register = jest.fn(async () => {
      await authStorage.clearSession();
    });
    await syncDeviceRegistration('tok-1', register);

    expect(appStorage.get(StorageKeys.PUSH_DEVICE_SYNC)).toBeUndefined();
  });
});
