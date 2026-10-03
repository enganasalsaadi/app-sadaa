import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.getsadaapp.storage-key';
const KEYCHAIN_ACCOUNT = 'mmkv';
// AES-256 in MMKV takes a 32-byte key string.
export const STORAGE_KEY_LENGTH = 32;
// 64 symbols: `byte % 64` stays uniform (256 is a multiple of 64), 6 bits of entropy per char.
const KEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const generateKey = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(STORAGE_KEY_LENGTH));
  return Array.from(bytes, b => KEY_ALPHABET.charAt(b % KEY_ALPHABET.length)).join('');
};

export interface StorageKeyResult {
  key: string;
  /** No usable key was stored: anything encrypted earlier can't be read. */
  isNew: boolean;
}

/**
 * Reads the storage encryption key from Keychain (iOS) / Keystore (Android),
 * creating one on first launch. Never rejects: an unreadable Keychain yields
 * a fresh key, and the caller wipes what the old key protected.
 */
export const loadOrCreateStorageKey = async (): Promise<StorageKeyResult> => {
  try {
    const stored = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (stored && stored.password.length === STORAGE_KEY_LENGTH) {
      return { key: stored.password, isNew: false };
    }
  } catch {
    // Unreadable entry: replaced below.
  }

  const key = generateKey();
  try {
    await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, key, {
      service: KEYCHAIN_SERVICE,
      // Readable by background push handlers after the first unlock; never
      // synced to iCloud or restored onto another device.
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
  } catch {
    // Key lives for this launch only; the next launch starts from a clean store.
  }
  return { key, isNew: true };
};
