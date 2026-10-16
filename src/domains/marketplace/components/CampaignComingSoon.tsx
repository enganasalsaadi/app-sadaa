import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Layout } from '@/shared/ui';

interface CampaignComingSoonProps {
  title: string;
  icon: LucideIcon;
  /** Tab roots have no back button; pushed pages do. */
  showBackButton: boolean;
}

/** Stand-in for a Public Campaigns screen whose step hasn't landed; each screen file swaps it out when built. */
const CampaignComingSoonComponent: React.FC<CampaignComingSoonProps> = ({
  title,
  icon,
  showBackButton,
}) => {
  const { t } = useTranslation();
  return (
    <Layout mode="static" header={{ title, showBackButton }}>
      <EmptyState
        icon={icon}
        title={t('tabs.comingSoon.title')}
        message={t('tabs.comingSoon.message')}
      />
    </Layout>
  );
};

export const CampaignComingSoon = memo(CampaignComingSoonComponent);
