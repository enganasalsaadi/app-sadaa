import { Linking, Platform } from 'react-native';
import { getBundleId } from 'react-native-device-info';

/** Public Play Store listing (`com.getsadaapp`). */
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.getsadaapp';
/** Public App Store listing (id 6825926070). */
const APP_STORE_ID = '6825926070';
const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

// URLs are built locally (never from server/user input), so they are safe to open directly (rule 07).
const storeUrls = (): string[] => {
  if (Platform.OS === 'android') {
    const id = getBundleId();
    // Web fallback for devices without the Play Store app.
    return [`market://details?id=${id}`, PLAY_STORE_URL];
  }
  return [`itms-apps://apps.apple.com/app/id${APP_STORE_ID}`, APP_STORE_URL];
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
