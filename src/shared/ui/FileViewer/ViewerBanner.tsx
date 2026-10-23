import React, { memo } from 'react';
import type { TextStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { CircleAlert, CircleCheck } from 'lucide-react-native';
import { iconStroke, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface ViewerBannerModel {
  tone: 'saved' | 'failed';
  message: string;
  action?: { label: string; onPress: () => void } | null;
}

export interface ViewerBannerProps {
  banner: ViewerBannerModel;
}

/**
 * The viewer's own toast (the app's toasts sit under the full-screen modal): «تم الحفظ في الصور ·
 * فتح», or why a save failed with a retry.
 */
const ViewerBannerComponent: React.FC<ViewerBannerProps> = ({ banner }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const styles = useStyles((): Record<'message', TextStyle> => ({ message: { flexShrink: 1 } }));
  const Icon = banner.tone === 'saved' ? CircleCheck : CircleAlert;
  const tint = banner.tone === 'saved' ? colors.viewer.saved : colors.viewer.danger;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(motion.duration.base)}
      exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.fast)}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Box
        row
        align="center"
        gap="sm"
        ps="lg"
        pe={banner.action ? 'xs' : 'lg'}
        py="xs"
        minHeight={sizes.button.md}
        borderRadius="full"
        bg={colors.viewer.dock}
        borderWidth="thin"
        borderColor={colors.viewer.glassBorder}
      >
        <Icon size={sizes.icon.sm} color={tint} strokeWidth={iconStroke.regular} />
        <Text variant="bodySmall" color={colors.viewer.text} numberOfLines={2} style={styles.message}>
          {banner.message}
        </Text>
        {banner.action ? (
          <Pressable
            onPress={banner.action.onPress}
            px="md"
            height={sizes.iconButton.sm}
            borderRadius="full"
            justify="center"
            hitSlop={sizes.hitSlop.sm}
            accessibilityRole="button"
            accessibilityLabel={banner.action.label}
          >
            <Text variant="buttonSmall" color={colors.viewer.accent}>
              {banner.action.label}
            </Text>
          </Pressable>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const ViewerBanner = memo(ViewerBannerComponent);
