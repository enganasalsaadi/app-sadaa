import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Trash2, Wallet } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, CustomInput, InlineError, Notice, Pressable, Text } from '@/shared/ui';
import { useDeleteAccountSheet } from '../hooks/useDeleteAccountSheet';
import type { DeleteAccountFundsBlock } from '../hooks/useDeleteAccountSheet';

export interface DeleteAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Where the wallet tab exists (Profile): lets a creator with funds go withdraw them. */
  onOpenWallet?: () => void;
}

const FundsBlock: React.FC<{ block: DeleteAccountFundsBlock }> = memo(({ block }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="sm">
      <Notice tone="warning" title={t('auth.deleteAccount.funds.title')} message={block.message} />
      {block.showSupportLink ? (
        <Pressable
          onPress={block.onContactSupport}
          alignSelf="center"
          minHeight={sizes.button.md}
          justify="center"
          accessibilityRole="button"
          accessibilityLabel={t('auth.deleteAccount.funds.contactSupport')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('auth.deleteAccount.funds.contactSupport')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
});

/**
 * Permanent account deletion behind the current password. Reachable from
 * Settings, the suspended gate and the registration wizard (store rules: anyone
 * who can create an account must be able to delete it).
 */
const DeleteAccountSheetComponent: React.FC<DeleteAccountSheetProps> = ({
  visible,
  onClose,
  onOpenWallet,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { control, onConfirm, onCancel, isDeleting, error, fundsBlock } = useDeleteAccountSheet(
    visible,
    onClose,
    onOpenWallet,
  );

  if (fundsBlock) {
    // Retrying is pointless until the funds move: the form gives way to the way out.
    return (
      <ConfirmSheet
        visible={visible}
        onClose={onCancel}
        title={t('auth.deleteAccount.title')}
        icon={<Wallet size={sizes.icon.lg} color={colors.status.warning.main} />}
        confirmLabel={fundsBlock.primaryLabel}
        onConfirm={fundsBlock.onPrimary}
        cancelLabel={t('common.close')}
      >
        <FundsBlock block={fundsBlock} />
      </ConfirmSheet>
    );
  }

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
