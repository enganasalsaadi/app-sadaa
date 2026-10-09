import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react-native';
import type { DiscardGuard } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';

interface TopUpDiscardSheetProps {
  guard: DiscardGuard;
}

/** Asked when leaving the top-up wizard with something entered (`useDiscardGuard`). */
const TopUpDiscardSheetComponent: React.FC<TopUpDiscardSheetProps> = ({ guard }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <ConfirmSheet
      visible={guard.visible}
      onClose={guard.stay}
      icon={<LogOut size={sizes.icon.lg} color={colors.text.secondary} />}
      title={t('finance.topUp.discard.title')}
      body={t('finance.topUp.discard.body')}
      confirmLabel={t('finance.topUp.discard.confirm')}
      confirmVariant="danger"
      onConfirm={guard.discard}
      cancelLabel={t('finance.topUp.discard.stay')}
    />
  );
};

export const TopUpDiscardSheet = memo(TopUpDiscardSheetComponent);
