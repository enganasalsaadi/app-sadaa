import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Dimensions, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react-native';
import type { CountryCode } from 'libphonenumber-js';
import { useTheme } from '@/core/theme';
import { Box, Text, Pressable } from '../primitives';
import { CustomInput } from '../CustomInput';
import { BottomSheet } from '../BottomSheet';
import {
  COUNTRIES,
  PRIORITY_COUNTRIES,
  OTHER_COUNTRIES,
  type Country,
} from './countryData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;
const ROW_HEIGHT = 58;
const SEPARATOR_HEIGHT = 36;
const PRIORITY_COUNT = PRIORITY_COUNTRIES.length;

type FlatItem = Country | { isSeparator: true };

const buildFullList = (): FlatItem[] => [
  ...PRIORITY_COUNTRIES,
  { isSeparator: true },
  ...OTHER_COUNTRIES,
];

const FULL_LIST: FlatItem[] = buildFullList();

interface CountryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: CountryCode) => void;
  selected: CountryCode;
}

export const CountryPickerSheet: React.FC<CountryPickerSheetProps> = ({
  visible,
  onClose,
  onSelect,
  selected,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) setSearch('');
  }, [visible]);

  const filteredData = useMemo<FlatItem[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FULL_LIST;
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const isSearching = search.trim().length > 0;

  const getItemLayout = useCallback(
    (_: ArrayLike<FlatItem> | null | undefined, index: number) => {
      if (index < PRIORITY_COUNT) {
        return { length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index };
      }
      if (index === PRIORITY_COUNT) {
        return {
          length: SEPARATOR_HEIGHT,
          offset: ROW_HEIGHT * PRIORITY_COUNT,
          index,
        };
      }
      return {
        length: ROW_HEIGHT,
        offset:
          ROW_HEIGHT * PRIORITY_COUNT +
          SEPARATOR_HEIGHT +
          ROW_HEIGHT * (index - PRIORITY_COUNT - 1),
        index,
      };
    },
    [],
  );

  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code as CountryCode);
      onClose();
    },
    [onSelect, onClose],
  );

  const renderItem: ListRenderItem<FlatItem> = useCallback(
    ({ item }) => {
      if ('isSeparator' in item) {
        return (
          <Box
            height={SEPARATOR_HEIGHT}
            justify="flex-end"
            pb="xs"
            px="lg"
            borderTopWidth="hairline"
            borderColor={colors.layout.divider}
          >
            <Text variant="overline" color={colors.text.tertiary}>
              {t('common.allCountries').toUpperCase()}
            </Text>
          </Box>
        );
      }

      const isSelected = item.code === selected;

      return (
        <Pressable
          onPress={() => handleSelect(item.code)}
          row
          align="center"
          px="lg"
          height={ROW_HEIGHT}
          bg={isSelected ? colors.interactive.soft : undefined}
          scaleOnPress={false}
        >
          <Box flex={1} ps="md">
            <Text variant="body" color={colors.text.primary} numberOfLines={1}>
              {item.name}
            </Text>
          </Box>
          <Text
            variant="label"
            color={colors.text.tertiary}
            style={styles.ltr}
          >
            +{item.dialCode}
          </Text>
        </Pressable>
      );
    },
    [selected, handleSelect, colors, t],
  );

  const keyExtractor = useCallback(
    (item: FlatItem, index: number) =>
      'isSeparator' in item ? 'separator' : item.code + index,
    [],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapHeight={SHEET_HEIGHT}
      bg={colors.navigation.bottomSheet.background}
    >
      <Box flex={1}>
        {/* Header */}
        <Box
          row
          align="center"
          justify="space-between"
          px="lg"
          pb="md"
          borderBottomWidth="hairline"
          borderColor={colors.layout.divider}
        >
          <Text variant="title" color={colors.text.primary}>
            {t('common.selectCountry')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={spacing.sm}
            p="xs"
            borderRadius="full"
            scaleOnPress={false}
          >
            <X size={20} color={colors.icon.secondary} />
          </Pressable>
        </Box>

        {/* Search */}
        <Box px="lg" py="md">
          <CustomInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('common.searchCountry')}
            leftIcon={<Search size={16} />}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </Box>

        {/* List */}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={isSearching ? undefined : getItemLayout}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={18}
          maxToRenderPerBatch={12}
          windowSize={5}
          removeClippedSubviews
          style={styles.list}
        />
      </Box>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 },
  ltr: { direction: 'ltr' },
});
