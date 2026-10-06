import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, SectionHeader, Sparkline } from '@/shared/ui';

interface DailyViewsCardProps {
  values: readonly number[];
  accessibilityLabel: string;
}

/** `profile_views.series`: one point per Damascus day, zeros included (§17.7). */
const DailyViewsCardComponent: React.FC<DailyViewsCardProps> = ({
  values,
  accessibilityLabel,
}) => {
  const { t } = useTranslation();

  return (
    <Box gap="sm">
      <SectionHeader title={t('account.mediaKit.insightsScreen.daily.title')} />
      <Card p="md" shadow="none">
        <Sparkline values={values} accessibilityLabel={accessibilityLabel} />
      </Card>
    </Box>
  );
};

export const DailyViewsCard = memo(DailyViewsCardComponent);
