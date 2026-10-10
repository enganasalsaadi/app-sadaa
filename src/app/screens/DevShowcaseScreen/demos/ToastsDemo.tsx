import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton } from '@/shared/ui';
import { useToastsDemo } from './hooks/useToastsDemo';

const ToastsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning, showInfo, showAction } = useToastsDemo();

  return (
    <Box row wrap gap="sm">
      <CustomButton
        title={t('devShowcase.modalsToasts.toastSuccessLabel')}
        onPress={showSuccess}
        variant="secondary"
        size="sm"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.toastErrorLabel')}
        onPress={showError}
        variant="secondary"
        size="sm"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.toastWarningLabel')}
        onPress={showWarning}
        variant="secondary"
        size="sm"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.toastInfoLabel')}
        onPress={showInfo}
        variant="secondary"
        size="sm"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.toastActionLabel')}
        onPress={showAction}
        variant="secondary"
        size="sm"
      />
    </Box>
  );
};

export const ToastsDemo = memo(ToastsDemoComponent);
