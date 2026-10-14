import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Text } from '@/shared/ui';
import type { DealGuideModel } from '../hooks/useDealGuideScreen';

/** How far before the hero's end the bar starts sliding in. */
const SHOW_BEFORE = 110;
const SLIDE = 160;

type GuideBarProps = Pick<
  DealGuideModel,
  'chapters' | 'current' | 'scrollY' | 'viewport' | 'contentHeight' | 'heroHeight' | 'onBack' | 'onBarLayout'
>;

/** Slides in once the hero is gone: «station n of N», the chapter's title and reading progress. */
const GuideBarComponent: React.FC<GuideBarProps> = ({
  chapters,
  current,
  scrollY,
  viewport,
  contentHeight,
  heroHeight,
  onBack,
  onBarLayout,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles(
    ({ spacing, shadows, zIndices }): Record<'bar' | 'track' | 'fill', ViewStyle> => ({
      bar: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        zIndex: zIndices.sticky,
        paddingTop: insets.top,
        backgroundColor: colors.layout.base,
        ...shadows.md,
      },
      track: { height: spacing.xs, backgroundColor: colors.surface.elevated },
      fill: { height: '100%', backgroundColor: colors.interactive.main },
    }),
    [colors.interactive.main, colors.layout.base, colors.surface.elevated, insets.top],
  );

  const barStyle = useAnimatedStyle(() => {
    const shown = heroHeight.value > 0 && scrollY.value > heroHeight.value - SHOW_BEFORE ? 1 : 0;
    return {
      transform: [{ translateY: withTiming((shown - 1) * SLIDE, { duration: motion.duration.slow }) }],
      opacity: withTiming(shown, { duration: motion.duration.base }),
    };
  });
  const fillStyle = useAnimatedStyle(() => {
    const range = Math.max(1, contentHeight.value - viewport.value);
    const read = Math.min(1, Math.max(0, scrollY.value / range));
    return { width: `${read * 100}%` };
  });

  const chapter = chapters[current];
  const Back = isRTL ? ArrowRight : ArrowLeft;

  return (
    <Animated.View style={[styles.bar, barStyle]} onLayout={onBarLayout} pointerEvents="box-none">
      <Box row align="center" gap="md" px="lg" py="sm">
        <IconButton icon={Back} variant="soft" onPress={onBack} accessibilityLabel={t('marketplace.guide.back')} />
        <Box flex={1}>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.guide.barStation', { current: current + 1, total: chapters.length })}
          </Text>
          <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
            {chapter?.title ?? ''}
          </Text>
        </Box>
      </Box>
      <Box style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </Box>
    </Animated.View>
  );
};

export const GuideBar = memo(GuideBarComponent);
