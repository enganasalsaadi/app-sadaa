import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import { CustomButton } from '../CustomButton';
import { BottomSheet } from '../BottomSheet';
import type { SelectionItem, SelectionModalProps } from './types';

export const SelectionModal: React.FC<SelectionModalProps> = props => {
  const { visible, onClose, title, items, confirmLabel } = props;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  const [internalSelected, setInternalSelected] = useState<
    string | number | (string | number)[] | null
  >(props.mode === 'multi' ? props.selected : props.selected);

  useEffect(() => {
    if (visible) {
      setInternalSelected(
        props.mode === 'multi' ? props.selected : props.selected,
      );
    }
  }, [visible, props.selected, props.mode]);

  const isSelected = useCallback(
    (value: string | number): boolean => {
      if (props.mode === 'multi') {
        return (
          Array.isArray(internalSelected) &&
          (internalSelected as (string | number)[]).includes(value)
        );
      }
      return internalSelected === value;
    },
    [internalSelected, props.mode],
  );

  const handleItemPress = useCallback(
    (value: string | number) => {
      if (props.mode === 'single') {
        setInternalSelected(value);
      } else {
        setInternalSelected(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        });
      }
    },
    [props.mode],
  );

  const handleConfirm = useCallback(() => {
    if (props.mode === 'single') {
      if (internalSelected !== null && internalSelected !== undefined) {
        props.onConfirm(internalSelected as string | number);
      }
    } else {
      props.onConfirm(
        Array.isArray(internalSelected)
          ? (internalSelected as (string | number)[])
          : [],
      );
    }
    onClose();
  }, [props, internalSelected, onClose]);

  const renderRow = (item: SelectionItem) => {
    const selected = isSelected(item.value);
    return (
      <Pressable
        key={String(item.value)}
        onPress={() => handleItemPress(item.value)}
        row
        align="center"
        justify="space-between"
        px="2xl"
        py="lg"
        style={styles.item}
      >
        <Text
          variant="bodySmall"
          color={selected ? colors.text.primary : colors.text.secondary}
        >
          {item.label}
        </Text>
        {selected && (
          <Check size={18} color={colors.icon.primary} strokeWidth={2.5} />
        )}
      </Pressable>
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      bg={colors.layout.base}
      showHandle={false}
    >
      {/* Header */}
      <Box
        row
        align="center"
        justify="space-between"
        px="2xl"
        pt="lg"
        pb="lg"
        borderBottomWidth="hairline"
        borderColor={colors.border.default}
        bg={colors.surface.main}
      >
        <Text variant="h4">{title}</Text>
        <Pressable onPress={onClose} hitSlop={spacing['2xl']}>
          <Text variant="body" color={colors.text.secondary}>
            {t('common.cancel')}
          </Text>
        </Pressable>
      </Box>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {items.map(renderRow)}
      </ScrollView>

      {/* Confirm */}
      <Box px="2xl" pb="lg" pt="lg" bg={colors.surface.main}>
        <CustomButton
          title={confirmLabel ?? t('common.confirm')}
          onPress={handleConfirm}
          fullWidth
        />
      </Box>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
  },
  item: {
    borderRadius: 0,
  },
});
