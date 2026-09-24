import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Layout, CustomButton } from '@/shared/ui';
// Deep import intentional: this previews the *dark* token set regardless of the
// active app theme, without calling `setThemeMode('dark')` globally (rule 08 —
// "do NOT hack global theme state for a single screen"). No barrel exports
// `darkColors`, so this is not a rule-05 barrel violation.
import { darkColors } from '@/core/theme/tokens/colors';
import { goBack } from '@/core/navigation';

/**
 * Layout gallery variant: a forced preview of dark-mode color tokens, useful
 * for reviewing dark surfaces without switching the whole app's theme.
 */
const LayoutDarkForcedScreenComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout withScroll bg={darkColors.layout.base} contentBg={darkColors.layout.base}>
      <Box gap="lg">
        <CustomButton
          title={t('common.back')}
          onPress={goBack}
          variant="outline"
          size="sm"
        />
        <Box
          p="lg"
          borderRadius="lg"
          bg={darkColors.surface.main}
          borderWidth="thin"
          borderColor={darkColors.border.default}
          gap="sm"
        >
          <Text variant="h4" color={darkColors.text.primary}>
            {t('devShowcase.layoutGallery.darkForcedTitle')}
          </Text>
          <Text variant="body" color={darkColors.text.secondary}>
            {t('devShowcase.layoutGallery.darkForcedDescription')}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};

export const LayoutDarkForcedScreen = memo(LayoutDarkForcedScreenComponent);
