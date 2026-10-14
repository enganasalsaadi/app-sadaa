import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Map } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Pressable, Text, useLoopClock } from '@/shared/ui';
import type { DealGuideModel } from '../hooks/useDealGuideScreen';

const STOP = moderateScale(34);
const RUN = moderateScale(46);

type GuideHeroProps = Pick<DealGuideModel, 'copy' | 'chapters' | 'jumpTo' | 'onBack' | 'onHeroLayout'>;

/**
 * Navy hero: «how does a deal complete?», a metro line of every chapter (tap jumps there) with a
 * light running along it, and three trust facts.
 */
const GuideHeroComponent: React.FC<GuideHeroProps> = ({ copy, chapters, jumpTo, onBack, onHeroLayout }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [metroWidth, setMetroWidth] = useState(0);
  const onMetroLayout = useCallback((event: LayoutChangeEvent) => setMetroWidth(event.nativeEvent.layout.width), []);
  const clock = useLoopClock(motion.loop.comet, !reduceMotion && metroWidth > 0);

  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'hero' | 'line' | 'run' | 'stop' | 'fact', ViewStyle> => ({
      hero: { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.sm },
      line: {
        position: 'absolute',
        top: STOP / 2 - 1,
        start: STOP / 2,
        end: STOP / 2,
        height: borderWidths.md,
        backgroundColor: colors.glass.border,
      },
      run: {
        position: 'absolute',
        top: STOP / 2 - 2,
        start: 0,
        width: RUN,
        height: 4,
        borderRadius: radii.full,
        backgroundColor: colors.glass.iconInteractive,
      },
      stop: {
        width: STOP,
        height: STOP,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      fact: {
        flex: 1,
        gap: spacing.xs,
        padding: spacing.sm,
        borderRadius: radii.lg,
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass, insets.top],
  );

  const runStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, metroWidth - RUN);
    const p = clock.value;
    return {
      opacity: reduceMotion ? 0 : Math.sin(p * Math.PI),
      transform: [{ translateX: (isRTL ? -1 : 1) * travel * p }],
    };
  }, [isRTL, metroWidth, reduceMotion]);

  const Back = isRTL ? ArrowRight : ArrowLeft;

  return (
    // Padding sits on this view, never on the gradient: a padded gradient clips to its content box.
    <Box style={styles.hero} onLayout={onHeroLayout}>
      <LinearGradient colors={colors.gradients.hero} style={StyleSheet.absoluteFill} />
      <Box row>
        <IconButton icon={Back} variant="overlay" tone="onBrand" onPress={onBack} accessibilityLabel={t('marketplace.guide.back')} />
      </Box>
      <Box row align="center" gap="xs" mt="md">
        <Map size={sizes.icon.xs} color={colors.glass.iconInteractive} />
        <Text variant="label" color={colors.glass.iconInteractive}>
          {t('marketplace.guide.kicker', { audience: copy.audience })}
        </Text>
      </Box>
      <Text variant="h1" color={colors.text.onBrand} accessibilityRole="header">
        {t('marketplace.guide.title')}
      </Text>
      <Text variant="bodySmall" color={colors.text.onBrandMuted}>
        {copy.sub}
      </Text>
      <Text variant="caption" color={colors.text.onBrandMuted}>
        {t('marketplace.guide.stations', { count: chapters.length })}
      </Text>
      <Box row justify="space-between" mt="lg" mb="xs" onLayout={onMetroLayout}>
        <Box style={styles.line} />
        <Animated.View style={[styles.run, runStyle]} pointerEvents="none" />
        {chapters.map((chapter, index) => {
          const Icon = chapter.icon;
          return (
            <Animated.View
              key={chapter.key}
              entering={reduceMotion ? undefined : ZoomIn.delay(200 + index * motion.stagger).springify()}
            >
              <Pressable
                style={styles.stop}
                hitSlop={sizes.hitSlop.sm}
                onPress={() => jumpTo(index)}
                accessibilityRole="button"
                accessibilityLabel={t('marketplace.guide.jump', { name: chapter.title })}
              >
                <Icon size={sizes.icon.xs} color={colors.text.onBrand} />
              </Pressable>
            </Animated.View>
          );
        })}
      </Box>
      <Box row gap="sm" mt="md">
        {copy.facts.map(fact => {
          const Icon = fact.icon;
          return (
            <Box key={fact.text} style={styles.fact}>
              <Icon size={sizes.icon.sm} color={colors.glass.iconInteractive} />
              <Text variant="caption" color={colors.text.onBrand}>
                {fact.text}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const GuideHero = memo(GuideHeroComponent);
