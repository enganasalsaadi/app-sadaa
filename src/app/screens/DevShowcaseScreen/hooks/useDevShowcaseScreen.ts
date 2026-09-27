import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import type { DevShowcaseCategoryId } from '@/core/navigation';
import { useShowcaseNavigation } from './useShowcaseNavigation';

/** Catalog screen: theme/direction controls + one row per category. */
export const useDevShowcaseScreen = () => {
  const { i18n } = useTranslation();
  const { mode, isRTL, setThemeMode, toggleTheme } = useTheme();
  const navigation = useShowcaseNavigation();

  const openCategory = useCallback(
    (category: DevShowcaseCategoryId) =>
      navigation.navigate('DevShowcaseCategory', { category }),
    [navigation],
  );

  return {
    themeMode: mode,
    isRTL,
    language: i18n.language,
    toggleTheme,
    setThemeMode,
    openCategory,
  };
};
