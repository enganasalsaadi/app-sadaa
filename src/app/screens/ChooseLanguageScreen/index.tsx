import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, CustomButton, Layout } from '@/shared/ui';
import { LanguageOptionRow } from './components';
import { useChooseLanguageScreen } from './hooks';
import { Earth } from 'lucide-react-native';
import { iconStroke, useTheme, moderateScale } from '@/core/theme';

/** Hero globe badge; no size token this large. */
const HERO_BADGE_SIZE = moderateScale(112);
const HERO_ICON_SIZE = moderateScale(60);

export const ChooseLanguageScreen: React.FC = () => {
  const {
    selected,
    selectLanguage,
    handleNext,
    languageOptions,
    headingTitle,
    nextButtonTitle,
    nextButtonHint,
  } = useChooseLanguageScreen();
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Layout>
      <Box flex={1} pt="5xl" align="center" justify="center">
        <Box
          width={HERO_BADGE_SIZE}
          height={HERO_BADGE_SIZE}
          borderRadius="full"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
          accessibilityRole="image"
          accessibilityLabel={t('chooseLanguage.heroA11y')}
        >
          <Earth size={HERO_ICON_SIZE} color={colors.interactive.main} strokeWidth={iconStroke.thin} />
        </Box>
      </Box>

      <>
        <Box mt="3xl" align="center">
          <Text variant="h3" accessibilityRole="header">
            {headingTitle}
          </Text>
        </Box>

        <Box mb="2xl" mt="2xl" gap="md" accessibilityRole="radiogroup">
          {languageOptions.map(language => (
            <LanguageOptionRow
              key={language.id}
              id={language.id}
              align={language.align}
              isSelected={selected === language.id}
              onSelect={selectLanguage}
            />
          ))}
        </Box>
        <CustomButton
          title={nextButtonTitle}
          onPress={handleNext}
          accessibilityHint={nextButtonHint}
        />
      </>
    </Layout>
  );
};
