import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { Box, Card, ProgressBar, SectionHeader } from '@/shared/ui';
import type { BrandLocationRow } from '../../../utils/mediaKitInsights';

const PERCENT: Intl.NumberFormatOptions = {
  style: 'percent',
  maximumFractionDigits: 1,
};

interface BrandLocationsCardProps {
  rows: readonly BrandLocationRow[];
}

/** Brand governorates, top 5 + "other" (§17.7). The screen hides it while the list is empty. */
const BrandLocationsCardComponent: React.FC<BrandLocationsCardProps> = ({
  rows,
}) => {
  const { t } = useTranslation();

  return (
    <Box gap="sm">
      <SectionHeader
        title={t('account.mediaKit.insightsScreen.locations.title')}
        subtitle={t('account.mediaKit.insightsScreen.locations.subtitle')}
      />
      <Card p="lg" shadow="none">
        <Box gap="lg">
          {rows.map(row => {
            const count = formatNumber(row.count);
            const share = formatNumber(row.share, PERCENT);
            return (
              <ProgressBar
                key={row.key}
                value={row.share}
                label={row.label}
                valueLabel={t('account.mediaKit.insightsScreen.locations.row', {
                  count,
                  share,
                })}
                accessibilityLabel={t(
                  'account.mediaKit.insightsScreen.locations.a11y',
                  {
                    city: row.label,
                    count,
                    share,
                  },
                )}
              />
            );
          })}
        </Box>
      </Card>
    </Box>
  );
};

export const BrandLocationsCard = memo(BrandLocationsCardComponent);
