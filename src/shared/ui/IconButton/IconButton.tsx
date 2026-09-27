import React, { memo, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import type { BorderWidthToken, HueColors, Theme } from '@/core/theme';
import { Pressable } from '../primitives/Pressable';

/** `overlay`: scrim circle for icons over photos / hero imagery (header over a hero). */
export type IconButtonVariant = 'ghost' | 'soft' | 'solid' | 'outline' | 'overlay';
export type IconButtonSize = 'sm' | 'md';
/** `onBrand`: on navy surfaces (brand header, hero). */
export type IconButtonTone = 'default' | 'danger' | 'onBrand';

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required: an icon alone says nothing to a screen reader. */
  accessibilityLabel: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  disabled?: boolean;
  loading?: boolean;
}

interface IconButtonColors {
  bg: string;
  icon: string;
  border: string;
  borderWidth: BorderWidthToken;
}

const resolveColors = (
  colors: Theme['colors'],
  variant: IconButtonVariant,
  tone: IconButtonTone,
): IconButtonColors => {
  const clear = colors.layout.transparent;
  if (variant === 'overlay') {
    return { bg: colors.overlay, icon: colors.text.onBrand, border: clear, borderWidth: 'none' };
  }
  if (tone === 'onBrand') {
    switch (variant) {
      case 'ghost':
        return { bg: clear, icon: colors.text.onBrand, border: clear, borderWidth: 'none' };
      case 'soft':
        return { bg: colors.glass.badge, icon: colors.text.onBrand, border: clear, borderWidth: 'none' };
      case 'solid':
        return {
          bg: colors.button.onBrand.bg,
          icon: colors.button.onBrand.text,
          border: clear,
          borderWidth: 'none',
        };
      case 'outline':
        return { bg: clear, icon: colors.text.onBrand, border: colors.glass.border, borderWidth: 'thin' };
      default: {
        const _exhaustive: never = variant;
        return _exhaustive;
      }
    }
  }
  const accent: HueColors = tone === 'danger' ? colors.status.danger : colors.interactive;
  const iconColor = tone === 'danger' ? colors.status.danger.main : colors.icon.primary;
  switch (variant) {
    case 'soft':
      return {
        bg: tone === 'danger' ? accent.soft : colors.surface.elevated,
        icon: iconColor,
        border: clear,
        borderWidth: 'none',
      };
    case 'solid':
      return { bg: accent.main, icon: colors.text.onAccent, border: clear, borderWidth: 'none' };
    case 'outline':
      return {
        bg: colors.surface.main,
        icon: iconColor,
        border: colors.border.default,
        borderWidth: 'thin',
      };
    case 'ghost':
      return { bg: clear, icon: iconColor, border: clear, borderWidth: 'none' };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
};

const IconButtonComponent: React.FC<IconButtonProps> = ({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  size = 'md',
  tone = 'default',
  disabled = false,
  loading = false,
}) => {
  const { colors, sizes } = useTheme();

  const palette = useMemo(() => resolveColors(colors, variant, tone), [colors, tone, variant]);

  const dimension = sizes.iconButton[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      width={dimension}
      height={dimension}
      align="center"
      justify="center"
      borderRadius="full"
      bg={palette.bg}
      borderWidth={palette.borderWidth}
      borderColor={palette.border}
      opacity={disabled ? opacity.disabled : 1}
      // `sm` (36) reaches the 44pt target through hit slop.
      hitSlop={size === 'sm' ? sizes.hitSlop.sm : undefined}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.icon} />
      ) : (
        <Icon
          size={size === 'sm' ? sizes.icon.sm : sizes.icon.md}
          color={palette.icon}
          strokeWidth={iconStroke.regular}
        />
      )}
    </Pressable>
  );
};

export const IconButton = memo(IconButtonComponent);
