import React, { useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import type { TypographyVariant, SpacingToken } from '@/core/theme/types';
import {
  moderateVerticalScale,
  percentageOfWidth,
} from '@/core/theme/utils/responsive';

const BACK_CIRCLE_SIZE = 36;

export type ScreenHeaderVariant = 'solid' | 'transparent';

export interface ScreenHeaderProps {
  // Content
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;

  // Variant
  variant?: ScreenHeaderVariant;

  // Back button
  onBackPress?: () => void;
  showBackButton?: boolean;
  backIconColor?: string;
  backIconSize?: number;
  backButtonCircleBg?: string;
  showBackButtonCircle?: boolean;

  // Title
  titleColor?: string;
  titleVariant?: TypographyVariant;
  titleNumberOfLines?: number;

  // Subtitle
  subtitleColor?: string;
  subtitleVariant?: TypographyVariant;

  // Container
  backgroundColor?: string;
  px?: SpacingToken;
  py?: SpacingToken;

  // Safe area — applied automatically in transparent mode (adds insets.top to paddingTop)
  withSafeArea?: boolean;

  /**
   * Solid mode only. Extends the header background behind the status bar so there
   * is no colour gap between the status-bar area and the header content area.
   *
   * When true:
   *  - adds insets.top to paddingTop (header paints over the safe-area zone)
   *  - the Layout that wraps this screen must use edges={['left', 'right']} to
   *    avoid doubling the top inset padding.
   *
   * Default: false
   */
  fillStatusBar?: boolean;

  /**
   * Controls the status-bar icon / text colour (visible clock, battery, signal).
   * 'auto' → 'dark-content' for solid, 'light-content' for transparent.
   * Only the status bar is affected — the Android bottom navigation bar is untouched.
   * Default: 'auto'
   */
  statusBarStyle?: 'light-content' | 'dark-content' | 'auto';
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  rightContent,
  variant = 'solid',
  onBackPress,
  showBackButton = true,
  backIconColor,
  backIconSize = 22,
  backButtonCircleBg,
  showBackButtonCircle,
  titleColor,
  titleVariant = 'title',
  titleNumberOfLines = 1,
  subtitleColor,
  subtitleVariant = 'caption',
  backgroundColor,
  px = 'lg',
  py = 'lg',
  withSafeArea,
  fillStatusBar = false,
  statusBarStyle = 'auto',
}) => {
  const { colors, spacing, zIndices, isRTL, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const isTransparent = variant === 'transparent';
  const shouldShowCircle = showBackButtonCircle ?? isTransparent;

  // fillStatusBar implies safe-area handling for solid mode.
  const shouldUseSafeArea = withSafeArea ?? (isTransparent || fillStatusBar);

  // Transparent headers sit over hero imagery, so they use the on-brand (light) text.
  const resolvedBackIconColor =
    backIconColor ?? (isTransparent ? colors.text.onBrand : colors.icon.primary);
  const resolvedTitleColor =
    titleColor ?? (isTransparent ? colors.text.onBrand : colors.text.primary);
  const resolvedSubtitleColor =
    subtitleColor ??
    (isTransparent ? colors.text.onBrand : colors.text.secondary);
  const resolvedCircleBg = backButtonCircleBg ?? colors.overlay;
  const resolvedStatusBarStyle =
    statusBarStyle === 'auto'
      ? isTransparent
        ? 'light-content'
        : isDark
        ? 'light-content'
        : 'dark-content'
      : statusBarStyle;

  const handleBack = onBackPress ?? goBack;

  const safeAreaPad = shouldUseSafeArea ? insets.top : 0;
  const pyVal = spacing[py];
  const pxVal = spacing[px];

  const headerBg = backgroundColor ?? colors.surface.main;

  const containerStyle: ViewStyle = {
    paddingHorizontal: pxVal,
    paddingTop: safeAreaPad + pyVal,
    paddingBottom: pyVal,
    ...(isTransparent
      ? {
          position: 'absolute',
          top: 0,
          start: 0,
          end: 0,
          zIndex: zIndices.header,
        }
      : {
          backgroundColor: headerBg,
        }),
  };

  // Title box is absolutely positioned to guarantee true centering.
  // Vertical bounds are clamped to the content area (excluding safe area + padding).
  const titleBoxStyle: ViewStyle = {
    start: 0,
    end: 0,
    top: safeAreaPad + pyVal,
    bottom: pyVal,
  };

  // Horizontal padding prevents title text from overlapping side buttons.
  const titleTextStyle = useMemo(
    () => ({ paddingHorizontal: pxVal + percentageOfWidth(20) + spacing.xs }),
    [pxVal, spacing.xs],
  );

  const renderBackButtonIcon = useCallback(() => {
    return isRTL ? (
      <ArrowRight
        size={backIconSize}
        color={resolvedBackIconColor}
        strokeWidth={2}
      />
    ) : (
      <ArrowLeft
        size={backIconSize}
        color={resolvedBackIconColor}
        strokeWidth={2}
      />
    );
  }, [isRTL, backIconSize, resolvedBackIconColor]);

  return (
    <Box row align="center" style={containerStyle} justify="center">
      {/* StatusBar: only controls icon colour, never touches the nav bar */}
      <StatusBar barStyle={resolvedStatusBarStyle} />

      {/* Left: back button */}
      <Box justify="center" height={moderateVerticalScale(27)}>
        {showBackButton && (
          <Pressable onPress={handleBack} hitSlop={12}>
            {shouldShowCircle ? (
              <Box
                width={BACK_CIRCLE_SIZE}
                height={BACK_CIRCLE_SIZE}
                borderRadius="full"
                align="center"
                justify="center"
                bg={resolvedCircleBg}
              >
                {renderBackButtonIcon()}
              </Box>
            ) : (
              <>{renderBackButtonIcon()}</>
            )}
          </Pressable>
        )}
      </Box>

      {/* Center: absolutely positioned so the title is always geometrically centered
          regardless of how wide the left/right content is. pointerEvents="none" lets
          touches pass through to the back/right buttons beneath. */}
      <Box
        position="absolute"
        style={titleBoxStyle}
        align="center"
        justify="center"
        pointerEvents="none"
        height={moderateVerticalScale(27)}
      >
        <Text
          variant={titleVariant}
          color={resolvedTitleColor}
          align="center"
          numberOfLines={titleNumberOfLines}
          style={titleTextStyle}
        >
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text
            variant={subtitleVariant}
            color={resolvedSubtitleColor}
            align="center"
            numberOfLines={1}
            style={titleTextStyle}
          >
            {subtitle}
          </Text>
        )}
      </Box>

      {/* Spacer pushes right content to the trailing edge */}
      <Box flex={1} />

      {/* Right: optional content; minWidth keeps the layout symmetric when empty */}
      <Box align="flex-end" justify="center">
        {rightContent}
      </Box>
    </Box>
  );
};
