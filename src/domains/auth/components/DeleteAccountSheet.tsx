import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, CustomInput, InlineError } from '@/shared/ui';
import { useDeleteAccountSheet } from '../hooks/useDeleteAccountSheet';

export interface DeleteAccountSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Permanent account deletion behind the current password. Reachable from
 * Settings, the suspended gate and the registration wizard (store rules: anyone
 * who can create an account must be able to delete it).
 */
const DeleteAccountSheetComponent: React.FC<DeleteAccountSheetProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { control, onConfirm, onCancel, isDeleting, error } = useDeleteAccountSheet(
    visible,
    onClose,
  );

  return (
    <ConfirmSheet
      visible={visible}
      onClose={onCancel}
      title={t('auth.deleteAccount.title')}
      body={t('auth.deleteAccount.body')}
      icon={<Trash2 size={sizes.icon.lg} color={colors.status.danger.main} />}
      confirmLabel={t('auth.deleteAccount.confirm')}
      onConfirm={onConfirm}
      confirmVariant="danger"
      confirmLoading={isDeleting}
      cancelLabel={t('common.cancel')}
    >
      <Box gap="md">
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('auth.deleteAccount.passwordLabel')}
              placeholder={t('auth.deleteAccount.passwordPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={onConfirm}
              error={fieldState.error?.message}
            />
          )}
        />
        <InlineError error={error} />
      </Box>
    </ConfirmSheet>
  );
};

export const DeleteAccountSheet = memo(DeleteAccountSheetComponent);
