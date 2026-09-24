import { useCallback, useMemo, useState } from 'react';
import i18n from '@/core/i18n';
import { useTheme } from '@/core/theme/hooks/useTheme';
import { appStorage, StorageKeys } from '@/core/storage';
import { getValidLanguage } from '@/core/i18n';
import type { SupportedLanguage } from '@/core/config';
import { LANGUAGE_OPTIONS } from '../data';

export const useChooseLanguageScreen = () => {
  const { changeLanguage } = useTheme();

  const [selected, setSelected] = useState<SupportedLanguage>(() =>
    getValidLanguage(appStorage.get(StorageKeys.LANGUAGE)),
  );

  const { headingTitle, nextButtonTitle, nextButtonHint } = useMemo(() => {
    const previewT = i18n.getFixedT(selected, 'common');
    return {
      headingTitle: previewT('chooseLanguage.title'),
      nextButtonTitle: previewT('common.next'),
      nextButtonHint: previewT('chooseLanguage.nextHint'),
    };
  }, [selected]);

  const handleNext = useCallback(async () => {
    appStorage.set(StorageKeys.HAS_CHOSEN_LANGUAGE, 'true');
    await changeLanguage(selected);
  }, [changeLanguage, selected]);

  const selectLanguage = useCallback((id: SupportedLanguage) => {
    setSelected(id);
  }, []);

  return {
    selected,
    selectLanguage,
    handleNext,
    languageOptions: LANGUAGE_OPTIONS,
    headingTitle,
    nextButtonTitle,
    nextButtonHint,
  };
};
