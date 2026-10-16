import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react-native';
import { CampaignComingSoon } from '../../components/CampaignComingSoon';

/** Creator's public-campaign feed (the Opportunities tab root); placeholder until PC4.1. */
export const CreatorOpportunitiesScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CampaignComingSoon title={t('tabs.opportunities')} icon={Compass} showBackButton={false} />
  );
};
