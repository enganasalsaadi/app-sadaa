import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Text } from '@/shared/ui';
import type { OpportunitySegment } from '../constants/opportunities';
import { OpportunityTabs } from './OpportunityTabs';

export interface OpportunitiesHeaderProps {
  segment: OpportunitySegment;
  onSegment: (segment: OpportunitySegment) => void;
  /** «12 campaigns fit your profile»; `null` until the feed has loaded or off the feed. */
  subtitle: string | null;
  /** Filters apply to the feed only; the button leaves the other destinations. */
  onFilters: (() => void) | null;
  activeFilters: number;
}

/** The root's fixed top: the big title with the filter button, what fits you, and the three-way capsule. */
const OpportunitiesHeaderComponent: React.FC<OpportunitiesHeaderProps> = ({
  segment,
  onSegment,
  subtitle,
  onFilters,
  activeFilters,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    ({ spacing }): Record<'header' | 'badge', ViewStyle> => ({
      badge: { position: 'absolute', top: -spacing.xs, end: -spacing.xs },
      header: {
        paddingTop: top + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
        gap: spacing.md,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.layout.base, top],
  );

  return (
    <Box style={styles.header}>
      <Box row align="flex-end" justify="space-between" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="h1" color={colors.brand.text} accessibilityRole="header" numberOfLines={1}>
            {t('marketplace.campaign.feed.title')}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {onFilters ? (
          <Box>
            <IconButton
              icon={SlidersHorizontal}
              variant="outline"
              onPress={onFilters}
              accessibilityLabel={t('marketplace.campaign.feed.filters.open')}
            />
            {activeFilters > 0 ? (
              <Box
                style={styles.badge}
                minWidth={sizes.badge.md}
                height={sizes.badge.md}
                borderRadius="full"
                align="center"
                justify="center"
                bg={colors.interactive.main}
                pointerEvents="none"
              >
                <Text variant="label" color={colors.text.onAccent}>
                  {formatNumber(activeFilters)}
                </Text>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
      <OpportunityTabs value={segment} onChange={onSegment} />
    </Box>
  );
};

export const OpportunitiesHeader = memo(OpportunitiesHeaderComponent);
