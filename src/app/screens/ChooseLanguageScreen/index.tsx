import React from 'react';
import {
  Box,
  Text,
  CustomButton,
  Layout,
  AnimatedIconHero,
} from '@/shared/ui';
import { LanguageOptionRow } from './components';
import { useChooseLanguageScreen } from './hooks';
import { Earth } from 'lucide-react-native';
import { useTheme } from '@/core/theme';

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
  return (
    <Layout withScroll>
      <Box flex={1} pt="5xl" align="center" justify="center">
        <AnimatedIconHero
          icon={<Earth size={50} color={colors.text.onBrand} strokeWidth={1.5} />}
        />
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
