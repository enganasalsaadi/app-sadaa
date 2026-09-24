import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CountryCode } from 'libphonenumber-js';
import { useTheme } from '@/core/theme';
import type { ThemeMode } from '@/core/theme';
import { navigate } from '@/core/navigation';
import type { DevShowcaseStackParamList } from '@/core/navigation';
import { useToast } from '@/core/toast';

export type LayoutVariantScreenName = Exclude<
  keyof DevShowcaseStackParamList,
  'DevShowcase'
>;

/** Dev-only mock status labels — not the real `DealStatus` (see rule 06; that state machine isn't built yet). */
export const MOCK_STATUS_KEYS = [
  'draft',
  'pending',
  'active',
  'completed',
  'disputed',
] as const;
export type MockStatusKey = (typeof MOCK_STATUS_KEYS)[number];

/**
 * All state + handlers for the dev-only Design System Showcase screen.
 * Rule 05: screen logic lives here, `DevShowcaseScreen.tsx` only renders.
 */
export const useDevShowcaseScreen = () => {
  const { t, i18n } = useTranslation();
  const { mode, isDark, isRTL, setThemeMode, toggleTheme } = useTheme();
  const toast = useToast();

  const [cardSelected, setCardSelected] = useState(false);
  const [defaultInputValue, setDefaultInputValue] = useState('');
  const [focusInputValue, setFocusInputValue] = useState('');
  const [errorInputValue, setErrorInputValue] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('SY');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [selectionValue, setSelectionValue] = useState<string | number | null>(
    null,
  );

  const toggleCardSelected = useCallback(() => {
    setCardSelected(prev => !prev);
  }, []);

  const openBottomSheet = useCallback(() => setBottomSheetVisible(true), []);
  const closeBottomSheet = useCallback(() => setBottomSheetVisible(false), []);

  const openSelectionModal = useCallback(
    () => setSelectionModalVisible(true),
    [],
  );
  const closeSelectionModal = useCallback(
    () => setSelectionModalVisible(false),
    [],
  );
  const confirmSelection = useCallback((value: string | number) => {
    setSelectionValue(value);
  }, []);

  const showSuccessToast = useCallback(() => {
    toast.success(t('devShowcase.modalsToasts.toastSuccessMessage'));
  }, [t, toast]);
  const showErrorToast = useCallback(() => {
    toast.error(t('devShowcase.modalsToasts.toastErrorMessage'));
  }, [t, toast]);
  const showWarningToast = useCallback(() => {
    toast.warning(t('devShowcase.modalsToasts.toastWarningMessage'));
  }, [t, toast]);
  const showInfoToast = useCallback(() => {
    toast.info(t('devShowcase.modalsToasts.toastInfoMessage'));
  }, [t, toast]);

  const handleSetThemeMode = useCallback(
    (nextMode: ThemeMode) => {
      setThemeMode(nextMode);
    },
    [setThemeMode],
  );

  const navigateToLayoutVariant = useCallback(
    (screen: LayoutVariantScreenName) => {
      navigate(screen);
    },
    [],
  );

  const selectionItems = useMemo(
    () => [
      {
        label: t('devShowcase.modalsToasts.selectionOption1'),
        value: 'option1',
      },
      {
        label: t('devShowcase.modalsToasts.selectionOption2'),
        value: 'option2',
      },
      {
        label: t('devShowcase.modalsToasts.selectionOption3'),
        value: 'option3',
      },
    ],
    [t],
  );

  return {
    // top control bar
    themeMode: mode,
    isDark,
    isRTL,
    language: i18n.language,
    toggleTheme,
    setThemeMode: handleSetThemeMode,

    // cards
    cardSelected,
    toggleCardSelected,

    // inputs
    defaultInputValue,
    setDefaultInputValue,
    focusInputValue,
    setFocusInputValue,
    errorInputValue,
    setErrorInputValue,
    searchInputValue,
    setSearchInputValue,
    phoneValue,
    setPhoneValue,
    phoneCountry,
    setPhoneCountry,

    // modals & toasts
    bottomSheetVisible,
    openBottomSheet,
    closeBottomSheet,
    selectionModalVisible,
    openSelectionModal,
    closeSelectionModal,
    selectionValue,
    confirmSelection,
    selectionItems,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,

    // layout gallery
    navigateToLayoutVariant,
  };
};
