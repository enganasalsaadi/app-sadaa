import { Linking, Platform } from 'react-native';
import { getBundleId } from 'react-native-device-info';
import { env } from './env';

/** Public Play Store listing (`com.getsadaapp`). */
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.getsadaapp';

// URLs are built locally (never from server/user input), so they are safe to open directly (rule 07).
const storeUrls = (): string[] => {
  if (Platform.OS === 'android') {
    const id = getBundleId();
    // Web fallback for devices without the Play Store app.
    return [`market://details?id=${id}`, PLAY_STORE_URL];
  }
  // No id before first release → open the App Store app itself.
  return env.IOS_APP_STORE_ID
    ? [`itms-apps://apps.apple.com/app/id${env.IOS_APP_STORE_ID}`, `https://apps.apple.com/app/id${env.IOS_APP_STORE_ID}`]
    : ['itms-apps://apps.apple.com'];
};

/** Opens this app's store page; tries each URL until one succeeds. */
export const openAppStore = async (): Promise<void> => {
  for (const url of storeUrls()) {
    try {
      await Linking.openURL(url);
      return;
    } catch {
      // try the next URL
    }
  }
};
