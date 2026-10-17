import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOff } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * Closing while the last changes couldn't be saved: stay and retry, or leave without them. Editing a
 * live campaign: leaving with changes not saved yet drops them.
 */
const LeaveSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { leaveSheet, closeLeaveSheet, confirmLeave, live } = useCampaignWizard();
  return (
    <ConfirmSheet
      visible={leaveSheet}
      onClose={closeLeaveSheet}
      icon={<CloudOff size={sizes.icon.lg} color={colors.status.warning.main} />}
      title={t(live ? 'marketplace.campaign.wizard.live.leaveTitle' : 'marketplace.campaign.wizard.leave.title')}
      body={t(live ? 'marketplace.campaign.wizard.live.leaveBody' : 'marketplace.campaign.wizard.leave.body')}
      confirmLabel={t(live ? 'marketplace.campaign.wizard.live.leaveConfirm' : 'marketplace.campaign.wizard.leave.confirm')}
      confirmVariant="danger"
      onConfirm={confirmLeave}
      cancelLabel={t('marketplace.campaign.wizard.leave.stay')}
    />
  );
};

export const LeaveSheet = memo(LeaveSheetComponent);
