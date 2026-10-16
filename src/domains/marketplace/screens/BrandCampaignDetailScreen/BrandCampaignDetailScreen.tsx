import React from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { CampaignComingSoon } from '../../components/CampaignComingSoon';

/** Brand's campaign page (`sada://campaigns/{id}`); placeholder until PC2.2. */
export const BrandCampaignDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <CampaignComingSoon
      title={t('marketplace.campaign.detailTitle')}
      icon={Megaphone}
      showBackButton
    />
  );
};
