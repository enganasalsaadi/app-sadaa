// In-memory MMKV so storage-dependent modules load without the native (Nitro) module.
// Stores are keyed by id on globalThis, like native instances, so they survive
// `jest.isolateModules` (a simulated relaunch).
type MockMMKVValue = string | number | boolean;
type MockMMKVConfig = { id: string; encryptionKey?: string; encryptionType?: string };

jest.mock('react-native-mmkv', () => {
  const registry = globalThis as {
    __mmkvStores?: Map<string, Map<string, MockMMKVValue>>;
    __mmkvEncryption?: Map<string, string>;
  };
  registry.__mmkvStores ??= new Map();
  registry.__mmkvEncryption ??= new Map();
  const stores = registry.__mmkvStores;
  const encryption = registry.__mmkvEncryption;
  const createMMKV = ({ id, encryptionKey, encryptionType }: MockMMKVConfig) => {
    const store = stores.get(id) ?? new Map<string, MockMMKVValue>();
    stores.set(id, store);
    if (encryptionKey) encryption.set(id, `${encryptionType}:${encryptionKey}`);
    return {
      getString: (k: string) => store.get(k) as string | undefined,
      getNumber: (k: string) => store.get(k) as number | undefined,
      getBoolean: (k: string) => store.get(k) as boolean | undefined,
      set: (k: string, v: MockMMKVValue) => {
        store.set(k, v);
      },
      remove: (k: string) => store.delete(k),
      contains: (k: string) => store.has(k),
      getAllKeys: () => [...store.keys()],
      clearAll: () => store.clear(),
      encrypt: (key: string, type: string) => {
        encryption.set(id, `${type}:${key}`);
      },
    };
  };
  return { createMMKV };
});

// Node ships WebCrypto; the polyfill only installs it on Hermes.
jest.mock('react-native-get-random-values', () => ({}));

jest.mock('react-native-keychain', () => {
  const registry = globalThis as { __keychain?: Map<string, string> };
  registry.__keychain ??= new Map();
  const keychain = registry.__keychain;
  return {
    ACCESSIBLE: { AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly' },
    STORAGE_TYPE: { AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth' },
    getGenericPassword: jest.fn(async ({ service }: { service: string }) => {
      const password = keychain.get(service);
      return password === undefined ? false : { username: 'mmkv', password, service };
    }),
    setGenericPassword: jest.fn(
      async (_username: string, password: string, { service }: { service: string }) => {
        keychain.set(service, password);
        return { service, storage: 'KeystoreAESGCM_NoAuth' };
      },
    ),
  };
});

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

// Its NativeEventEmitter needs the native module at import time.
jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBundleId: () => 'com.getsadaapp',
}));
