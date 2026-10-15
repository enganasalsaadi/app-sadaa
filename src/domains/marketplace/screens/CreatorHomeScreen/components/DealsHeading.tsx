import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, LiveDot, Pressable, Text } from '@/shared/ui';

interface DealsHeadingProps {
  /** Deals waiting on the creator; a live dot and the count show when above 0. */
  waiting: number;
  moving: number;
  onSeeAll?: () => void;
}

/** «Your turn»: the line under it counts what waits on the creator (amber) and what moves without them. */
const DealsHeadingComponent: React.FC<DealsHeadingProps> = ({ waiting, moving, onSeeAll }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const waitingText = waiting > 0 ? t('marketplace.creatorHome.deals.waiting', { count: waiting }) : null;
  const movingText = moving > 0 ? t('marketplace.creatorHome.deals.moving', { count: moving }) : null;

  return (
    <Box row align="flex-end" justify="space-between" gap="md" px="xl">
      <Box flex={1}>
        <Box row align="center" gap="sm">
          {waiting > 0 ? <LiveDot color={colors.status.warning.main} /> : null}
          <Text variant="h4" accessibilityRole="header">
            {t('marketplace.creatorHome.deals.title')}
          </Text>
        </Box>
        {waitingText || movingText ? (
          <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
            {waitingText ? (
              <Text variant="buttonSmall" color={colors.status.warning.text}>
                {waitingText}
              </Text>
            ) : null}
            {waitingText && movingText ? ' · ' : null}
            {movingText}
          </Text>
        ) : null}
      </Box>
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          minHeight={sizes.button.md}
          justify="center"
          hitSlop={sizes.hitSlop.sm}
          accessibilityRole="button"
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.creatorHome.deals.seeAll')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DealsHeading = memo(DealsHeadingComponent);
