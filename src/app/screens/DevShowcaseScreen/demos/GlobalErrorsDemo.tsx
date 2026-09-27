import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useGlobalErrorsDemo } from './hooks/useGlobalErrorsDemo';

/** `GlobalErrorModal` and `NetworkSnackbar` are mounted once in App.tsx; this only feeds them state. */
const GlobalErrorsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { showServer500, showServer503, showOffline, hideOffline } =
    useGlobalErrorsDemo();

  return (
    <Box gap="md">
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t('devShowcase.globalErrors.hint')}
      </Text>
      <Box row wrap gap="sm">
        <CustomButton
          title={t('devShowcase.globalErrors.server500')}
          onPress={showServer500}
          variant="outline"
          size="sm"
        />
        <CustomButton
          title={t('devShowcase.globalErrors.server503')}
          onPress={showServer503}
          variant="outline"
          size="sm"
        />
        <CustomButton
          title={t('devShowcase.globalErrors.showOffline')}
          onPress={showOffline}
          variant="outline"
          size="sm"
        />
        <CustomButton
          title={t('devShowcase.globalErrors.hideOffline')}
          onPress={hideOffline}
          variant="ghost"
          size="sm"
        />
      </Box>
    </Box>
  );
};

export const GlobalErrorsDemo = memo(GlobalErrorsDemoComponent);
