import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Pressable, Rail, Text } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

type Category = BrandHomeScreenModel['categories'][number];

interface CategoryChipsProps {
  categories: Category[];
  onOpenCategory: (value: string) => void;
  onBrowseAll: () => void;
}

const ChipButton = memo<{
  label: string;
  icon?: LucideIcon;
  filled?: boolean;
  onPress: () => void;
}>(({ label, icon: Icon, filled = false, onPress }) => {
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      row
      align="center"
      gap="xs"
      px="lg"
      height={sizes.input.md}
      borderRadius="full"
      bg={filled ? colors.button.primary.bg : colors.surface.main}
      borderWidth={filled ? undefined : 'thin'}
      borderColor={filled ? undefined : colors.border.default}
      onPress={onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {Icon ? <Icon size={sizes.icon.sm} color={colors.interactive.main} /> : null}
      <Text variant="bodySmall" color={filled ? colors.button.primary.text : colors.text.primary}>
        {label}
      </Text>
    </Pressable>
  );
});

const CategoryChip = memo<{ category: Category; onOpen: (value: string) => void }>(
  ({ category, onOpen }) => {
    const open = useCallback(() => onOpen(category.value), [category.value, onOpen]);
    return <ChipButton label={category.label} icon={category.icon} onPress={open} />;
  },
);

/** "All" (navy) then the server's categories as shortcuts into Explore. Hidden without them. */
const CategoryChipsComponent: React.FC<CategoryChipsProps> = ({
  categories,
  onOpenCategory,
  onBrowseAll,
}) => {
  const { t } = useTranslation();
  if (categories.length === 0) return null;
  return (
    <Rail gap="sm">
      <ChipButton label={t('marketplace.brandHome.allCategories')} filled onPress={onBrowseAll} />
      {categories.map(category => (
        <CategoryChip key={category.value} category={category} onOpen={onOpenCategory} />
      ))}
    </Rail>
  );
};

export const CategoryChips = memo(CategoryChipsComponent);
