import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Pressable, Text } from '@/shared/ui';
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
  const { spacing } = useTheme();
  const styles = useStyles(() => ({
    // `flexGrow: 0` keeps the row at its height instead of floating mid-screen.
    row: { flexGrow: 0 },
    content: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  }), [spacing]);

  if (categories.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      <ChipButton label={t('marketplace.brandHome.allCategories')} filled onPress={onBrowseAll} />
      {categories.map(category => (
        <CategoryChip key={category.value} category={category} onOpen={onOpenCategory} />
      ))}
    </ScrollView>
  );
};

export const CategoryChips = memo(CategoryChipsComponent);
