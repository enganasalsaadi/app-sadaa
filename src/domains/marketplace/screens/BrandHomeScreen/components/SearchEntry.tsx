import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface SearchEntryProps {
  onOpenSearch: () => void;
  onOpenFilters: () => void;
}

/**
 * A tall search pill that opens Explore with the keyboard up, and a navy filter key at its end
 * that opens Explore for browsing with filters.
 */
const SearchEntryComponent: React.FC<SearchEntryProps> = ({ onOpenSearch, onOpenFilters }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const placeholder = t('marketplace.explore.searchPlaceholder');

  return (
    <Box
      row
      align="center"
      gap="sm"
      mx="xl"
      height={sizes.button.xl}
      ps="lg"
      pe="sm"
      borderRadius="lg"
      bg={colors.surface.main}
      shadow="card"
    >
      <Pressable
        flex={1}
        row
        align="center"
        gap="sm"
        height="100%"
        onPress={onOpenSearch}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      >
        <Search size={sizes.icon.sm} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.form.input.placeholder} numberOfLines={1}>
            {placeholder}
          </Text>
        </Box>
      </Pressable>
      <Pressable
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="md"
        align="center"
        justify="center"
        bg={colors.button.primary.bg}
        onPress={onOpenFilters}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.filters')}
      >
        <SlidersHorizontal size={sizes.icon.sm} color={colors.button.primary.text} />
      </Pressable>
    </Box>
  );
};

export const SearchEntry = memo(SearchEntryComponent);
