import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { Badge } from '../Badge';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** Counter next to the label (offers, drafts to review). */
  count?: number;
}

export interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Scroll horizontally instead of splitting the width (5+ tabs or long labels). */
  scrollable?: boolean;
}

interface TabProps<T extends string> {
  item: TabItem<T>;
  selected: boolean;
  stretch: boolean;
  onSelect: (value: T) => void;
}

const TabComponent = <T extends string>({
  item,
  selected,
  stretch,
  onSelect,
}: TabProps<T>) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(item.value), [onSelect, item.value]);

  return (
    <Pressable
      flex={stretch ? 1 : undefined}
      onPress={handlePress}
      row
      align="center"
      justify="center"
      gap="xs"
      px="lg"
      minHeight={sizes.button.md}
      borderBottomWidth="md"
      borderColor={selected ? colors.interactive.main : colors.layout.transparent}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
    >
      <Text
        variant={selected ? 'bodyMedium' : 'body'}
        color={selected ? colors.interactive.text : colors.text.secondary}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.count ? (
        <Badge count={item.count} tone={selected ? 'interactive' : 'neutral'} />
      ) : null}
    </Pressable>
  );
};

const Tab = memo(TabComponent) as typeof TabComponent;

/** Underlined section tabs under a header. 2–4 short equal options → `SegmentedControl`. */
const TabsComponent = <T extends string>({
  items,
  value,
  onChange,
  accessibilityLabel,
  scrollable = false,
}: TabsProps<T>) => {
  const { colors } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    content: { paddingHorizontal: spacing.xs },
  }));

  const tabs = items.map(item => (
    <Tab
      key={item.value}
      item={item}
      selected={item.value === value}
      stretch={!scrollable}
      onSelect={onChange}
    />
  ));

  return (
    <Box
      borderBottomWidth="hairline"
      borderColor={colors.border.default}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {tabs}
        </ScrollView>
      ) : (
        <Box row>{tabs}</Box>
      )}
    </Box>
  );
};

export const Tabs = memo(TabsComponent) as typeof TabsComponent;
