import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react-native';
import { EmptyState } from '@/shared/ui';

/** Stand-in for a wizard step whose build step hasn't landed (PC1.3 – PC1.6); each swaps it out. */
const CampaignStepSoonComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyState icon={Construction} title={t('tabs.comingSoon.title')} message={t('tabs.comingSoon.message')} />
  );
};

export const CampaignStepSoon = memo(CampaignStepSoonComponent);
