import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Layout } from '@/shared/ui';

interface ComingSoonTabScreenProps {
  title: string;
  icon: LucideIcon;
}

/**
 * Root of a tab whose domain isn't built yet (campaigns, deals, messages,
 * wallet), so the full role tab set can be reviewed on device. Replaced by the
 * domain navigator when its first screen lands.
 */
const ComingSoonTabScreenComponent: React.FC<ComingSoonTabScreenProps> = ({
  title,
  icon,
}) => {
  const { t } = useTranslation();

  return (
    <Layout mode="static" header={{ title, showBackButton: false }}>
      <EmptyState
        icon={icon}
        title={t('tabs.comingSoon.title')}
        message={t('tabs.comingSoon.message')}
      />
    </Layout>
  );
};

export const ComingSoonTabScreen = memo(ComingSoonTabScreenComponent);
