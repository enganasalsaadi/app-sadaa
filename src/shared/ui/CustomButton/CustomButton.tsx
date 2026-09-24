import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, Vibration } from 'react-native';
import type {
  PressableProps as RNPressableProps,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type {
  Mutable,
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
} from '@/core/theme/types';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import type { ButtonVariant, ButtonSize } from './styles';
import { getButtonHeight } from './styles';

interface IconProps {
  color?: string;
  size?: number;
}

interface CustomButtonProps
  extends Omit<RNPressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactElement<IconProps>;
  rightIcon?: React.ReactElement<IconProps>;
  noBorder?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  borderRadius?: RadiiToken;
  px?: SpacingToken;
  style?: ViewStyle;
}

const ACTIVE_OPACITY = 0.85;

const SIZE_PX: Record<ButtonSize, SpacingToken> = {
  sm: 'md',
  md: 'xl',
  lg: '2xl',
};

const SIZE_BORDER_WIDTH: Record<ButtonSize, BorderWidthToken> = {
  sm: 'thin',
  md: 'thin',
  lg: 'md',
};

const CustomButtonInner: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  noBorder = false,
  haptic = true,
  fullWidth = false,
  borderRadius = 'md',
  px: pxOverride,
  style,
  onPress,
  ...rest
}) => {
  const theme = useTheme();

  const vc = useMemo(() => theme.colors.button[variant], [variant, theme]);

  const buttonHeight = useMemo(
    () => getButtonHeight(size, theme),
    [size, theme],
  );

  const isDisabled = disabled || loading;
  const showBorder = variant === 'outline' && !noBorder;
  const horizPadding = pxOverride ?? SIZE_PX[size];

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (haptic && Platform.OS !== 'web') {
        Vibration.vibrate(5);
      }
      onPress?.(e);
    },
    [haptic, onPress],
  );

  const iconColor = vc.text;
  const iconSize = theme.sizes.icon.sm;

  const clonedLeftIcon = useMemo(
    () =>
      leftIcon
        ? React.cloneElement(leftIcon, { color: iconColor, size: iconSize })
        : null,
    [leftIcon, iconColor, iconSize],
  );

  const clonedRightIcon = useMemo(
    () =>
      rightIcon
        ? React.cloneElement(rightIcon, { color: iconColor, size: iconSize })
        : null,
    [rightIcon, iconColor, iconSize],
  );

  const mergedStyle = useMemo<ViewStyle>(() => {
    const s: Mutable<ViewStyle> = {};
    if (isDisabled) {
      s.opacity = 0.5;
    }
    if (fullWidth) {
      s.alignSelf = 'stretch';
    }
    return Object.keys(s).length > 0 || style ? { ...s, ...(style ?? {}) } : s;
  }, [isDisabled, fullWidth, style]);

  return (
    <Pressable
      bg={vc.bg}
      borderRadius={borderRadius}
      borderWidth={showBorder ? SIZE_BORDER_WIDTH[size] : 'none'}
      borderColor={showBorder ? vc.border : undefined}
      height={buttonHeight}
      px={horizPadding}
      gap="sm"
      row
      align="center"
      justify="center"
      scaleOnPress={true}
      activeOpacity={ACTIVE_OPACITY}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={mergedStyle}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={vc.text} size="small" />
      ) : (
        <>
          {clonedLeftIcon}
          <Text
            variant={size === 'sm' ? 'buttonSmall' : 'button'}
            color={vc.text}
          >
            {title}
          </Text>
          {clonedRightIcon}
        </>
      )}
    </Pressable>
  );
};

export const CustomButton = React.memo(CustomButtonInner);
