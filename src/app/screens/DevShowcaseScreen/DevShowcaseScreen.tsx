import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, BottomSheet, SelectionModal, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import {
  TopControlBar,
  TypographySection,
  ColorSection,
  ButtonsSection,
  InputsSection,
  CardsSection,
  ModalsToastsSection,
  LayoutGallerySection,
} from './components';
import { useDevShowcaseScreen } from './hooks';

/**
 * Dev-only living UI-kit playground. Not a product screen — see
 * `src/app/screens/DevShowcaseScreen` placement in CLAUDE.md. Reachable only
 * from the Profile screen's `__DEV__`-gated row.
 */
const DevShowcaseScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    themeMode,
    isRTL,
    language,
    toggleTheme,
    setThemeMode,
    cardSelected,
    toggleCardSelected,
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
    navigateToLayoutVariant,
  } = useDevShowcaseScreen();

  return (
    <>
      <Layout
        withScroll
        screenHeader={{ title: t('devShowcase.title'), fillStatusBar: true }}
        edges={['left', 'right']}
      >
        <Box gap="xl">
          <TopControlBar
            themeMode={themeMode}
            isRTL={isRTL}
            language={language}
            onToggleTheme={toggleTheme}
            onSetThemeMode={setThemeMode}
          />

          <TypographySection />

          <ColorSection />

          <ButtonsSection />

          <InputsSection
            defaultValue={defaultInputValue}
            onChangeDefault={setDefaultInputValue}
            focusValue={focusInputValue}
            onChangeFocus={setFocusInputValue}
            errorValue={errorInputValue}
            onChangeError={setErrorInputValue}
            searchValue={searchInputValue}
            onChangeSearch={setSearchInputValue}
            phoneValue={phoneValue}
            onChangePhone={setPhoneValue}
            phoneCountry={phoneCountry}
            onChangePhoneCountry={setPhoneCountry}
          />

          <CardsSection
            cardSelected={cardSelected}
            onToggleSelected={toggleCardSelected}
          />

          <ModalsToastsSection
            onSuccessToast={showSuccessToast}
            onErrorToast={showErrorToast}
            onWarningToast={showWarningToast}
            onInfoToast={showInfoToast}
            onOpenBottomSheet={openBottomSheet}
            onOpenSelectionModal={openSelectionModal}
          />

          <LayoutGallerySection onNavigate={navigateToLayoutVariant} />
        </Box>
      </Layout>

      <BottomSheet visible={bottomSheetVisible} onClose={closeBottomSheet}>
        <Box px="2xl" pt="lg" pb="3xl" align="center">
          <Text variant="h4" color={colors.text.primary} mb="sm" align="center">
            {t('devShowcase.modalsToasts.sheetTitle')}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            mb="2xl"
            align="center"
          >
            {t('devShowcase.modalsToasts.sheetBody')}
          </Text>
          <CustomButton
            title={t('devShowcase.modalsToasts.sheetConfirm')}
            onPress={closeBottomSheet}
            fullWidth
          />
        </Box>
      </BottomSheet>

      <SelectionModal
        visible={selectionModalVisible}
        onClose={closeSelectionModal}
        title={t('devShowcase.modalsToasts.selectionTitle')}
        items={selectionItems}
        mode="single"
        selected={selectionValue}
        onConfirm={confirmSelection}
      />
    </>
  );
};

export const DevShowcaseScreen = memo(DevShowcaseScreenComponent);
