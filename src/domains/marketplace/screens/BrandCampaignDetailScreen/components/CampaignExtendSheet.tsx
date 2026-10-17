import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import type { CampaignDetail } from '../../../types/campaign';
import { formatCampaignDate } from '../../../utils/campaignSchedule';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignExtendSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
}

/** The one-time «+4 days» rescue when nobody applied: it can't be used twice, so it asks first. */
const CampaignExtendSheetComponent: React.FC<CampaignExtendSheetProps> = ({ campaign, lifecycle }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { extendVisible, close, submitExtend, isRunning } = lifecycle;
  const extendTo = campaign.timers.zeroApplicants?.extendTo ?? null;

  return (
    <ConfirmSheet
      visible={extendVisible}
      onClose={close}
      icon={<CalendarPlus size={sizes.icon.lg} color={colors.interactive.main} />}
      title={t('marketplace.campaign.detail.zeroExtend.title')}
      body={
        extendTo !== null
          ? t('marketplace.campaign.detail.zeroExtend.body', { date: formatCampaignDate(extendTo) })
          : t('marketplace.campaign.detail.zeroExtend.bodyNoDate')
      }
      confirmLabel={t('marketplace.campaign.detail.zeroExtend.confirm')}
      confirmLoading={isRunning}
      onConfirm={submitExtend}
      cancelLabel={t('marketplace.campaign.detail.zeroExtend.cancel')}
    />
  );
};

export const CampaignExtendSheet = memo(CampaignExtendSheetComponent);
