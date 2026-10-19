import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BookOpenText, Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Chip,
  CustomButton,
  IconButton,
  Rail,
  SegmentedControl,
  Text,
  type SegmentedOption,
} from '@/shared/ui';
import type { HubFace, HubFilterOption } from '../types/hub';

export interface DealsHubHeaderProps<T extends string> {
  title: string;
  onGuide: () => void;
  newLabel: string;
  onNew: () => void;
  /** The two faces; `null` while Public Campaigns are off, when there is only one. */
  faces: readonly SegmentedOption<HubFace>[] | null;
  face: HubFace;
  onFace: (face: HubFace) => void;
  filters: readonly HubFilterOption<T>[];
  filter: T;
  onFilter: (filter: T) => void;
  filtersLabel: string;
}

/**
 * The fixed top of the brand's deals tab: title with the guide and «new», the face switch (a pill,
 * with an amber count when the other face waits on you), then that face's filter chips with their
 * counts. All of it stays put while the cards scroll under it.
 */
const DealsHubHeaderComponent = <T extends string>({
  title,
  onGuide,
  newLabel,
  onNew,
  faces,
  face,
  onFace,
  filters,
  filter,
  onFilter,
  filtersLabel,
}: DealsHubHeaderProps<T>) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
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

  // The chip hands back its string; the typed filter is the option it came from.
  const selectFilter = useCallback(
    (value: string) => {
      const picked = filters.find(option => option.value === value);
      if (picked) onFilter(picked.value);
    },
    [filters, onFilter],
  );

  return (
    <Box style={styles.header}>
      <Box row align="center" justify="space-between" gap="md">
        <Box flex={1}>
          <Text variant="h1" color={colors.brand.text} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <Box row align="center" gap="sm">
          <IconButton
            icon={BookOpenText}
            variant="outline"
            onPress={onGuide}
            accessibilityLabel={t('marketplace.deals.guide')}
          />
          <CustomButton
            title={newLabel}
            size="md"
            onPress={onNew}
            leftIcon={<Plus size={sizes.icon.sm} />}
          />
        </Box>
      </Box>
      {faces ? (
        <SegmentedControl
          options={faces}
          value={face}
          onChange={onFace}
          accessibilityLabel={t('marketplace.hub.facesLabel')}
        />
      ) : null}
      <Rail bleed gap="sm" accessibilityRole="tablist" accessibilityLabel={filtersLabel}>
        {filters.map(option => (
          <Chip
            key={option.value}
            variant="solid"
            value={option.value}
            label={option.label}
            count={option.count}
            attention={option.attention}
            selected={option.value === filter}
            onSelect={selectFilter}
          />
        ))}
      </Rail>
    </Box>
  );
};

export const DealsHubHeader = memo(DealsHubHeaderComponent) as typeof DealsHubHeaderComponent;
