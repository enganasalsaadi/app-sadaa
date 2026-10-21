import { getCountry } from 'react-native-localize';

/**
 * The region chosen in the phone's settings (ISO 3166 alpha-2), or `null`.
 * Needs no permission and no network: it only pre-selects a dial code, nothing else branches on it.
 */
export const getDeviceRegion = (): string | null => {
  try {
    const region = getCountry();
    return /^[A-Z]{2}$/.test(region) ? region : null;
  } catch {
    return null;
  }
};
