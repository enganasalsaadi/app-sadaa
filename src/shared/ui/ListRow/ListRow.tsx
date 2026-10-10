import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, opacity, resolveHue, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { RadioMark } from '../Radio/RadioMark';

export type ListRowTone = 'default' | 'danger';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Tints the icon tile (`soft` bg + `main` icon), e.g. the verification method picker. Default: neutral tile. */
  iconTone?: HueTone;
  /** Extra line under the subtitle (a `StatusPill`, a meta caption). */
  meta?: React.ReactNode;
  /** `danger` for destructive rows (delete account). */
  tone?: ListRowTone;
  /** Short text before the trailing slot (current language, balance). */
  value?: string;
  /** Default: chevron when pressable. Pass a `Switch`, `Badge`, `StatusPill`… or `null` for none. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  /**
   * Set (true or false) = one option of a single-choice list (channel picker): a radio
   * mark replaces the trailing slot and the picked row turns teal soft. Needs `onPress`.
   */
  selected?: boolean;
}

/** One settings/menu/navigation row. Group rows in `ListGroup`. */
const ListRowComponent: React.FC<ListRowProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconTone,
  meta,
  tone = 'default',
  value,
  trailing,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  selected,
}) => {
  const { colors, sizes, isRTL } = useTheme();
  const isDanger = tone === 'danger';
  const isOption = selected !== undefined;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const iconHue = iconTone ? resolveHue(colors, iconTone) : null;
  const iconBg = isDanger
    ? colors.status.danger.soft
    : selected
      ? colors.surface.main
      : iconHue?.soft ?? colors.surface.elevated;
  const iconColor = isDanger
    ? colors.status.danger.main
    : selected
      ? colors.interactive.main
      : iconHue?.main ?? colors.icon.primary;

  const trailingNode =
    loading ? (
      <ActivityIndicator size="small" color={colors.icon.secondary} />
    ) : isOption ? (
      <RadioMark selected={selected} />
    ) : trailing !== undefined ? (
      trailing
    ) : onPress && !isDanger ? (
      <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
    ) : null;

  const content = (
    <>
      {Icon ? (
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="md"
          bg={iconBg}
          align="center"
          justify="center"
        >
          <Icon
            size={sizes.icon.sm}
            color={iconColor}
            strokeWidth={iconStroke.regular}
          />
        </Box>
      ) : null}
      <Box flex={1} gap="xs">
        <Text variant="body" color={isDanger ? colors.status.danger.text : colors.text.primary}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.text.secondary}>
            {subtitle}
          </Text>
        ) : null}
        {meta}
      </Box>
      {value ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {value}
        </Text>
      ) : null}
      {trailingNode}
    </>
  );

  const rowProps = {
    row: true,
    align: 'center',
    gap: 'md',
    px: 'lg',
    py: 'md',
    minHeight: sizes.button.lg,
  } as const;

  if (!onPress) {
    return (
      <Box {...rowProps} accessible={!trailing} accessibilityLabel={accessibilityLabel}>
        {content}
      </Box>
    );
  }

  return (
    <Pressable
      {...rowProps}
      onPress={onPress}
      disabled={disabled || loading}
      opacity={disabled ? opacity.disabled : 1}
      bg={selected ? colors.interactive.soft : undefined}
      accessibilityRole={isOption ? 'radio' : 'button'}
      accessibilityLabel={accessibilityLabel ?? (value ? `${title}, ${value}` : title)}
      accessibilityHint={subtitle}
      accessibilityState={{ disabled: disabled || loading, busy: loading, checked: isOption ? selected : undefined }}
    >
      {content}
    </Pressable>
  );
};

export const ListRow = memo(ListRowComponent);
