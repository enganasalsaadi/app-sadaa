import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface RailHeadingProps {
  /** Server copy, shown as-is. */
  title: string;
  subtitle?: string;
  /** "See all"; omitted when the rail has no Explore prefill. */
  onSeeAll?: () => void;
}

/** Big confident rail title with a muted line under it and "See all" at the far end. */
const RailHeadingComponent: React.FC<RailHeadingProps> = ({ title, subtitle, onSeeAll }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box row align="flex-end" justify="space-between" gap="md" px="xl">
      <Box flex={1}>
        <Text variant="h3" accessibilityRole="header" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
            {subtitle}
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
          accessibilityLabel={t('marketplace.brandHome.seeAllOf', { title })}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.brandHome.seeAll')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const RailHeading = memo(RailHeadingComponent);
