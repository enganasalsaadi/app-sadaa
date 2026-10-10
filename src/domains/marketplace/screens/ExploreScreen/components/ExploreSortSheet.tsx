import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box, ListRow, Text } from '@/shared/ui';
import type { ExploreSort, ExploreSortOption } from '../../../types/explore';

interface ExploreSortSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismissed: () => void;
  options: readonly ExploreSortOption[];
  value: ExploreSort;
  onSelect: (sort: ExploreSort) => void;
  /** Prices hidden: 🔒 sorts open the lock sheet instead of applying. */
  priceLocked: boolean;
  onLocked: () => void;
}

const SortRow = memo<{
  option: ExploreSortOption;
  selected: boolean;
  locked: boolean;
  onSelect: (sort: ExploreSort) => void;
  onLocked: () => void;
}>(({ option, selected, locked, onSelect, onLocked }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const press = useCallback(
    () => (locked ? onLocked() : onSelect(option.value)),
    [locked, onLocked, onSelect, option.value],
  );
  if (locked) {
    return (
      <ListRow
        title={option.label}
        subtitle={t('marketplace.explore.lockedOption')}
        trailing={<Lock size={sizes.icon.sm} color={colors.icon.secondary} />}
        onPress={press}
      />
    );
  }
  return <ListRow title={option.label} selected={selected} onPress={press} />;
});

/** Sort picker: applies on tap. Order and labels come from `/explore/filters`. */
const ExploreSortSheetComponent: React.FC<ExploreSortSheetProps> = ({
  visible,
  onClose,
  onDismissed,
  options,
  value,
  onSelect,
  priceLocked,
  onLocked,
}) => {
  const { t } = useTranslation();
  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <Box px="lg" pb="lg" gap="sm" accessibilityRole="radiogroup">
        <Text variant="h4" accessibilityRole="header">
          {t('marketplace.explore.sort.title')}
        </Text>
        {options.map(option => (
          <SortRow
            key={option.value}
            option={option}
            selected={option.value === value}
            locked={priceLocked && option.requiresVerification}
            onSelect={onSelect}
            onLocked={onLocked}
          />
        ))}
      </Box>
    </BottomSheet>
  );
};

export const ExploreSortSheet = memo(ExploreSortSheetComponent);
