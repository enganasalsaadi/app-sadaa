import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Dimensions, I18nManager, useColorScheme } from 'react-native';
import i18n from '@/core/i18n';
import { isRTL as isRTLLanguage, syncRTL } from '@/core/i18n';
import RNRestart from 'react-native-restart';
import { appStorage, StorageKeys } from '@/core/storage';
import { getValidLanguage } from '@/core/i18n';
import { createSpacing } from '../tokens/spacing';
import { createTypography } from '../tokens/typography';
import { createColors } from '../tokens/colors';
import { createRadii } from '../tokens/radii';
import { createSizes } from '../tokens/sizes';
import { createShadows } from '../tokens/shadows';
import { createBorderWidths } from '../tokens/borderWidths';
import { createZIndices } from '../tokens/zIndices';
import {
  getScreenCategory,
  isTablet as checkIsTablet,
  isLandscape as checkIsLandscape,
  screenWidth,
  screenHeight,
} from '../utils/responsive';
import type { Theme, ThemeContextValue, ThemeMode } from '../types';

const getStoredThemeMode = (): ThemeMode => {
  const stored = appStorage.get(StorageKeys.THEME_MODE);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

const getStoredLanguage = (): string => {
  return getValidLanguage(appStorage.get(StorageKeys.LANGUAGE));
};

const buildTheme = (
  isDark: boolean,
  mode: ThemeMode,
  language: string,
  dimensions: { width: number; height: number },
): Theme => {
  const rtl = isRTLLanguage(language);
  return {
    mode,
    isDark,
    language,
    isRTL: rtl,
    colors: createColors(isDark),
    spacing: createSpacing(),
    typography: createTypography(rtl),
    radii: createRadii(),
    shadows: createShadows(isDark),
    borderWidths: createBorderWidths(),
    zIndices: createZIndices(),
    sizes: createSizes(),
    screen: {
      category: getScreenCategory(),
      isTablet: checkIsTablet(),
      isLandscape: checkIsLandscape(),
      width: dimensions.width,
      height: dimensions.height,
    },
  };
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] =
    useState<ThemeMode>(getStoredThemeMode);
  const [language, setLanguage] = useState<string>(getStoredLanguage);

  const [screenDimensions, setScreenDimensions] = useState(() => ({
    width: screenWidth(),
    height: screenHeight(),
  }));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setScreenDimensions({
        width: screenWidth(),
        height: screenHeight(),
      });
    });

    return () => subscription.remove();
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    appStorage.set(StorageKeys.THEME_MODE, mode as string);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  const changeLanguage = useCallback(async (lang: string) => {
    const validated = getValidLanguage(lang);
    const nextRTL = isRTLLanguage(validated);

    await i18n.changeLanguage(validated);
    appStorage.set(StorageKeys.LANGUAGE, validated);
    appStorage.set(StorageKeys.HAS_CHOSEN_LANGUAGE, 'true');
    setLanguage(validated);

    if (I18nManager.isRTL !== nextRTL) {
      syncRTL(validated);
    }
    setTimeout(() => {
      RNRestart.restart();
    }, 1000);
  }, []);

  const theme = useMemo(
    () => buildTheme(isDark, themeMode, language, screenDimensions),
    [isDark, themeMode, language, screenDimensions],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      setThemeMode,
      toggleTheme,
      changeLanguage,
    }),
    [theme, setThemeMode, toggleTheme, changeLanguage],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
