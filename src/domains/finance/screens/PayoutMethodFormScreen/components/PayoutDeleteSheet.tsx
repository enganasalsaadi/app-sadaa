import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet, Notice } from '@/shared/ui';
import type { PayoutMethodFormScreenModel } from '../hooks/usePayoutMethodFormScreen';

/** Delete confirmation; warns who becomes primary, or that withdrawals stop without a method. */
const PayoutDeleteSheetComponent: React.FC<{ sheet: PayoutMethodFormScreenModel['deleteSheet'] }> = ({ sheet }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const warning = sheet.isLast
    ? t('finance.payouts.delete.lastWarning')
    : sheet.nextPrimaryTitle
      ? t('finance.payouts.delete.primaryWarning', { name: sheet.nextPrimaryTitle })
      : null;

  return (
    <ConfirmSheet
      visible={sheet.visible}
      onClose={sheet.onClose}
      icon={<Trash2 size={sizes.icon.lg} color={colors.status.danger.main} />}
      title={t('finance.payouts.delete.title', { name: sheet.title })}
      body={t('finance.payouts.delete.body')}
      confirmLabel={t('finance.payouts.delete.confirm')}
      confirmVariant="danger"
      onConfirm={sheet.onConfirm}
      confirmLoading={sheet.loading}
      cancelLabel={t('common.cancel')}
    >
      {warning ? <Notice tone="warning" message={warning} /> : null}
    </ConfirmSheet>
  );
};

export const PayoutDeleteSheet = memo(PayoutDeleteSheetComponent);
