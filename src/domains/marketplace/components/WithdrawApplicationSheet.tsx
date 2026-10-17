import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import type { CreatorApplication } from '../types/campaign';

export interface WithdrawApplicationSheetProps {
  application: CreatorApplication | null;
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Taking an application back (PC5.2 frame 14): a plain confirmation, not a hold — it commits no
 * money — that says there is no penalty but also no second try on this campaign.
 */
const WithdrawApplicationSheetComponent: React.FC<WithdrawApplicationSheetProps> = ({
  application,
  visible,
  busy,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <ConfirmSheet
      visible={visible}
      onClose={onClose}
      icon={<Undo2 size={sizes.icon.lg} color={colors.interactive.main} />}
      title={t('marketplace.campaign.applications.withdraw.title')}
      body={t('marketplace.campaign.applications.withdraw.body', { brand: application?.campaign.brand.name ?? '' })}
      confirmLabel={t('marketplace.campaign.applications.withdraw.confirm')}
      confirmVariant="danger"
      confirmLoading={busy}
      onConfirm={onConfirm}
      cancelLabel={t('marketplace.campaign.applications.withdraw.keep')}
    />
  );
};

export const WithdrawApplicationSheet = memo(WithdrawApplicationSheetComponent);
