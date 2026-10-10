import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Chip, Pressable, SearchBar, Skeleton } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const SKELETON_CHIP_WIDTHS = [72, 96, 64, 88].map(width => moderateScale(width));
const noop = () => undefined;

type ExploreEntryProps = Pick<
  BrandHomeScreenModel,
  'openSearch' | 'categories' | 'categoriesLoading' | 'openCategory'
>;

/**
 * Doorway to Explore: a search field that opens Explore with the keyboard up, then the
 * server's category chips, each opening Explore prefilled.
 */
const ExploreEntryComponent: React.FC<ExploreEntryProps> = ({
  openSearch,
  categories,
  categoriesLoading,
  openCategory,
}) => {
  const { t } = useTranslation();
  const { sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    chips: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  }));
  const placeholder = t('marketplace.explore.searchPlaceholder');

  return (
    <Box gap="md">
      <Box px="xl">
        <Pressable onPress={openSearch} accessibilityRole="search" accessibilityLabel={placeholder}>
          {/* The real field lives on Explore; this one only looks the part. */}
          <Box pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <SearchBar value="" onChangeText={noop} placeholder={placeholder} />
          </Box>
        </Pressable>
      </Box>
      {categoriesLoading ? (
        <Box row gap="sm" px="xl" overflow="hidden" accessibilityElementsHidden>
          {SKELETON_CHIP_WIDTHS.map(width => (
            <Skeleton key={width} width={width} height={sizes.button.md} borderRadius="md" />
          ))}
        </Box>
      ) : categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityLabel={t('marketplace.explore.categoriesA11y')}
        >
          {categories.map(category => (
            <Chip
              key={category.value}
              label={category.label}
              value={category.value}
              onSelect={openCategory}
            />
          ))}
        </ScrollView>
      ) : null}
    </Box>
  );
};

export const ExploreEntry = memo(ExploreEntryComponent);
