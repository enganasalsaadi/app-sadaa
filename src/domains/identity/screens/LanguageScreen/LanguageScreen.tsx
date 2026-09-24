import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RNRestart from 'react-native-restart';
import { Check } from 'lucide-react-native';
import { useTheme, useStyles, moderateScale } from '@/core/theme';
import { Layout } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { Pressable } from '@/shared/ui/primitives/Pressable';
import { useUpdatePreferencesMutation } from '../../api/accountApi';
import { appStorage, StorageKeys } from '@/core/storage';
import { toastService } from '@/core/toast';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
];

const LanguageScreenComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(({ colors: c, borderWidths }) => ({
    divider: {
      borderBottomWidth: borderWidths.thin,
      borderBottomColor: c.border.default,
    },
  }));
  const [updatePreferences] = useUpdatePreferencesMutation();
  useHideBottomBar();

  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const handleSelect = useCallback(
    async (code: string) => {
      if (code === currentLang) return;
      try {
        appStorage.set(StorageKeys.LANGUAGE, code);
        await updatePreferences({ language: code });
        toastService.success(t('account.language.saveSuccess'));
      } catch {
        // continue with restart even if API fails
      }
      setTimeout(() => {
        RNRestart.restart();
      }, 500);
    },
    [currentLang, updatePreferences, t],
  );

  return (
    <Layout
      withGradient={false}
      withScroll
      contentPadding={false}
      screenHeader={{
        title: t('account.language.title'),
        fillStatusBar: true,
      }}
    >
      <Box px="2xl" pt="lg">
        <Box
          borderRadius="lg"
          bg={colors.surface.main}
          borderWidth="thin"
          borderColor={colors.border.default}
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = lang.code === currentLang;
            const isLast = index === LANGUAGES.length - 1;
            return (
              <Pressable
                key={lang.code}
                onPress={() => handleSelect(lang.code)}
                row
                align="center"
                px="lg"
                py="md"
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={lang.nativeLabel}
                style={isLast ? undefined : styles.divider}
              >
                <Box flex={1}>
                  <Text
                    variant="body"
                    color={
                      isSelected ? colors.interactive.text : colors.text.primary
                    }
                  >
                    {lang.nativeLabel}
                  </Text>
                  <Text variant="caption" color={colors.text.tertiary}>
                    {lang.label}
                  </Text>
                </Box>
                {isSelected && (
                  <Check
                    size={moderateScale(18)}
                    color={colors.interactive.main}
                  />
                )}
              </Pressable>
            );
          })}
        </Box>
      </Box>
    </Layout>
  );
};

export const LanguageScreen = memo(LanguageScreenComponent);
