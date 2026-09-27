import React, { memo } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type DerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { IconButton } from '../IconButton';
import { Badge } from '../Badge';
import { resolveHeaderColors } from './headerColors';

/** `solid`: surface bar · `brand`: navy bar (identity screens) · `transparent`: over hero imagery. */
export type ScreenHeaderVariant = 'solid' | 'brand' | 'transparent';

export interface ScreenHeaderAction {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  /** Unread count on the icon (inbox, notifications). */
  badge?: number;
}

/** Scroll-driven progress values (0 → 1), fed by `Layout`'s header behaviours. */
export interface ScreenHeaderMotion {
  /** Fades the bar background in (overlay header over a hero). */
  background?: DerivedValue<number>;
  /** Fades the bar title in (collapse / overlay). */
  title?: DerivedValue<number>;
  /** Bottom divider, shown once content scrolls under the bar. */
  divider?: DerivedValue<number>;
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Default `solid`. */
  variant?: ScreenHeaderVariant;
  /** Default true. */
  showBackButton?: boolean;
  /** Default `goBack()`. */
  onBackPress?: () => void;
  /** Trailing icon actions. Two at most, so the title keeps its room. */
  actions?: readonly [ScreenHeaderAction] | readonly [ScreenHeaderAction, ScreenHeaderAction];
  /** Paints behind the status bar (adds the top inset). Default true. */
  withSafeArea?: boolean;
  motion?: ScreenHeaderMotion;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const HeaderActionButton = memo<{ action: ScreenHeaderAction; variant: ScreenHeaderVariant }>(
  ({ action, variant }) => {
    const { colors } = useTheme();
    const button = resolveHeaderColors(colors, variant).button;
    const styles = useStyles(({ spacing }) => ({
      badge: { position: 'absolute' as const, top: spacing.xs, end: spacing.xs },
    }));

    return (
      <Box>
        <IconButton
          icon={action.icon}
          variant={button.variant}
          tone={button.tone}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
        />
        {action.badge ? (
          <Box style={styles.badge} pointerEvents="none">
            <Badge count={action.badge} />
          </Box>
        ) : null}
      </Box>
    );
  },
);

/**
 * Top bar: back button, centred title, up to two icon actions. Side slots share
 * one width so the title stays centred whatever sits beside it.
 */
const ScreenHeaderComponent: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  variant = 'solid',
  showBackButton = true,
  onBackPress,
  actions,
  withSafeArea = true,
  motion,
  onLayout,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing, isRTL } = useTheme();
  const { top } = useSafeAreaInsets();

  const fades = motion?.background != null;
  const palette = resolveHeaderColors(colors, variant);
  // A transparent bar fading in over a hero becomes a surface bar: dark text on light.
  const onFaded = fades && variant === 'transparent';
  const fadeBg = onFaded ? colors.surface.main : palette.bg;
  const titleColor = onFaded ? colors.text.primary : palette.title;
  const subtitleColor = onFaded ? colors.text.secondary : palette.subtitle;

  const slots = Math.max(showBackButton ? 1 : 0, actions?.length ?? 0);
  const sideWidth = slots * sizes.iconButton.md + Math.max(slots - 1, 0) * spacing.xs;

  const styles = useStyles(
    (theme): Record<'container' | 'side' | 'title' | 'divider', ViewStyle> => ({
      container: {
        paddingTop: (withSafeArea ? top : 0) + theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm,
        backgroundColor: fades ? theme.colors.layout.transparent : palette.bg,
      },
      side: { width: sideWidth, flexDirection: 'row', gap: theme.spacing.xs },
      title: { flex: 1, alignItems: 'center', paddingHorizontal: theme.spacing.xs },
      divider: {
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border.default,
      },
    }),
    [withSafeArea, top, fades, palette.bg, sideWidth],
  );

  const backgroundProgress = motion?.background;
  const titleProgress = motion?.title;
  const dividerProgress = motion?.divider;

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundProgress ? backgroundProgress.value : 1,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleProgress ? titleProgress.value : 1,
  }));
  const dividerStyle = useAnimatedStyle(() => ({
    opacity: dividerProgress ? dividerProgress.value : 0,
  }));

  return (
    <Box style={styles.container} onLayout={onLayout}>
      {fades ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: fadeBg }, backgroundStyle]}
        />
      ) : null}

      <Box row align="center" minHeight={sizes.iconButton.md}>
        <Box style={styles.side}>
          {showBackButton ? (
            <IconButton
              icon={isRTL ? ArrowRight : ArrowLeft}
              variant={palette.button.variant}
              tone={palette.button.tone}
              onPress={onBackPress ?? goBack}
              accessibilityLabel={t('common.back')}
            />
          ) : null}
        </Box>

        <Animated.View style={[styles.title, titleStyle]}>
          <Text
            variant="title"
            color={titleColor}
            align="center"
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={subtitleColor} align="center" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Animated.View>

        <Box style={styles.side} justify="flex-end">
          {actions?.map(action => (
            <HeaderActionButton
              key={action.accessibilityLabel}
              action={action}
              variant={variant}
            />
          ))}
        </Box>
      </Box>

      <Animated.View pointerEvents="none" style={[styles.divider, dividerStyle]} />
    </Box>
  );
};

export const ScreenHeader = memo(ScreenHeaderComponent);
