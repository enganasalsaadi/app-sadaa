import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Chip, ChipRow, Skeleton } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

const SKELETON_TILE_WIDTHS = [96, 120, 88, 112].map(width => moderateScale(width));

type CategoryTilesProps = Pick<
  BrandHomeScreenModel,
  'categories' | 'categoriesLoading' | 'openCategory'
>;

/**
 * The server's categories as soft icon tiles (`Chip variant="tile"`, one tint for all), each
 * opening Explore prefilled. A shortcut only: nothing shows when `/explore/filters` fails.
 */
const CategoryTilesComponent: React.FC<CategoryTilesProps> = ({
  categories,
  categoriesLoading,
  openCategory,
}) => {
  const { t } = useTranslation();
  const { sizes } = useTheme();

  if (categoriesLoading) {
    return (
      <Box row gap="sm" px="xl" overflow="hidden" accessibilityElementsHidden>
        {SKELETON_TILE_WIDTHS.map(width => (
          <Skeleton key={width} width={width} height={sizes.button.md} borderRadius="full" />
        ))}
      </Box>
    );
  }
  if (categories.length === 0) return null;

  return (
    <ChipRow accessibilityLabel={t('marketplace.explore.categoriesA11y')}>
      {categories.map(category => (
        <Chip
          key={category.value}
          variant="tile"
          icon={category.icon}
          label={category.label}
          value={category.value}
          onSelect={openCategory}
        />
      ))}
    </ChipRow>
  );
};

export const CategoryTiles = memo(CategoryTilesComponent);
