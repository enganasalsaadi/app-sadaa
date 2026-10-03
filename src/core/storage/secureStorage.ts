import type { MMKV } from 'react-native-mmkv';
import { createMMKV } from 'react-native-mmkv';
import { plainMMKV } from './plainMMKV';
import { loadOrCreateStorageKey } from './secureKey';
import { MMKV_IDS, SECURE_STORAGE_KEYS, StorageKeys } from './storageKeys';

const ENCRYPTION_TYPE = 'AES-256';
const CURRENT_STORAGE_VERSION = '2';

interface SecureStores {
  secure: MMKV;
  reduxPersist: MMKV;
}

let stores: SecureStores | null = null;
let ready: Promise<void> | null = null;

const openEncrypted = (id: string, key: string) =>
  createMMKV({ id, encryptionKey: key, encryptionType: ENCRYPTION_TYPE });

const openStores = async (): Promise<void> => {
  const { key, isNew } = await loadOrCreateStorageKey();
  const secure = openEncrypted(MMKV_IDS.SECURE, key);

  if (plainMMKV.getString(StorageKeys.STORAGE_VERSION) === CURRENT_STORAGE_VERSION) {
    const reduxPersist = openEncrypted(MMKV_IDS.REDUX_PERSIST, key);
    if (isNew) {
      // The key that encrypted these is gone: drop the unreadable session.
      secure.clearAll();
      reduxPersist.clearAll();
    }
    stores = { secure, reduxPersist };
    return;
  }

  // One-time upgrade from the unencrypted layout. Copy before encrypting and
  // delete the plain copies last, so an interrupted run never loses the session.
  for (const storageKey of SECURE_STORAGE_KEYS) {
    const value = plainMMKV.getString(storageKey);
    if (value !== undefined) secure.set(storageKey, value);
  }
  const reduxPersist = createMMKV({ id: MMKV_IDS.REDUX_PERSIST });
  reduxPersist.encrypt(key, ENCRYPTION_TYPE);
  plainMMKV.set(StorageKeys.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
  for (const storageKey of SECURE_STORAGE_KEYS) {
    plainMMKV.remove(storageKey);
  }
  stores = { secure, reduxPersist };
};

/**
 * Loads the Keychain key and opens the encrypted stores. Idempotent: boot and
 * redux-persist share one run. Secure keys are readable synchronously after it.
 */
export const initSecureStorage = (): Promise<void> => {
  ready ??= openStores();
  return ready;
};

const requireStores = (): SecureStores | null => {
  if (!stores && __DEV__) {
    throw new Error('Secure storage used before initSecureStorage() resolved');
  }
  return stores;
};

/** `null` only in release if read before boot: treated as an empty store. */
export const getSecureMMKV = (): MMKV | null => requireStores()?.secure ?? null;

export const getReduxPersistMMKV = async (): Promise<MMKV> => {
  await initSecureStorage();
  const opened = requireStores();
  if (!opened) {
    throw new Error('Secure storage failed to open');
  }
  return opened.reduxPersist;
};
