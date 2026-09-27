import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Heart, Users, Wallet } from 'lucide-react-native';
import { formatMoney, formatNumber } from '@/core/i18n';
import { Box, StatTile } from '@/shared/ui';
import { MOCK_STATS } from './mockData';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 1 };

const StatTileDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const period = t('devShowcase.statTile.period');

  return (
    <Box gap="sm">
      <Box row gap="sm">
        <StatTile
          icon={Eye}
          label={t('devShowcase.statTile.views')}
          value={formatNumber(MOCK_STATS.views, COMPACT)}
          change={MOCK_STATS.viewsChange}
          caption={period}
        />
        <StatTile
          icon={Heart}
          label={t('devShowcase.statTile.engagement')}
          value={formatNumber(MOCK_STATS.engagement, PERCENT)}
          change={MOCK_STATS.engagementChange}
        />
      </Box>
      <Box row gap="sm">
        <StatTile
          icon={Users}
          label={t('devShowcase.statTile.followers')}
          value={formatNumber(MOCK_STATS.followers, COMPACT)}
          change={0}
        />
        <StatTile
          icon={Wallet}
          label={t('devShowcase.statTile.earnings')}
          value={formatMoney(MOCK_STATS.earnings)}
          change={MOCK_STATS.earningsChange}
          tone="money"
        />
      </Box>
      <Box row gap="sm">
        <StatTile label={t('devShowcase.statTile.views')} value="" loading />
        <StatTile label={t('devShowcase.statTile.followers')} value={formatNumber(MOCK_STATS.followers, COMPACT)} />
      </Box>
    </Box>
  );
};

export const StatTileDemo = memo(StatTileDemoComponent);
