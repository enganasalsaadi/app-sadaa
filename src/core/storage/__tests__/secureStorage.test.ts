import type * as KeychainNamespace from 'react-native-keychain';
import type * as StorageNamespace from '../index';
import { MMKV_IDS, StorageKeys } from '../storageKeys';

type StorageModule = typeof StorageNamespace;
type KeychainModule = typeof KeychainNamespace;

const mockGlobals = globalThis as {
  __mmkvStores?: Map<string, Map<string, unknown>>;
  __mmkvEncryption?: Map<string, string>;
  __keychain?: Map<string, string>;
};

// Shared with the jest.setup mocks, which adopt these maps when they first run.
mockGlobals.__mmkvStores ??= new Map();
mockGlobals.__mmkvEncryption ??= new Map();
mockGlobals.__keychain ??= new Map();

const disk = (id: string) => {
  const store = mockGlobals.__mmkvStores?.get(id) ?? new Map<string, unknown>();
  mockGlobals.__mmkvStores?.set(id, store);
  return store;
};
const keychainKey = () => [...(mockGlobals.__keychain?.values() ?? [])][0];
const encryptionOf = (id: string) => mockGlobals.__mmkvEncryption?.get(id);

/** Fresh module registry = a cold app start over the same disk + Keychain. */
const load = (beforeLoad?: (keychain: KeychainModule) => void): StorageModule => {
  let storage: StorageModule | undefined;
  jest.isolateModules(() => {
    beforeLoad?.(jest.requireMock<KeychainModule>('react-native-keychain'));
    storage = jest.requireActual<StorageModule>('../index');
  });
  if (!storage) throw new Error('storage module not loaded');
  return storage;
};

const launch = async (beforeLoad?: (keychain: KeychainModule) => void) => {
  const storage = load(beforeLoad);
  await storage.initSecureStorage();
  return storage;
};

describe('secure storage', () => {
  beforeEach(() => {
    mockGlobals.__mmkvStores?.clear();
    mockGlobals.__mmkvEncryption?.clear();
    mockGlobals.__keychain?.clear();
  });

  it('moves session keys out of the plain store on upgrade, keeping the session', async () => {
    disk(MMKV_IDS.APP).set(StorageKeys.USER_TOKEN, 'token');
    disk(MMKV_IDS.APP).set(StorageKeys.INFLUENCER_SOCIALS_DRAFT, '{"phone":"+963"}');
    disk(MMKV_IDS.APP).set(StorageKeys.LANGUAGE, 'ar');
    disk(MMKV_IDS.REDUX_PERSIST).set('persist:auth', '{"user":"{}"}');

    const { authStorage, appStorage } = await launch();

    expect(authStorage.getToken()).toBe('token');
    expect(appStorage.get(StorageKeys.INFLUENCER_SOCIALS_DRAFT)).toBe('{"phone":"+963"}');
    expect(disk(MMKV_IDS.APP).has(StorageKeys.USER_TOKEN)).toBe(false);
    expect(disk(MMKV_IDS.APP).has(StorageKeys.INFLUENCER_SOCIALS_DRAFT)).toBe(false);
    expect(disk(MMKV_IDS.APP).get(StorageKeys.LANGUAGE)).toBe('ar');
    expect(disk(MMKV_IDS.APP).get(StorageKeys.STORAGE_VERSION)).toBe('2');
    expect(disk(MMKV_IDS.REDUX_PERSIST).get('persist:auth')).toBe('{"user":"{}"}');
  });

  it('encrypts the secure and redux-persist stores with a 32-char Keychain key', async () => {
    await launch();
    const key = keychainKey();

    expect(key).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(encryptionOf(MMKV_IDS.SECURE)).toBe(`AES-256:${key}`);
    expect(encryptionOf(MMKV_IDS.REDUX_PERSIST)).toBe(`AES-256:${key}`);
    expect(encryptionOf(MMKV_IDS.APP)).toBeUndefined();
  });

  it('reuses the stored key on the next launch without wiping', async () => {
    const first = await launch();
    first.authStorage.saveToken('token');
    disk(MMKV_IDS.REDUX_PERSIST).set('persist:auth', '{}');
    const key = keychainKey();

    const second = await launch();

    expect(keychainKey()).toBe(key);
    expect(second.authStorage.getToken()).toBe('token');
    expect(disk(MMKV_IDS.REDUX_PERSIST).get('persist:auth')).toBe('{}');
  });

  it('wipes the encrypted stores when the Keychain key is gone', async () => {
    const first = await launch();
    first.authStorage.saveToken('token');
    first.appStorage.set(StorageKeys.THEME_MODE, 'dark');
    disk(MMKV_IDS.REDUX_PERSIST).set('persist:auth', '{}');
    mockGlobals.__keychain?.clear();

    const second = await launch();

    expect(second.authStorage.getToken()).toBeUndefined();
    expect(disk(MMKV_IDS.REDUX_PERSIST).size).toBe(0);
    expect(second.appStorage.get(StorageKeys.THEME_MODE)).toBe('dark');
  });

  it('starts logged out instead of crashing when the Keychain cannot be read', async () => {
    const first = await launch();
    first.authStorage.saveToken('token');
    const oldKey = keychainKey();

    const second = await launch(keychain => {
      jest.mocked(keychain.getGenericPassword).mockRejectedValueOnce(new Error('locked'));
    });

    expect(second.authStorage.getToken()).toBeUndefined();
    expect(keychainKey()).not.toBe(oldKey);
  });

  it('routes session keys to the encrypted store and preferences to the plain one', async () => {
    const { appStorage, authStorage } = await launch();
    authStorage.saveToken('token');
    appStorage.set(StorageKeys.PUSH_DEVICE_SYNC, '{}');
    appStorage.set(StorageKeys.THEME_MODE, 'light');

    expect(disk(MMKV_IDS.SECURE).get(StorageKeys.USER_TOKEN)).toBe('token');
    expect(disk(MMKV_IDS.SECURE).get(StorageKeys.PUSH_DEVICE_SYNC)).toBe('{}');
    expect(disk(MMKV_IDS.APP).get(StorageKeys.THEME_MODE)).toBe('light');
    expect(disk(MMKV_IDS.APP).has(StorageKeys.USER_TOKEN)).toBe(false);
  });

  it('opens the Keychain once however often init is awaited', async () => {
    let keychain: KeychainModule | undefined;
    const storage = load(mocked => {
      keychain = mocked;
    });
    await Promise.all([storage.initSecureStorage(), storage.initSecureStorage()]);

    expect(keychain?.getGenericPassword).toHaveBeenCalledTimes(1);
  });

  it('throws in dev when a session key is read before init', () => {
    const { authStorage } = load();
    expect(() => authStorage.getToken()).toThrow('initSecureStorage');
  });
});
