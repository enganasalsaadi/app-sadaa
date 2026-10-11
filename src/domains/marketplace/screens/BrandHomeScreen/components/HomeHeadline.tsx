import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';

/** The page's voice: one big question, its key word in teal. */
const HomeHeadlineComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Text variant="h1" accessibilityRole="header" mx="xl">
      {t('marketplace.brandHome.headline.lead')}
      <Text variant="h1" color={colors.interactive.text}>
        {t('marketplace.brandHome.headline.accent')}
      </Text>
      {t('marketplace.brandHome.headline.tail')}
    </Text>
  );
};

export const HomeHeadline = memo(HomeHeadlineComponent);
