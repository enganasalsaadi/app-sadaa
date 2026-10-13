import React, { memo } from 'react';
import { Briefcase } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { EmptyState, Layout } from '@/shared/ui';
import type { DealRole } from '../../types';

interface DealsComingSoonScreenProps {
  /** Titles the screen like the role's tab. */
  role: DealRole;
  /** The tab's root has nowhere to go back to. */
  isRoot?: boolean;
}

const TAB_TITLE_KEY = {
  brand: 'tabs.campaigns',
  creator: 'tabs.deals',
} as const satisfies Record<DealRole, ParseKeys>;

/**
 * Stands in for every `DealsTab` route until its screen lands (direct deals P3+), so deal
 * pushes already open the tab with the list underneath instead of a dead navigate.
 */
const DealsComingSoonScreenComponent: React.FC<DealsComingSoonScreenProps> = ({
  role,
  isRoot = false,
}) => {
  const { t } = useTranslation();

  return (
    <Layout mode="static" header={{ title: t(TAB_TITLE_KEY[role]), showBackButton: !isRoot }}>
      <EmptyState
        icon={Briefcase}
        title={t('tabs.comingSoon.title')}
        message={t('tabs.comingSoon.message')}
      />
    </Layout>
  );
};

export const DealsComingSoonScreen = memo(DealsComingSoonScreenComponent);
