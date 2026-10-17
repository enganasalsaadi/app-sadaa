import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';
import { CampaignRing } from './CampaignRing';

export interface ReadinessRingProps {
  done: number;
  total: number;
}

/** How much of a draft is filled, as a ring that draws itself once. */
const ReadinessRingComponent: React.FC<ReadinessRingProps> = ({ done, total }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <CampaignRing
      progress={total === 0 ? 0 : done / total}
      color={colors.interactive.main}
      trackColor={colors.surface.elevated}
      size={54}
      strokeWidth={5}
      accessibilityLabel={t('marketplace.campaign.list.readinessA11y', { done, total })}
    >
      <Text variant="label" color={colors.text.primary}>
        {t('marketplace.campaign.list.readiness', { done, total })}
      </Text>
    </CampaignRing>
  );
};

export const ReadinessRing = memo(ReadinessRingComponent);
