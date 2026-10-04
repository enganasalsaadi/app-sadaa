import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import type { DiscardGuard } from '../hooks/useDiscardGuard';

interface DiscardChangesSheetProps {
  guard: DiscardGuard;
}

/** Asked when leaving a form with unsaved edits (driven by `useDiscardGuard`). */
const DiscardChangesSheetComponent: React.FC<DiscardChangesSheetProps> = ({ guard }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <ConfirmSheet
      visible={guard.visible}
      onClose={guard.stay}
      icon={<Undo2 size={sizes.icon.lg} color={colors.text.secondary} />}
      title={t('account.discard.title')}
      body={t('account.discard.body')}
      confirmLabel={t('account.discard.confirm')}
      confirmVariant="danger"
      onConfirm={guard.discard}
      cancelLabel={t('account.discard.stay')}
    />
  );
};

export const DiscardChangesSheet = memo(DiscardChangesSheetComponent);
