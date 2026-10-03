import { createMMKV } from 'react-native-mmkv';
import { MMKV_IDS } from './storageKeys';

/** Unencrypted store: preferences read before the Keychain key is available. */
export const plainMMKV = createMMKV({ id: MMKV_IDS.APP });
