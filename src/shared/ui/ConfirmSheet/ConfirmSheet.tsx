import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { BottomSheet } from '../BottomSheet';
import { CustomButton } from '../CustomButton';
import type { ButtonVariant } from '../CustomButton';

export interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body?: string;
  /** Icon badge above the title (lucide element sized by the caller). */
  icon?: React.ReactNode;
  /** Extra content between body and actions (e.g. the value being confirmed). */
  children?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirmVariant?: ButtonVariant;
  confirmLoading?: boolean;
  /** Omit for a notice the user only acknowledges (the confirm button alone). */
  cancelLabel?: string;
  /** Defaults to `onClose`. */
  onCancel?: () => void;
  /** Fires once the sheet is gone: navigate from here so a modal never races a push. */
  onDismissed?: () => void;
}

/**
 * Decision sheet: one primary action + one ghost escape. Sheet (not Alert) so
 * copy, icon and highlighted values stay on-brand and localized.
 */
const ConfirmSheetComponent: React.FC<ConfirmSheetProps> = ({
  visible,
  onClose,
  title,
  body,
  icon,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  confirmLoading = false,
  cancelLabel,
  onCancel,
  onDismissed,
}) => {
  const { colors, sizes } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <Box px="2xl" pt="md" pb="2xl" gap="2xl">
        <Box align="center" gap="md">
          {icon ? (
            <Box
              width={sizes.avatar.lg}
              height={sizes.avatar.lg}
              borderRadius="full"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              {icon}
            </Box>
          ) : null}
          <Text variant="h4" align="center" accessibilityRole="header">
            {title}
          </Text>
          {body ? (
            <Text variant="body" align="center" color={colors.text.secondary}>
              {body}
            </Text>
          ) : null}
        </Box>

        {children}

        <Box gap="sm">
          <CustomButton
            title={confirmLabel}
            onPress={onConfirm}
            variant={confirmVariant}
            loading={confirmLoading}
            disabled={confirmLoading}
            fullWidth
          />
          {cancelLabel ? (
            <CustomButton
              title={cancelLabel}
              onPress={onCancel ?? onClose}
              variant="ghost"
              disabled={confirmLoading}
              fullWidth
            />
          ) : null}
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const ConfirmSheet = memo(ConfirmSheetComponent);
