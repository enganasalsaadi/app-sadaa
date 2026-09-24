import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card, CustomButton } from '@/shared/ui';

interface ModalsToastsSectionProps {
  onSuccessToast: () => void;
  onErrorToast: () => void;
  onWarningToast: () => void;
  onInfoToast: () => void;
  onOpenBottomSheet: () => void;
  onOpenSelectionModal: () => void;
}

const ModalsToastsSectionComponent: React.FC<ModalsToastsSectionProps> = ({
  onSuccessToast,
  onErrorToast,
  onWarningToast,
  onInfoToast,
  onOpenBottomSheet,
  onOpenSelectionModal,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <Box gap="lg">
        <Text variant="title">{t('devShowcase.sections.modalsToasts')}</Text>

        <Box row wrap gap="sm">
          <CustomButton
            title={t('devShowcase.modalsToasts.toastSuccessLabel')}
            onPress={onSuccessToast}
            variant="secondary"
            size="sm"
          />
          <CustomButton
            title={t('devShowcase.modalsToasts.toastErrorLabel')}
            onPress={onErrorToast}
            variant="danger"
            size="sm"
          />
          <CustomButton
            title={t('devShowcase.modalsToasts.toastWarningLabel')}
            onPress={onWarningToast}
            variant="secondary"
            size="sm"
          />
          <CustomButton
            title={t('devShowcase.modalsToasts.toastInfoLabel')}
            onPress={onInfoToast}
            variant="secondary"
            size="sm"
          />
        </Box>

        <Box row wrap gap="sm">
          <CustomButton
            title={t('devShowcase.modalsToasts.openBottomSheet')}
            onPress={onOpenBottomSheet}
            variant="outline"
          />
          <CustomButton
            title={t('devShowcase.modalsToasts.openSelectionModal')}
            onPress={onOpenSelectionModal}
            variant="outline"
          />
        </Box>
      </Box>
    </Card>
  );
};

export const ModalsToastsSection = memo(ModalsToastsSectionComponent);
