import { useState, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { usePermission } from './usePermission';

export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type UseLocationReturn = {
  location: GeoLocation | null;
  isGettingLocation: boolean;
  locationError: string | null;
  hasPermission: boolean;
  needsToAsk: boolean;
  needsToOpenSettings: boolean;
  openSettings: () => void;
  requestAndGetLocation: () => Promise<GeoLocation | null>;
};

export const useLocation = (): UseLocationReturn => {
  const {
    hasPermission,
    askPermission,
    needsToAsk,
    needsToOpenSettings,
    openSettings,
  } = usePermission('location');

  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<GeoLocation | null> => {
    return new Promise(resolve => {
      setIsGettingLocation(true);
      setLocationError(null);
      Geolocation.getCurrentPosition(
        pos => {
          const loc: GeoLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(loc);
          setIsGettingLocation(false);
          resolve(loc);
        },
        err => {
          setLocationError(err.message);
          setIsGettingLocation(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  }, []);

  const requestAndGetLocation = useCallback(async (): Promise<GeoLocation | null> => {
    if (hasPermission) {
      return getCurrentLocation();
    }
    if (needsToAsk) {
      const result = await askPermission();
      if (result.isGranted) {
        return getCurrentLocation();
      }
      setLocationError('denied');
      return null;
    }
    if (needsToOpenSettings) {
      openSettings();
      return null;
    }
    return null;
  }, [
    hasPermission,
    needsToAsk,
    needsToOpenSettings,
    askPermission,
    openSettings,
    getCurrentLocation,
  ]);

  return {
    location,
    isGettingLocation,
    locationError,
    hasPermission,
    needsToAsk,
    needsToOpenSettings,
    openSettings,
    requestAndGetLocation,
  };
};
