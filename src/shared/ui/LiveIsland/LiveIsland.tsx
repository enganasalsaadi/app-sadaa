import React, { memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { LiveDot } from '../LiveDot';

/** `live`: something is happening (review in progress) · `warning` / `danger`: the user must act. */
export type LiveIslandTone = 'live' | 'warning' | 'danger';

export interface LiveIslandProps {
  title: string;
  /** One supporting line; clipped to two. */
  message?: string;
  tone?: LiveIslandTone;
  /** Makes the island a button (chevron shown). */
  onPress?: () => void;
  /** What the tap does, for screen readers (the action label, e.g. "Add prices"). */
  accessibilityHint?: string;
}

const Content = memo<Omit<LiveIslandProps, 'onPress' | 'accessibilityHint'> & { pressable: boolean }>(
  ({ title, message, tone = 'live', pressable }) => {
    const { colors, sizes, isRTL } = useTheme();
    const Chevron = isRTL ? ChevronLeft : ChevronRight;
    const dot = {
      live: colors.glass.iconInteractive,
      warning: colors.glass.iconWarning,
      danger: colors.glass.iconDanger,
    }[tone];

    return (
      <>
        <LiveDot color={dot} />
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={1}>
            {title}
          </Text>
          {message ? (
            <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </Box>
        {pressable ? <Chevron size={sizes.icon.sm} color={colors.text.onBrandMuted} /> : null}
      </>
    );
  },
);

/**
 * The one live event or blocker in a navy hero (rule 09 §3.1): a glass island with a
 * pulsing dot. Slides in once on mount. Navy surfaces only (glass rule, rule 08).
 */
const LiveIslandComponent: React.FC<LiveIslandProps> = ({ onPress, accessibilityHint, ...content }) => {
  const { colors, sizes } = useTheme();
  const surface = {
    row: true,
    align: 'center',
    gap: 'md',
    px: 'lg',
    py: 'sm',
    minHeight: sizes.button.lg,
    borderRadius: 'xl',
    borderWidth: 'thin',
    borderColor: colors.glass.border,
    bg: colors.glass.fill,
  } as const;
  const label = [content.title, content.message].filter(Boolean).join('. ');

  return (
    <Animated.View entering={FadeInDown.duration(motion.duration.rise)}>
      {onPress ? (
        <Pressable
          {...surface}
          onPress={onPress}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
        >
          <Content {...content} pressable />
        </Pressable>
      ) : (
        <Box {...surface} accessible accessibilityRole="text" accessibilityLabel={label}>
          <Content {...content} pressable={false} />
        </Box>
      )}
    </Animated.View>
  );
};

export const LiveIsland = memo(LiveIslandComponent);
