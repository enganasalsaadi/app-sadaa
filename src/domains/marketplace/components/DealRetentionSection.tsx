import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useClock } from '../hooks/useClock';
import type { DealRetentionModel } from '../hooks/useDealRetention';
import type { Deal } from '../types';
import { retentionLives } from '../utils/dealRetention';
import { DealRetentionLife } from './DealRetentionLife';

const MINUTE_MS = 60_000;

export interface DealRetentionSectionProps {
  deal: Deal;
  retention: DealRetentionModel;
}

/**
 * «بقاء المنشور» after completion: one life ring per verified post, ticking by the minute on its
 * own clock so nothing else on the page re-renders.
 */
const DealRetentionSectionComponent: React.FC<DealRetentionSectionProps> = ({
  deal,
  retention,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(MINUTE_MS);
  const lives = useMemo(() => retentionLives(deal, now), [deal, now]);
  if (!retention.hasLives || lives.length === 0) return null;

  return (
    <Box gap="lg">
      <Box row align="center" gap="sm">
        <ShieldCheck size={sizes.icon.md} color={colors.interactive.main} />
        <Text
          variant="h4"
          color={colors.text.primary}
          accessibilityRole="header"
        >
          {t('marketplace.deals.retention.title')}
        </Text>
      </Box>
      {lives.map(life => (
        <DealRetentionLife
          key={life.itemId}
          life={life}
          role={retention.role}
          onReport={retention.report.open}
        />
      ))}
    </Box>
  );
};

export const DealRetentionSection = memo(DealRetentionSectionComponent);
