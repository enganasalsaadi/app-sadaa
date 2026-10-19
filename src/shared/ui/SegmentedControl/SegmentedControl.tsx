import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { formatNumber } from '@/core/i18n';
import { opacity, useStyles, useTheme } from '@/core/theme';
import { Badge } from '../Badge';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Something in this view waits on the user: an amber count beside the label (0 shows nothing). */
  badge?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  /** Segments size to their label and the track scrolls sideways, instead of splitting the width (labels never get cut). */
  scrollable?: boolean;
}

// A scrollable track's segments size to their label, then share any room left over.
const GROW: ViewStyle = { flexGrow: 1 };

interface SegmentProps<T extends string> {
  option: SegmentedOption<T>;
  selected: boolean;
  disabled: boolean;
  stretch: boolean;
  onSelect: (value: T) => void;
}

const SegmentComponent = <T extends string>({
  option,
  selected,
  disabled,
  stretch,
  onSelect,
}: SegmentProps<T>) => {
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onSelect(option.value), [onSelect, option.value]);

  return (
    <Pressable
      flex={stretch ? undefined : 1}
      style={stretch ? GROW : undefined}
      onPress={handlePress}
      disabled={disabled}
      minHeight={sizes.button.md}
      px={stretch ? 'lg' : 'sm'}
      row
      align="center"
      justify="center"
      gap="sm"
      borderRadius="md"
      bg={selected ? colors.surface.main : colors.layout.transparent}
      shadow={selected ? 'sm' : 'none'}
      accessibilityRole="tab"
      accessibilityLabel={option.badge ? `${option.label}, ${formatNumber(option.badge)}` : option.label}
      accessibilityState={{ selected, disabled }}
    >
      <Text
        variant={selected ? 'bodyMedium' : 'bodySmall'}
        color={selected ? colors.text.primary : colors.text.secondary}
        numberOfLines={1}
      >
        {option.label}
      </Text>
      {option.badge ? <Badge count={option.badge} tone="warning" /> : null}
    </Pressable>
  );
};

const Segment = memo(SegmentComponent) as typeof SegmentComponent;

/** 2–4 mutually exclusive views of the same content (Active / Completed). More → `Tabs`, or `scrollable` when the labels need room. */
const SegmentedControlComponent = <T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  scrollable = false,
}: SegmentedControlProps<T>) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ spacing }): Record<'track' | 'scroll' | 'content', ViewStyle> => ({
      track: { overflow: 'hidden' },
      scroll: { flexGrow: 0 },
      // `flexGrow: 1`: when the labels fit, the segments still share the whole track.
      content: { flexGrow: 1, padding: spacing.xs, gap: spacing.xs },
    }),
    [],
  );
  const segments = options.map(option => (
    <Segment
      key={option.value}
      option={option}
      selected={option.value === value}
      disabled={disabled}
      stretch={scrollable}
      onSelect={onChange}
    />
  ));

  return (
    <Box
      row={!scrollable}
      p={scrollable ? undefined : 'xs'}
      gap={scrollable ? undefined : 'xs'}
      borderRadius="lg"
      bg={colors.surface.elevated}
      opacity={disabled ? opacity.disabled : 1}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={scrollable ? styles.track : undefined}
    >
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!disabled}
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          {segments}
        </ScrollView>
      ) : (
        segments
      )}
    </Box>
  );
};

export const SegmentedControl = memo(
  SegmentedControlComponent,
) as typeof SegmentedControlComponent;
