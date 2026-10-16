import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BookOpenText, Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  Box,
  IconButton,
  SegmentedControl,
  Text,
  type SegmentedOption,
} from '@/shared/ui';

export interface DealsListHeaderProps<T extends string> {
  title: string;
  subtitle: string;
  options: readonly SegmentedOption<T>[];
  tab: T;
  onTab: (tab: T) => void;
  onGuide: () => void;
  /** Brand only, and only while Public Campaigns are on: starts a new campaign. */
  onNewCampaign?: () => void;
}

/**
 * The deal board's fixed top: a big title with the count of what is moving, the guide, and the
 * status tabs, which stay put while the tickets scroll under them.
 */
const DealsListHeaderComponent = <T extends string>({
  title,
  subtitle,
  options,
  tab,
  onTab,
  onGuide,
  onNewCampaign,
}: DealsListHeaderProps<T>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    ({ spacing }): Record<'header', ViewStyle> => ({
      header: {
        paddingTop: top + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
        gap: spacing.lg,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.layout.base, top],
  );

  return (
    <Box style={styles.header}>
      <Box row align="flex-end" justify="space-between" gap="md">
        <Box flex={1} gap="xs">
          <Text
            variant="h1"
            color={colors.brand.text}
            accessibilityRole="header"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            variant="bodySmall"
            color={colors.text.secondary}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </Box>
        <Box row gap="sm">
          {onNewCampaign ? (
            <IconButton
              icon={Plus}
              variant="soft"
              onPress={onNewCampaign}
              accessibilityLabel={t('marketplace.deals.newCampaign')}
            />
          ) : null}
          <IconButton
            icon={BookOpenText}
            variant="outline"
            onPress={onGuide}
            accessibilityLabel={t('marketplace.deals.guide')}
          />
        </Box>
      </Box>
      <SegmentedControl
        options={options}
        value={tab}
        onChange={onTab}
        accessibilityLabel={t('marketplace.deals.tabsLabel')}
      />
    </Box>
  );
};

export const DealsListHeader = memo(
  DealsListHeaderComponent,
) as typeof DealsListHeaderComponent;
